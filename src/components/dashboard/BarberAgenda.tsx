"use client";

import { useEffect, useState } from "react";

// Actualizamos la interfaz para que TypeScript sepa de los nuevos datos que llegan
interface CitaEnriquecida {
  id: string;
  clienteId: string;
  barberId: string; // Aún lo tenemos por si lo necesitamos
  start: string;
  title: string;
  totalCost: string;
  // Nuevos objetos con información detallada
  barberoInfo: {
    id: string;
    nombre: string;
  };
  serviciosInfo: {
    id: string;
    nombre: string;
  }[];
}

export default function AllAppointmentsAgenda() {
  const [citas, setCitas] = useState<CitaEnriquecida[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCitas = async () => {
      try {
        const response = await fetch('/api/citas');
        if (!response.ok) {
          throw new Error('Error al obtener las citas');
        }
        
        const allCitas: CitaEnriquecida[] = await response.json();
        allCitas.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        setCitas(allCitas);

      } catch (error) {
        console.error("Error al cargar las citas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCitas();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Cargando todas las citas...</p>;
  }

  if (citas.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800">No hay citas programadas</h3>
          <p className="text-gray-500 mt-2">El archivo de nuevas citas podría estar vacío.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Todas las Próximas Citas</h2>
      {citas.map((cita) => {
        const fechaCita = new Date(cita.start);
        
        // --- AQUÍ LA CORRECCIÓN FINAL ---
        // Comprobamos si el array tiene elementos antes de mapearlo.
        const serviciosTexto = cita.serviciosInfo && cita.serviciosInfo.length > 0
          ? cita.serviciosInfo
              .map(servicio => `${servicio.nombre} (ID: ${servicio.id})`)
              .join(', ')
          : 'No especificado'; // Si está vacío, mostramos este texto.

        return (
          <div key={cita.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition hover:shadow-md">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-blue-600">{cita.title}</h3>
                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  ${parseFloat(cita.totalCost).toLocaleString('es-CO')}
                </span>
            </div>
            <div className="mt-3 border-t pt-3 text-gray-700 space-y-1">
              <p><strong className="font-semibold">Fecha:</strong> {fechaCita.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong className="font-semibold">Hora:</strong> {fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              
              {/* Mostramos los nuevos datos */}
              <p><strong className="font-semibold">Barbero:</strong> {`${cita.barberoInfo.nombre} (ID: ${cita.barberoInfo.id})`}</p>
              <p><strong className="font-semibold">Cliente ID:</strong> {cita.clienteId}</p>
              <p><strong className="font-semibold">Servicios:</strong> {serviciosTexto}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}