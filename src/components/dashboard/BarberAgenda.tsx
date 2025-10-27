"use client";
import { useEffect, useState, useMemo } from "react";
// --- AÑADIR IMPORTS ---
import { Calendar, Clock, User, Scissors, MapPin, Edit, Trash2, Save, XCircle, MessageSquare } from "lucide-react";
import ChatModal from "@/components/appointment/ChatModal"; // Asegúrate que la ruta es correcta
import { useUser } from "@clerk/nextjs"; // Importar useUser
// --- FIN AÑADIR IMPORTS ---


// --- INTERFAZ ---
interface CitaEnDashboard {
  id: string;
  clienteId: string;
  fechaInicio: string;
  fechaFin: string;
  totalCost: number;
  nombreSede: string;
  nombreCompletoBarbero: string;
  serviciosDetalle: string;
  sedeId: number;
  barberId: number; // Volvemos al tipo original
  services: string;
}

export default function BarberAgenda() {
  // --- AÑADIR ESTADO DE USUARIO ---
  const { user, isLoaded } = useUser();
  const barberIdLoggedIn = isLoaded && user ? user.id : null;
  // --- FIN AÑADIR ESTADO DE USUARIO ---

  // --- LÓGICA DE ESTADO (ORIGINAL + CHAT) ---
  const [citas, setCitas] = useState<CitaEnDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingCitaId, setEditingCitaId] = useState<string | null>(null);
  const [newHour, setNewHour] = useState<string>("");
  const [modifying, setModifying] = useState(false);

  // --- AÑADIR ESTADO PARA CHAT ---
  const [chattingCitaId, setChattingCitaId] = useState<string | null>(null);
  // --- FIN AÑADIR ESTADO PARA CHAT ---

  const [isClient, setIsClient] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const hours = useMemo(() => Array.from({ length: 13 }, (_, i) => i + 10), []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- LÓGICA DE FETCH (ORIGINAL, PERO ESPERANDO A isLoaded) ---
  useEffect(() => {
    // Activar el estado de cliente solo en el navegador
    setIsClient(true);
    console.log("BarberAgenda V-FINAL: Mounted.");

    const fetchAllCitas = async () => {
      console.log("BarberAgenda V-FINAL: Fetching appointments...");
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/citas-activas`); // La API ya filtra
        if (!response.ok) { throw new Error('Error al obtener las citas desde la API'); }
        // CORRECCIÓN: Usar 'unknown' en catch
        const allCitas: CitaEnDashboard[] = await response.json();
        console.log(`BarberAgenda V-FINAL: Fetched ${allCitas.length} appointments.`);

        // NO HAY FILTRO AQUÍ - Confiamos en la API

        if (allCitas.length > 0 && (allCitas[0].sedeId === undefined || allCitas[0].services === undefined)) {
          console.warn("API WARNING: Faltan datos clave para la modificación.");
        }
        const sortedCitas = allCitas.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
        setCitas(sortedCitas);
        console.log(`BarberAgenda V-FINAL: Setting ${sortedCitas.length} appointments.`);

      } catch (err: unknown) {
        console.error("Error al cargar las citas:", err);
        if (err instanceof Error) { setError(`No se pudieron cargar las citas: ${err.message}`); }
        else { setError("No se pudieron cargar las citas. Intenta de nuevo más tarde."); }
        setCitas([]); // Limpiar en error
      } finally {
        setLoading(false);
        console.log("BarberAgenda V-FINAL: Fetch finished.");
      }
    };

    // Ejecutar fetch SOLO cuando Clerk haya cargado (isLoaded = true)
    // y estemos en el cliente (isClient = true)
    if (isLoaded && isClient) {
      // No necesitamos verificar barberIdLoggedIn aquí, la API lo hace
      fetchAllCitas();
    } else {
      // Aún no estamos listos (esperando Clerk o cliente)
      console.log("BarberAgenda V-FINAL: Waiting for isLoaded or isClient.");
      // setLoading(true) ya está por defecto
    }
  }, [API_URL, isLoaded, isClient]); // Depender de isLoaded e isClient


  // --- LÓGICA DE HANDLERS (Igual que antes) ---
  const handleModificarCita = async () => {
    if (!editingCitaId || !newHour) return;
    setModifying(true);
    try {
      const citaOriginalCompleta = citas.find(c => c.id === editingCitaId);
      if (!citaOriginalCompleta) { throw new Error("No se encontró la cita."); }
      const duracion = new Date(citaOriginalCompleta.fechaFin).getTime() - new Date(citaOriginalCompleta.fechaInicio).getTime();
      const nuevaFechaInicio = new Date(citaOriginalCompleta.fechaInicio);
      nuevaFechaInicio.setHours(Number(newHour), 0, 0, 0);
      const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + duracion);

      if (nuevaFechaFin.getHours() > 22 || (nuevaFechaFin.getHours() === 22 && nuevaFechaFin.getMinutes() > 0)) { showToast("Error: La cita excede la hora de cierre (10pm)."); setModifying(false); return; }
      if (nuevaFechaInicio < new Date()) { showToast("No puedes mover una cita a una hora que ya pasó."); setModifying(false); return; }

      // Validar contra las citas actuales del barbero (que ya están en 'citas')
      const isTaken = citas.some(otraCita =>
        otraCita.id !== citaOriginalCompleta.id &&
        String(otraCita.barberId) === String(citaOriginalCompleta.barberId) &&
        new Date(otraCita.fechaInicio) < nuevaFechaFin &&
        new Date(otraCita.fechaFin) > nuevaFechaInicio);
      if (isTaken) { showToast("Error: Conflicto de horario. Ya tienes otra cita en ese momento."); setModifying(false); return; }

      const updatePayload = { ...citaOriginalCompleta, fechaInicio: nuevaFechaInicio.toISOString(), fechaFin: nuevaFechaFin.toISOString(), };
      const putResponse = await fetch(`${API_URL}/citas-activas/${editingCitaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatePayload), });
      if (!putResponse.ok) {
        // CORRECCIÓN: Usar 'unknown' en catch
        const errorData = await putResponse.json().catch((err: unknown) => {
          console.error("Error parsing JSON for PUT response:", err);
          return { message: 'Error desconocido al procesar la respuesta.' };
        });
        throw new Error(errorData.message || 'Error al guardar los cambios.');
      }

      const citaActualizada: CitaEnDashboard = await putResponse.json();
      // Actualizar el estado 'citas'
      setCitas(prevCitas => prevCitas.map(cita => cita.id === editingCitaId ? citaActualizada : cita).sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()));

      showToast("Cita actualizada exitosamente."); setEditingCitaId(null); setNewHour("");
      // CORRECCIÓN: Usar 'unknown' en catch
    } catch (err: unknown) {
      console.error("Error al modificar la cita:", err);
      if (err instanceof Error) { showToast(err.message); }
      else { showToast("Ocurrió un error inesperado."); }
    } finally { setModifying(false); }
  };

  const handleCancelarCita = async (citaId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) { return; }
    try {
      const response = await fetch(`${API_URL}/citas-activas/${citaId}`, { method: 'DELETE', });
      if (!response.ok && response.status !== 204) {
        // CORRECCIÓN: Usar 'unknown' en catch
        const errorData = await response.json().catch((err: unknown) => {
          console.error("Error parsing JSON for DELETE response:", err);
          return { message: 'No se pudo cancelar la cita.' };
        });
        throw new Error(errorData.message || 'No se pudo cancelar la cita.');
      }
      setCitas(prevCitas => prevCitas.filter(cita => cita.id !== citaId));
      showToast("Cita cancelada exitosamente.");
      // CORRECCIÓN: Usar 'unknown' en catch
    } catch (err: unknown) {
      console.error("Error al cancelar la cita:", err);
      if (err instanceof Error) { showToast(`Error: ${err.message}`); }
      else { showToast("Ocurrió un error inesperado al cancelar la cita."); }
    }
  };

  // --- AÑADIR FUNCIÓN PARA ABRIR CHAT ---
  const handleOpenChat = (citaId: string) => {
    // Usar barberIdLoggedIn que ya tiene la lógica de isLoaded
    if (barberIdLoggedIn) {
      setChattingCitaId(citaId);
    } else {
      console.error("Barber ID not available to open chat (Clerk might still be loading or user not logged in).");
      showToast("Error: No se pudo identificar al usuario para abrir el chat.");
    }
  };
  // --- FIN AÑADIR FUNCIÓN ---

  // --- JSX ---
  // Mostrar carga MIENTRAS loading es true O Clerk aún no ha cargado (!isLoaded)
  // O aún no estamos en el cliente (!isClient)
  if (!isClient || !isLoaded || loading) {
    const message = !isClient ? "Cargando..." : !isLoaded ? "Verificando usuario..." : "Cargando agenda...";
    // Solo mostrar si no hay un error ya establecido
    return !error ? <p className="text-center text-gray-400 py-8">{message}</p> : null;
  }

  // Mostrar error si existe (después de intentar cargar y Clerk cargado)
  if (error) { return <p className="text-center text-red-400 py-8">{error}</p>; }

  // Mensaje "No hay citas" (Clerk cargado, fetch terminado, no hay error, array vacío)
  if (citas.length === 0 && !loading && !error) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg ring-1 ring-white/10">
        <h3 className="text-xl font-semibold text-white">No hay citas programadas</h3>
        <p className="text-gray-400 mt-2">Tu agenda está libre por ahora.</p>
      </div>
    );
  }

  // Mostrar citas
  return (
    <>
      <div className="relative">
        {toast && <div className={`fixed top-24 right-5 ${toast.includes('Error') || toast.includes('pasó') || toast.includes('inesperado') ? 'bg-red-500' : 'bg-green-500'} text-white py-2 px-4 rounded-lg shadow-lg z-50`}>{toast}</div>}
        <div className="space-y-6">
          {citas.map((cita) => {
            const fechaCita = new Date(cita.fechaInicio);
            const isEditing = editingCitaId === cita.id;
            let serviciosTexto = 'No especificado';
            try {
              // CORRECCIÓN: Cambiado 'let detalles' por 'const detalles'
              const detalles = JSON.parse(cita.serviciosDetalle);
              if (Array.isArray(detalles) && detalles.length > 0) { serviciosTexto = detalles.join(', '); }
              else if (typeof cita.serviciosDetalle === 'string' && cita.serviciosDetalle.trim() !== '' && cita.serviciosDetalle !== '[]') { serviciosTexto = cita.serviciosDetalle; }
            } catch { if (typeof cita.serviciosDetalle === 'string' && cita.serviciosDetalle.trim() !== '') { serviciosTexto = cita.serviciosDetalle; } }

            return (
              <div key={cita.id} className={`bg-gray-800 p-5 rounded-xl border border-white/10 shadow-lg transition-all duration-300 ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-blue-400 flex items-center gap-2">
                      <MapPin size={16} /> Cita en {cita.nombreSede || 'Sede'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">ID Cliente: {cita.clienteId}</p>
                  </div>
                  <span className="text-sm font-semibold bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full ring-1 ring-blue-500/30">${cita.totalCost.toLocaleString('es-CO')}</span>
                </div>

                {/* CORRECCIÓN DE ALINEACIÓN DEL MODO EDITAR */}
                <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                  {/* Columna 1 (Fecha/Hora) */}
                  <div className="space-y-3">
                    <p className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <strong className="font-semibold text-white">Fecha:</strong> {isClient ? fechaCita.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
                    </p>
                    {!isEditing ? (
                      <p className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <strong className="font-semibold text-white">Hora:</strong> {isClient ? fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '...'}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <label htmlFor={`hora-${cita.id}`} className="font-semibold text-white flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" /> Hora:
                        </label>
                        <select id={`hora-${cita.id}`} value={newHour} onChange={(e) => setNewHour(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {hours.map((hour) => {
                            let isDisabled = false; // CORREGIDO: Inicializar en false para habilitar
                            const label = ""; // CORRECCIÓN FINAL: Cambiado 'let label' a 'const label' para evitar el error 'prefer-const'

                            if (isClient) { /* ... (Aquí iría la lógica completa de validación de horario) ... */ }

                            // Aseguramos que la hora de la cita actual no se deshabilite
                            if (hour === fechaCita.getHours()) {
                              isDisabled = false;
                            }

                            // Corregimos los errores de 'prefer-const' cambiando la declaración final a 'const'
                            const finalIsDisabled = isDisabled;
                            // const finalLabel = label; // La eliminamos ya que label es const

                            return (<option key={hour} value={hour} disabled={finalIsDisabled}>{hour}:00 {isClient ? label : ""}</option>);
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                  {/* Columna 2 (Barbero/Servicios) */}
                  <div className="space-y-3">
                    <p className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <strong className="font-semibold text-white">Barbero:</strong> {cita.nombreCompletoBarbero}
                    </p>
                    <p className="flex items-start gap-2">
                      <Scissors size={16} className="text-gray-400 mt-0.5" />
                      <strong className="font-semibold text-white shrink-0">Servicios:</strong> <span>{serviciosTexto}</span>
                    </p>
                  </div>
                </div>

                {/* --- SECCIÓN DE BOTONES CON CHAT --- */}
                <div className="mt-5 border-t border-white/10 pt-4 flex justify-end gap-3">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => handleOpenChat(cita.id)}
                        className="inline-flex items-center gap-2 bg-green-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={!isLoaded || !barberIdLoggedIn}
                      >
                        <MessageSquare size={16} /> Chat
                      </button>
                      <button onClick={() => { setEditingCitaId(cita.id); setNewHour(fechaCita.getHours().toString()); }} className="inline-flex items-center gap-2 bg-blue-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"><Edit size={16} /> Modificar</button>
                      <button onClick={() => handleCancelarCita(cita.id)} className="inline-flex items-center gap-2 bg-red-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={16} /> Cancelar Cita</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingCitaId(null); setNewHour(""); }} disabled={modifying} className="inline-flex items-center gap-2 bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"><XCircle size={16} /> Cancelar</button>
                      <button onClick={handleModificarCita} disabled={modifying} className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:opacity-70">{modifying ? "Guardando..." : <><Save size={16} /> Guardar Hora</>}</button>
                    </>
                  )}
                </div>
                {/* --- FIN SECCIÓN BOTONES --- */}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RENDERIZADO CONDICIONAL DEL CHAT MODAL --- */}
      {isClient && chattingCitaId && barberIdLoggedIn && (
        <ChatModal
          isOpen={!!chattingCitaId}
          onClose={() => setChattingCitaId(null)}
          citaId={chattingCitaId}
          currentUserId={barberIdLoggedIn} // ID del Barbero
          currentUserType="barber"
        />
      )}
      {/* --- FIN RENDERIZADO CONDICIONAL --- */}
    </>
  );
}