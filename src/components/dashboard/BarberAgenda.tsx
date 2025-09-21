// src/components/dashboard/BarberAgenda.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

// Definimos cómo se ve el objeto de una cita
interface Cita {
  id_cita: string;
  id_cliente: string;
  id_barbero: string;
  id_sede: string;
  fecha: string;
  hora: string;
  servicios: string; // "1,3"
  estado: string;
}

// Hacemos el componente asíncrono en el lado del cliente
export default function BarberAgenda() {
  const { user } = useUser(); // Obtenemos la info del barbero logueado
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para cargar las citas desde nuestra API
    const fetchCitas = async () => {
      if (!user) return; // Si no hay usuario, no hacemos nada

      try {
        const response = await fetch('/api/citas'); // Hacemos la petición a la API
        if (!response.ok) {
          throw new Error('Error al obtener las citas');
        }
        const data: Cita[] = await response.json();

        // Filtramos las citas para mostrar solo las de este barbero
        // IMPORTANTE: Suponemos que el `user.id` de Clerk coincide con `id_barbero` en el CSV.
        const misCitas = data.filter(cita => cita.id_barbero === user.id);
        
        // Ordenamos las citas por fecha y hora
        misCitas.sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());

        setCitas(misCitas);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [user]); // Se ejecuta cada vez que el objeto 'user' cambia

  if (loading) {
    return <p className="text-center text-gray-500">Cargando tu agenda...</p>;
  }

  if (citas.length === 0) {
    return <p className="text-center text-gray-500">No tienes citas programadas por ahora.</p>;
  }

  return (
    <div className="space-y-4">
      {citas.map((cita) => (
        <div key={cita.id_cita} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p><strong>Fecha:</strong> {new Date(cita.fecha + 'T00:00:00').toLocaleDateString()}</p>
          <p><strong>Hora:</strong> {cita.hora}</p>
          <p><strong>Cliente ID:</strong> {cita.id_cliente}</p> 
          {/* Más adelante reemplazaremos el ID por el nombre real del cliente */}
          <p><strong>Servicios:</strong> {cita.servicios}</p>
        </div>
      ))}
    </div>
  );
}