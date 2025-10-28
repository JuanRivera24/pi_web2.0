"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, Scissors, MapPin, Edit, Trash2, X, MessageSquare } from "lucide-react";
import { AppointmentEvent } from "./AppointmentCalendar"; // Asegúrate que la ruta sea correcta
import ChatModal from "./ChatModal"; // Importar el ChatModal
import { useUser } from "@clerk/nextjs"; // Importar useUser para obtener el ID del cliente

// --- INTERFACES DE PROPS ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointments: AppointmentEvent[];
    onEditAppointment: (appointment: AppointmentEvent) => void;
    onDeleteAppointment: (appointmentId: string) => void;
    // Pasamos los datos maestros para obtener nombres
    servicios: { id: string | number; nombreServicio: string }[];
    barberos: { id: string; nombreBarbero: string; apellidoBarbero: string }[];
    sedes: { id: string; nombreSede: string }[];
}

export default function UserAppointmentModal({
    isOpen,
    onClose,
    appointments,
    onEditAppointment,
    onDeleteAppointment,
    servicios,
    barberos,
    sedes,
}: ModalProps) {

    // --- OBTENER USUARIO ACTUAL (Clerk) ---
    const { user } = useUser();

    // Estado para evitar errores de hidratación al formatear fechas
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    // --- NUEVO ESTADO PARA CONTROLAR EL MODAL DE CHAT ---
    const [chattingCitaId, setChattingCitaId] = useState<string | null>(null);


    // Función para obtener los nombres de los servicios
    const getServiceNames = (serviceIds: string[]) => {
        return serviceIds
            .map(id => servicios.find(s => String(s.id) === String(id))?.nombreServicio)
            .filter(Boolean)
            .join(', ');
    };

    // Función para obtener el nombre del barbero
    const getBarberName = (barberId: string) => {
        const barbero = barberos.find(b => String(b.id) === String(barberId));
        return barbero ? `${barbero.nombreBarbero} ${barbero.apellidoBarbero || ''}` : "Barbero";
    };

    // Función para obtener el nombre de la sede
    const getSedeName = (sedeId: string) => {
        return sedes.find(s => String(s.id) === String(sedeId))?.nombreSede || "Sede";
    };

    // --- NUEVA FUNCIÓN PARA ABRIR EL CHAT ---
    const handleOpenChat = (citaId: string) => {
        // Solo abre el chat si tenemos la ID del usuario de Clerk
        if (user?.id) {
            setChattingCitaId(citaId);
        } else {
            console.error("User ID not available to open chat.");
            // Opcional: Mostrar un toast al usuario indicando que no se pudo abrir el chat
        }
    };

    return (
        <> {/* Fragmento para incluir ambos modales al mismo nivel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-gray-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative my-8 ring-1 ring-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                aria-label="Cerrar modal"
                            >
                                <X />
                            </button>
                            <h3 className="text-2xl font-semibold text-white text-center mb-6">
                                Mis Citas Activas
                            </h3>

                            {appointments.length === 0 ? (
                                <div className="text-center p-8">
                                    <h3 className="text-xl font-semibold text-white">No hay citas programadas</h3>
                                    <p className="text-gray-400 mt-2">Tu agenda está libre por ahora.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                    {appointments.map((cita) => {
                                        const fechaCita = new Date(cita.start);
                                        const serviciosTexto = getServiceNames(cita.servicioIds);
                                        const nombreBarbero = getBarberName(cita.barberoId);
                                        const nombreSede = getSedeName(cita.sedeId);

                                        return (
                                            <div key={cita.id} className="bg-gray-700 p-5 rounded-xl border border-white/10 shadow-lg">
                                                <h3 className="font-bold text-lg text-blue-400 flex items-center gap-2">
                                                    <MapPin size={16} /> Cita en {nombreSede}
                                                </h3>

                                                <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                                                    <div className="space-y-3">
                                                        <p className="flex items-center gap-2">
                                                            <Calendar size={16} className="text-gray-400" /> <strong className="font-semibold text-white">Fecha:</strong>
                                                            {isClient ? fechaCita.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Clock size={16} className="text-gray-400" /> <strong className="font-semibold text-white">Hora:</strong>
                                                            {isClient ? fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <p className="flex items-center gap-2">
                                                            <User size={16} className="text-gray-400" /> <strong className="font-semibold text-white">Barbero:</strong> {nombreBarbero}
                                                        </p>
                                                        <p className="flex items-start gap-2">
                                                            <Scissors size={16} className="text-gray-400 mt-0.5" /> <strong className="font-semibold text-white shrink-0">Servicios:</strong>
                                                            <span>{serviciosTexto || "Servicios no encontrados"}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 border-t border-white/10 pt-4 flex justify-end gap-3">
                                                    {/* --- BOTÓN CHAT AÑADIDO --- */}
                                                    <button
                                                        onClick={() => handleOpenChat(cita.id)}
                                                        className="inline-flex items-center gap-2 bg-green-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        // Se deshabilita si no tenemos el user.id de Clerk (importante para saber quién envía)
                                                        disabled={!user?.id}
                                                    >
                                                        <MessageSquare size={16} /> Chat
                                                    </button>
                                                    {/* --- FIN BOTÓN CHAT --- */}

                                                    <button
                                                        onClick={() => onEditAppointment(cita)}
                                                        className="inline-flex items-center gap-2 bg-blue-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                                                        <Edit size={16} /> Modificar
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteAppointment(cita.id)}
                                                        className="inline-flex items-center gap-2 bg-red-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                                        <Trash2 size={16} /> Cancelar Cita
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- RENDERIZADO CONDICIONAL DEL CHAT MODAL --- */}
            {/* Solo renderiza si hay una cita seleccionada para chatear Y tenemos el ID del usuario de Clerk */}
            {chattingCitaId && user?.id && (
                <ChatModal
                    isOpen={!!chattingCitaId}
                    onClose={() => setChattingCitaId(null)} // Función para cerrar el chat
                    citaId={chattingCitaId} // El ID de la cita específica
                    currentUserId={user.id} // El ID del cliente (desde Clerk)
                    currentUserType="client" // Indicamos que es el cliente quien usa este modal
                />
            )}
            {/* --- FIN RENDERIZADO CONDICIONAL --- */}
        </>
    );
}
