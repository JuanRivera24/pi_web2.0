"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
// Firebase Imports
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
// CORRECCIÓN: 'setLogLevel' eliminado porque no se usaba.
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp, Firestore, doc } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, Auth } from 'firebase/auth';

// --- Declaración de Variables Globales ---
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
  var __initial_auth_token: string | undefined;
}
// --- Fin Declaración ---


// --- Tipos ---
interface Message {
  id: string;
  senderId: string; // ID de Clerk (se usa para enviar)
  senderType: 'client' | 'barber';
  text: string;
  timestamp: Timestamp | null;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  citaId: string;
  currentUserId: string; // Clerk ID (se usa para enviar)
  currentUserType: 'client' | 'barber'; // Se usa para la ALINEACIÓN
}

// --- CONSTANTE App ID ---
// const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // No se usa en la ruta simplificada

// --- Instancias de Firebase (globales al módulo, inicializadas una vez) ---
let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let firebaseInitializationError: string | null = null;

// --- Función para inicializar Firebase (se llama una vez) ---
function initializeFirebaseIfNeeded(): boolean {
    if (app) return true;
    if (typeof window === 'undefined') return false;

    console.log("ChatModal: Attempting Firebase Initialization...");
    try {
        let config: FirebaseOptions | null = null;
        if (typeof __firebase_config !== 'undefined' && __firebase_config.trim() !== '{}' && __firebase_config.trim() !== '') {
            try {
                const parsedConfig = JSON.parse(__firebase_config);
                if (parsedConfig.projectId && parsedConfig.apiKey && parsedConfig.authDomain) {
                    console.log("ChatModal: Using config from __firebase_config");
                    config = parsedConfig;
                } else {
                    console.warn("ChatModal: __firebase_config found but incomplete:", __firebase_config);
                }
            } catch (e) {
                console.error("ChatModal: Error parsing __firebase_config:", e);
            }
        }

        if (!config) {
            const envConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };
            if (envConfig.projectId && envConfig.apiKey && envConfig.authDomain) {
                console.log("ChatModal: Using config from environment variables (.env.local)");
                config = envConfig as FirebaseOptions;
            }
        }

        if (!config || !config.projectId || !config.apiKey || !config.authDomain) {
            throw new Error("Configuración de Firebase incompleta. Falta projectId, apiKey o authDomain.");
        }

        if (!getApps().length) {
            app = initializeApp(config);
            console.log("ChatModal: Firebase Initialized");
        } else {
            app = getApp();
            console.log("ChatModal: Firebase App Retrieved");
        }
        dbInstance = getFirestore(app);
        authInstance = getAuth(app);
        firebaseInitializationError = null;
        return true;

    // CORRECCIÓN: Cambiado 'e: any' por 'e: unknown' para cumplir la regla no-explicit-any
    } catch (e: unknown) {
        console.error("ChatModal: Error initializing Firebase:", e);
        // Comprobación segura del tipo de error
        let errorMessage = 'Configuración inválida.';
        if (e instanceof Error) {
            errorMessage = e.message;
        }
        firebaseInitializationError = `Error al inicializar Firebase: ${errorMessage}`;
        return false;
    }
}

