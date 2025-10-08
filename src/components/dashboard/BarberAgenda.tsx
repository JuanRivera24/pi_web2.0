"use client";
import { useEffect, useState } from "react";

interface CitaDesdeAPI {
  id: string;
  clienteId: string;
  fechaInicio: string;
  totalCost: number;
  nombreSede: string;
  nombreCompletoBarbero: string;
  serviciosDetalle: string;
}

export default function BarberAgenda() {
  const [citas, setCitas] = useState<CitaDesdeAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const API_URL = 'http://localhost:8080';

  const showToast = (message: string) => {
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
        const allCitas: CitaDesdeAPI[] = await response.json();
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
  }, []);

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
      showToast("Cita cancelada exitosamente.");
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
        <div className="fixed top-24 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Todas las Próximas Citas</h2>
        {citas.map((cita) => {
          const fechaCita = new Date(cita.fechaInicio);
          
          let serviciosTexto = 'No especificado';
          try {
            const detalles = JSON.parse(cita.serviciosDetalle);
            if(Array.isArray(detalles)) {
                serviciosTexto = detalles.join(', ');
            }
          // --- INICIO CORRECCIÓN ---
          } catch { // Se elimina la variable 'e' que no se usaba
            /* No hacer nada, se queda como 'No especificado' */ 
          }
          // --- FIN CORRECCIÓN ---
          
          return (
            <div key={cita.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition hover:shadow-md">
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
                <p><strong className="font-semibold">Hora:</strong> {fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong className="font-semibold">Barbero:</strong> {cita.nombreCompletoBarbero}</p>
                <p><strong className="font-semibold">Servicios:</strong> {serviciosTexto}</p>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={() => handleCancelarCita(cita.id)}
                  className="bg-red-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancelar Cita
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}