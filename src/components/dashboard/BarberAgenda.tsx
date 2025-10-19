"use client";
import { useEffect, useState, useMemo } from "react";

// --- INTERFAZ ACTUALIZADA ---
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
  const [citas, setCitas] = useState<CitaEnDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [editingCitaId, setEditingCitaId] = useState<string | null>(null);
  const [newHour, setNewHour] = useState<string>(""); 
  const [modifying, setModifying] = useState(false); 

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- CORRECCIÓN 1: Horario de 10am a 9pm (21:00) ---
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 10), []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchAllCitas = async () => {
      try {
        const response = await fetch(`${API_URL}/citas-activas`);
        if (!response.ok) {
          throw new Error('Error al obtener las citas desde la API');
        }
        const allCitas: CitaEnDashboard[] = await response.json();
        
        if (allCitas.length > 0 && (allCitas[0].sedeId === undefined || allCitas[0].services === undefined)) {
            console.error("ERROR: La API 'citas-activas' NO está devolviendo 'sedeId', 'barberId' o 'services'. La modificación fallará.");
            setError("Error de API: Faltan datos clave para la modificación.");
        }

        const sortedCitas = allCitas.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
        setCitas(sortedCitas);
      } catch (err: unknown) {
        console.error("Error al cargar las citas:", err);
        if (err instanceof Error) {
          setError(`No se pudieron cargar las citas: ${err.message}`);
        } else {
          setError("No se pudieron cargar las citas. Intenta de nuevo más tarde.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAllCitas();
  }, [API_URL]);


  const handleModificarCita = async () => {
    if (!editingCitaId || !newHour) return;

    setModifying(true);

    try {
      const citaOriginalCompleta = citas.find(c => c.id === editingCitaId);

      if (!citaOriginalCompleta) {
        throw new Error("No se encontró la cita en el estado local.");
      }

      const duracion = new Date(citaOriginalCompleta.fechaFin).getTime() - new Date(citaOriginalCompleta.fechaInicio).getTime();
      
      const nuevaFechaInicio = new Date(citaOriginalCompleta.fechaInicio);
      nuevaFechaInicio.setHours(Number(newHour), 0, 0, 0); 
      
      const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + duracion);

      // Esta validación (la importante) ya era correcta y te salva del bug
      if (nuevaFechaInicio < new Date()) {
        showToast("No puedes mover una cita a una hora que ya pasó.", "error");
        setModifying(false);
        return;
      }

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

      setCitas(prevCitas =>
        prevCitas
          .map(cita =>
            cita.id === editingCitaId ? citaActualizada : cita
          )
          .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()) 
      );

      showToast("Cita actualizada exitosamente.", "success");
      setEditingCitaId(null);
      setNewHour("");

    } catch (err: unknown) {
      console.error("Error al modificar la cita:", err);
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Ocurrió un error inesperado.", "error");
      }
    } finally {
      setModifying(false);
    }
  };

  const handleCancelarCita = async (citaId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar esta cita? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/citas-activas/${citaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({ message: 'No se pudo cancelar la cita.' }));
        throw new Error(errorData.message || 'No se pudo cancelar la cita.');
      }

      setCitas(prevCitas => prevCitas.filter(cita => cita.id !== citaId));
      showToast("Cita cancelada exitosamente.", "success");
    } catch (err: unknown) {
      console.error("Error al cancelar la cita:", err);
      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      } else {
        alert("Ocurrió un error inesperado al cancelar la cita.");
      }
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Cargando agenda...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-8">{error}</p>;
  }

  if (citas.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800">No hay citas programadas</h3>
        <p className="text-gray-500 mt-2">La agenda está libre.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed top-24 right-5 ${toast.includes('Error') || toast.includes('pasó') || toast.includes('inesperado') ? 'bg-red-500' : 'bg-green-500'} text-white py-2 px-4 rounded-lg shadow-lg z-50`}>
          {toast}
        </div>
      )}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Todas las Próximas Citas</h2>
        {citas.map((cita) => {
          const fechaCita = new Date(cita.fechaInicio);
          const isEditing = editingCitaId === cita.id;

          let serviciosTexto = 'No especificado';
          try {
            const detalles = JSON.parse(cita.serviciosDetalle);
            if(Array.isArray(detalles)) {
                serviciosTexto = detalles.join(', ');
            }
          } catch { 
            /* No hacer nada */ 
          }
          
          return (
            <div key={cita.id} className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition hover:shadow-md ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-blue-600">
                    Cita en {cita.nombreSede || 'Sede no especificada'}
                  </h3>
                  <p className="text-sm text-gray-500">ID Cliente: {cita.clienteId}</p>
                </div>
                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  ${cita.totalCost.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="mt-3 border-t pt-3 text-gray-700 space-y-1">
                <p><strong className="font-semibold">Fecha:</strong> {fechaCita.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                {!isEditing ? (
                  <p><strong className="font-semibold">Hora:</strong> {fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <label htmlFor={`hora-${cita.id}`} className="font-semibold text-gray-700">Hora:</label>
                    <select 
                      id={`hora-${cita.id}`}
                      value={newHour} 
                      onChange={(e) => setNewHour(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {hours.map((hour) => {
                        const now = new Date();
                        const isToday = fechaCita.toDateString() === now.toDateString();
                        
                        // --- CORRECCIÓN 2: Lógica de hora pasada ---
                        const isPast = isToday && hour <= now.getHours(); 

                        return (<option key={hour} value={hour} disabled={isPast} className="text-black">{hour}:00 {isPast ? "(Pasado)" : ""}</option>);
                      })}
                    </select>
                  </div>
                )}

                <p><strong className="font-semibold">Barbero:</strong> {cita.nombreCompletoBarbero}</p>
                <p><strong className="font-semibold">Servicios:</strong> {serviciosTexto}</p>
              </div>

              <div className="mt-4 text-right flex justify-end gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setEditingCitaId(cita.id);
                        setNewHour(fechaCita.getHours().toString());
                      }}
className="bg-blue-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => handleCancelarCita(cita.id)}
                      className="bg-red-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancelar Cita
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingCitaId(null);
                        setNewHour("");
                      }}
                      disabled={modifying}
                      className="bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleModificarCita}
                      disabled={modifying}
                      className="bg-green-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
                    >
                      {modifying ? "Guardando..." : "Guardar Hora"}
                    </button>
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