// --- Componente ChatModal ---
export default function ChatModal({
  isOpen,
  onClose,
  citaId,
  currentUserId, // Clerk ID
  currentUserType, // 'client' o 'barber'
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const authListenerUnsubscribeRef = useRef<(() => void) | null>(null);

  // --- Inicialización y Autenticación ---
  useEffect(() => {
    if (isOpen) {
        const initialized = initializeFirebaseIfNeeded();
        setIsFirebaseReady(initialized);
        if (!initialized) {
            console.error("ChatModal: Firebase initialization failed.");
            setError(firebaseInitializationError);
            setIsLoading(false);
        } else if (authInstance && !authListenerUnsubscribeRef.current) {
             authListenerUnsubscribeRef.current = onAuthStateChanged(authInstance, async (user) => {
               if (user) {
                 if (!isAuthReady) setIsAuthReady(true);
                 setError(null);
               } else {
                   if (isAuthReady) {
                         console.log("ChatModal: Auth state changed - User logged out?");
                         setIsAuthReady(false);
                         setError("Sesión cerrada. Por favor, cierra y vuelve a abrir el chat.");
                         setMessages([]);
                   } else {
                         setIsAuthReady(false);
                         console.log("ChatModal: Auth state changed - No user. Attempting auth...");
                         setError("Autenticando...");
                         try {
                           if (!authInstance) { throw new Error("Auth instance not available."); }
                           if (typeof __initial_auth_token !== 'undefined') {
                             await signInWithCustomToken(authInstance, __initial_auth_token);
                           } else {
                             await signInAnonymously(authInstance);
                           }
                         // CORRECCIÓN: Cambiado 'authError: any' por 'authError: unknown'
                         } catch (authError: unknown) {
                           console.error("ChatModal: Error during initial auth:", authError);
                           // Comprobación segura para errores de Firebase (que suelen tener .code)
                           let errorMessage = "Error desconocido";
                           if (typeof authError === 'object' && authError !== null && ('code' in authError || 'message' in authError)) {
                               const err = authError as { code?: string, message?: string };
                               errorMessage = err.code || err.message || "Error desconocido";
                           } else if (authError instanceof Error) {
                               errorMessage = authError.message;
                           }
                           setError(`Error de autenticación: ${errorMessage}`);
                           setIsAuthReady(true); // Se marca como listo para mostrar el error
                         }
                   }
               }
             });
        }
    } else {
        // --- LIMPIEZA AL CERRAR ---
        if (authListenerUnsubscribeRef.current) {
            authListenerUnsubscribeRef.current();
            authListenerUnsubscribeRef.current = null;
        }
        setIsFirebaseReady(false);
        setIsAuthReady(false);
        setError(null);
        setMessages([]);
        setIsLoading(false);
    }
  }, [isOpen, isAuthReady]);


  // Efecto para escuchar mensajes
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    if (isOpen && citaId && isFirebaseReady && isAuthReady && dbInstance && authInstance?.currentUser) {
        setIsLoading(true);
        
        // Solo limpiar error si NO es un error de inicialización o auth
        if (error && !error.startsWith("Error al inicializar") && !error.startsWith("Error de autenticación")) {
          setError(null);
        }

        const chatDocRef = doc(dbInstance, 'public_chats', citaId);
        const messagesCollectionRef = collection(chatDocRef, 'messages');
        const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          setError(null);
          const fetchedMessages: Message[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedMessages.push({
                id: doc.id,
                senderId: data.senderId,
                senderType: data.senderType,
                text: data.text,
                timestamp: data.timestamp instanceof Timestamp ? data.timestamp : null
            } as Message);
          });
          setMessages(fetchedMessages);
          setIsLoading(false);
        
        // CORRECCIÓN: Cambiado 'err' por 'err: unknown' para cumplir la regla no-explicit-any
        }, (err: unknown) => {
          console.error("ChatModal: Error fetching messages (onSnapshot): ", err);
          
          let errorCode: string | undefined;
          let errorMessage: string = "Error desconocido";

          if (err instanceof Error) {
              errorMessage = err.message;
          }
          // CORRECCIÓN: Acceso seguro a 'code'
          if (typeof err === 'object' && err !== null && 'code' in err) {
              errorCode = (err as { code: string }).code;
          }

          console.error("ChatModal: Error Code:", errorCode || "N/A");
          console.error("ChatModal: Firebase User when error occurred:", authInstance?.currentUser?.uid || "No user");
          setError(`No se pudieron cargar los mensajes. Error: ${ errorCode || errorMessage}`);
          setIsLoading(false);
        });

    } else {
        if (!error && isOpen) {
            // setIsLoading(false); // No poner loading false aquí
        }
    }

    return () => {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
    }
  // CORRECCIÓN: Añadida dependencia 'error' que se usa en la limpieza de errores
  }, [isOpen, citaId, isFirebaseReady, isAuthReady, error]);


  // Auto-scroll al final
  useEffect(() => {
    if(!isLoading && messagesEndRef.current) {
       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);


  // Enviar mensaje
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const currentText = newMessage;
    // Agregamos currentUserId a la validación ya que lo estamos usando para enviar el mensaje
    if (currentText.trim() === '' || !citaId || !isFirebaseReady || !isAuthReady || !dbInstance || !authInstance?.currentUser || !currentUserId) {
        setError("No se puede enviar mensaje: Conexión o autenticación no lista.");
        return;
    }

    setNewMessage('');

    const chatDocRef = doc(dbInstance, 'public_chats', citaId);
    const messagesCollectionRef = collection(chatDocRef, 'messages');

    try {
      await addDoc(messagesCollectionRef, {
        // --- !!! CORRECCIÓN LÓGICA (PARA ENVIAR) !!! ---
        // Usamos el ID de Clerk (prop) como senderId real
        senderId: currentUserId, 
        senderType: currentUserType, // 'client' o 'barber'
        text: currentText,
        timestamp: serverTimestamp(),
      });
      setError(null);
    // CORRECCIÓN: Cambiado 'err: any' por 'err: unknown'
    } catch (err: unknown) {
      console.error("Error sending message: ", err);
      
      let errorCode: string | undefined;
      let errorMessage: string = "Error desconocido";

      if (err instanceof Error) {
          errorMessage = err.message;
      }
      // CORRECCIÓN: Acceso seguro a 'code'
      if (typeof err === 'object' && err !== null && 'code' in err) {
          errorCode = (err as { code: string }).code;
      }

      console.error("ChatModal: Error Code on Write:", errorCode || "N/A");
      console.error("ChatModal: Firebase User when write error occurred:", authInstance?.currentUser?.uid || "No user");
      setError(`No se pudo enviar el mensaje. Error: ${errorCode || errorMessage}`);
      setNewMessage(currentText);
    }
  }, [newMessage, citaId, currentUserType, currentUserId, isFirebaseReady, isAuthReady]);


  // Determinar estado general para UI
  const getChatStateMessage = () => {
      if (error) return <p className="text-center text-red-400 py-4">{error}</p>;
      if (!isFirebaseReady) return <p className="text-center text-gray-400 italic py-4">Inicializando conexión...</p>;
      if (!isAuthReady) return <p className="text-center text-gray-400 italic py-4">Autenticando...</p>;
      if (isLoading) return <p className="text-center text-gray-400 italic py-4">Cargando mensajes...</p>;
      if (messages.length === 0) return <p className="text-center text-gray-500 italic py-4">Aún no hay mensajes. ¡Inicia la conversación!</p>;
      return null;
  }
  const chatStateMessage = getChatStateMessage();
  const canSendMessage = isFirebaseReady && isAuthReady && authInstance?.currentUser && !isLoading && !error?.startsWith("Error al inicializar") && !error?.startsWith("Error de autenticación");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gray-900 text-white w-full max-w-lg h-[70vh] rounded-2xl shadow-2xl flex flex-col ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">
                Chat (Cita ID: ...{citaId.slice(-6)})
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                aria-label="Cerrar chat"
              >
                <X />
              </button>
            </div>

            {/* Cuerpo (Mensajes) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatStateMessage}
              {!chatStateMessage && messages.map((msg) => {
                  // --- !!! CORRECCIÓN CRUCIAL PARA LA ALINEACIÓN !!! ---
                  // Volvemos a comparar el TIPO de remitente del mensaje (guardado en DB)
                  // con el TIPO de este modal (pasado por props) para la visualización.
                  const isCurrentUser = msg.senderType === currentUserType;
                  // --- !!! FIN CORRECCIÓN !!! ---
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg shadow ${
                          isCurrentUser
                            ? 'bg-blue-600 text-white rounded-br-none' // Estilo "mío"
                            : 'bg-gray-700 text-gray-200 rounded-bl-none' // Estilo "del otro"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.text}</p>
                        {msg.timestamp && (
                            <p className={`text-xs mt-1 ${ isCurrentUser ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                                {msg.timestamp.toDate().toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit'})}
                            </p>
                        )}
                      </div>
                    </div>
                  );
              })}
              <div ref={messagesEndRef} style={{ height: '1px' }} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={!canSendMessage ? "Conectando..." : "Escribe tu mensaje..."}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!canSendMessage}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white rounded-lg p-2.5 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={newMessage.trim() === '' || !canSendMessage}
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
                </button>
              </div>
                {error === "No se pudo enviar el mensaje." && <p className="text-red-400 text-xs mt-1 pl-1">{error}</p>}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}