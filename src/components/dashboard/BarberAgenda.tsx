"use client";
import { useEffect, useState, useMemo } from "react";
import { Calendar, Clock, User, Scissors, MapPin, Edit, Trash2, Save, XCircle } from "lucide-react";

// --- INTERFAZ (Sin cambios) ---
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
  barberId: number;
  services: string;
}

export default function BarberAgenda() {
  // --- LÓGICA DE ESTADO ---
  const [citas, setCitas] = useState<CitaEnDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingCitaId, setEditingCitaId] = useState<string | null>(null);
  const [newHour, setNewHour] = useState<string>("");
  const [modifying, setModifying] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 10), []);

  // --- AJUSTE: Eliminar el parámetro 'type' no usado ---
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- LÓGICA DE FETCH ---
  useEffect(() => {
    const fetchAllCitas = async () => {
      setLoading(true); // Asegurar que loading se setea al inicio
      try {
        const response = await fetch(`${API_URL}/citas-activas`);
        if (!response.ok) { throw new Error('Error al obtener las citas desde la API'); }
        const allCitas: CitaEnDashboard[] = await response.json();
        // Validar datos clave (opcional pero bueno)
        if (allCitas.length > 0 && (allCitas[0].sedeId === undefined || allCitas[0].services === undefined)) {
            console.error("API ERROR: Faltan datos clave para la modificación.");
            // Podrías setear un error específico si quieres notificar al usuario
            // setError("Error de API: Faltan datos clave para la modificación.");
        }
        const sortedCitas = allCitas.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
        setCitas(sortedCitas);
        setError(null); // Limpiar errores previos si la carga fue exitosa
      } catch (err: unknown) {
        console.error("Error al cargar las citas:", err);
        if (err instanceof Error) { setError(`No se pudieron cargar las citas: ${err.message}`); }
        else { setError("No se pudieron cargar las citas. Intenta de nuevo más tarde."); }
      } finally { setLoading(false); }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchAllCitas();
  }, [API_URL]);

  // --- LÓGICA DE HANDLERS ---
  const handleModificarCita = async () => {
      if (!editingCitaId || !newHour) return;
      setModifying(true);
      try {
          const citaOriginalCompleta = citas.find(c => c.id === editingCitaId);
          if (!citaOriginalCompleta) { throw new Error("No se encontró la cita."); }
          // Calcular duración
          const duracion = new Date(citaOriginalCompleta.fechaFin).getTime() - new Date(citaOriginalCompleta.fechaInicio).getTime();
          // Crear nueva fecha de inicio
          const nuevaFechaInicio = new Date(citaOriginalCompleta.fechaInicio);
          nuevaFechaInicio.setHours(Number(newHour), 0, 0, 0);
          // Crear nueva fecha de fin
          const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + duracion);

          // Validación de hora pasada
          if (nuevaFechaInicio < new Date()) {
              showToast("No puedes mover una cita a una hora que ya pasó."); // Ya no se pasa "error"
              setModifying(false);
              return;
          }

          // Crear payload actualizado
          const updatePayload = {
              ...citaOriginalCompleta,
              fechaInicio: nuevaFechaInicio.toISOString(),
              fechaFin: nuevaFechaFin.toISOString(),
          };

          const putResponse = await fetch(`${API_URL}/citas-activas/${editingCitaId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatePayload),
          });

          if (!putResponse.ok) {
              const errorData = await putResponse.json();
              throw new Error(errorData.message || 'Error al guardar los cambios.');
          }

          const citaActualizada: CitaEnDashboard = await putResponse.json();

          // Actualizar estado y ordenar
          setCitas(prevCitas =>
              prevCitas.map(cita =>
                  cita.id === editingCitaId ? citaActualizada : cita
              ).sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
          );

          showToast("Cita actualizada exitosamente."); // Ya no se pasa "success"
          setEditingCitaId(null);
          setNewHour("");

      } catch (err: unknown) {
          console.error("Error al modificar la cita:", err);
          if (err instanceof Error) { showToast(err.message); } // Ya no se pasa "error"
          else { showToast("Ocurrió un error inesperado."); } // Ya no se pasa "error"
      } finally {
          setModifying(false);
      }
  };

  const handleCancelarCita = async (citaId: string) => {
      if (!window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) { return; }
      try {
          const response = await fetch(`${API_URL}/citas-activas/${citaId}`, { method: 'DELETE', });
          if (!response.ok && response.status !== 204) { // 204 No Content es OK para DELETE
              const errorData = await response.json().catch(() => ({ message: 'No se pudo cancelar la cita.' }));
              throw new Error(errorData.message || 'No se pudo cancelar la cita.');
          }
          setCitas(prevCitas => prevCitas.filter(cita => cita.id !== citaId));
          showToast("Cita cancelada exitosamente."); // Ya no se pasa "success"
      } catch (err: unknown) {
          console.error("Error al cancelar la cita:", err);
          // Usamos showToast para errores también para consistencia
          if (err instanceof Error) { showToast(`Error: ${err.message}`); } // Ya no se pasa "error"
          else { showToast("Ocurrió un error inesperado al cancelar la cita."); } // Ya no se pasa "error"
      }
  };

  // --- JSX ---
  if (loading) { return <p className="text-center text-gray-400 py-8">Cargando agenda...</p>; }
  if (error) { return <p className="text-center text-red-400 py-8">{error}</p>; }
  if (citas.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg ring-1 ring-white/10">
        <h3 className="text-xl font-semibold text-white">No hay citas programadas</h3>
        <p className="text-gray-400 mt-2">La agenda está libre por ahora.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* El estilo del toast sigue basándose en el contenido del mensaje */}
      {toast && <div className={`fixed top-24 right-5 ${toast.includes('Error') || toast.includes('pasó') || toast.includes('inesperado') ? 'bg-red-500' : 'bg-green-500'} text-white py-2 px-4 rounded-lg shadow-lg z-50`}>{toast}</div>}
      <div className="space-y-6">
        {citas.map((cita) => {
          const fechaCita = new Date(cita.fechaInicio);
          const isEditing = editingCitaId === cita.id;
          let serviciosTexto = 'No especificado';
          try {
              // Intenta parsear, si falla o no es array, se queda con 'No especificado'
              const detalles = JSON.parse(cita.serviciosDetalle);
              if(Array.isArray(detalles)) {
                  serviciosTexto = detalles.join(', ');
              }
          } catch { /* Ignorar error de parseo */ }

          return (
            <div key={cita.id} className={`bg-gray-800 p-5 rounded-xl border border-white/10 shadow-lg transition-all duration-300 ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-blue-400 flex items-center gap-2"><MapPin size={16}/> Cita en {cita.nombreSede || 'Sede'}</h3>
                  <p className="text-sm text-gray-400 mt-1">ID Cliente: {cita.clienteId}</p>
                </div>
                <span className="text-sm font-semibold bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full ring-1 ring-blue-500/30">${cita.totalCost.toLocaleString('es-CO')}</span>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-3">
                  <p className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> <strong className="font-semibold text-white">Fecha:</strong> {fechaCita.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  {!isEditing ? (
                    <p className="flex items-center gap-2"><Clock size={16} className="text-gray-400"/> <strong className="font-semibold text-white">Hora:</strong> {fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label htmlFor={`hora-${cita.id}`} className="font-semibold text-white flex items-center gap-2"><Clock size={16} className="text-gray-400"/> Hora:</label>
                      <select id={`hora-${cita.id}`} value={newHour} onChange={(e) => setNewHour(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {hours.map((hour) => {
                            const now = new Date();
                            const isToday = fechaCita.toDateString() === now.toDateString();
                            // Deshabilitar si es hoy Y la hora es menor o igual a la actual
                            const isPast = isToday && hour <= now.getHours();
                            return (<option key={hour} value={hour} disabled={isPast}>{hour}:00 {isPast ? "(Pasado)" : ""}</option>);
                        })}
                      </select>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2"><User size={16} className="text-gray-400"/> <strong className="font-semibold text-white">Barbero:</strong> {cita.nombreCompletoBarbero}</p>
                  <p className="flex items-start gap-2"><Scissors size={16} className="text-gray-400 mt-0.5"/> <strong className="font-semibold text-white shrink-0">Servicios:</strong> <span>{serviciosTexto}</span></p>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4 flex justify-end gap-3">
                {!isEditing ? (
                  <>
                    <button onClick={() => { setEditingCitaId(cita.id); setNewHour(fechaCita.getHours().toString()); }} className="inline-flex items-center gap-2 bg-blue-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"><Edit size={16}/> Modificar</button>
                    <button onClick={() => handleCancelarCita(cita.id)} className="inline-flex items-center gap-2 bg-red-600/80 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={16}/> Cancelar Cita</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingCitaId(null); setNewHour(""); }} disabled={modifying} className="inline-flex items-center gap-2 bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"><XCircle size={16}/> Cancelar</button>
                    <button onClick={handleModificarCita} disabled={modifying} className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:opacity-70">{modifying ? "Guardando..." : <><Save size={16}/> Guardar Hora</>}</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}