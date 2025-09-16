"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  SlotInfo,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  userId: string; 
}

export default function AppointmentCalendar() {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(10);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  if (!user) {
    return (
      <p id="citas" className="text-center py-10 text-lg font-semibold">
        🔒 Debes iniciar sesión para agendar citas.
      </p>
    );
  }

  // Horario permitido (10 AM - 10 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 10);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const now = new Date();
    if (slotInfo.start < now) {
      alert("❌ No puedes agendar citas en el pasado");
      return;
    }
    setSelectedDate(slotInfo.start);
    setSelectedHour(10);
    setEditingEvent(null);
  };

  const handleSaveAppointment = () => {
    if (!selectedDate) return;

    const start = new Date(selectedDate);
    start.setHours(selectedHour, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    // Contar cuántas citas ya existen en esta hora
    const citasEnHora = events.filter(
      (event) => event.start.getTime() === start.getTime()
    );

    if (citasEnHora.length >= 1) {
      alert("⚠️ Ya hay 1 citas en esta hora. Escoge otra.");
      return;
    }

    if (editingEvent) {
      // Solo el dueño puede editar
      if (editingEvent.userId !== user.id) {
        alert("❌ Solo puedes modificar tus propias citas");
        return;
      }

      setEvents(
        events.map((event) =>
          event.id === editingEvent.id
            ? { ...event, start, end }
            : event
        )
      );
      setEditingEvent(null);
    } else {
      // Crear nueva cita para el usuario actual
      setEvents([
        ...events,
        {
          id: Date.now(),
          title: `Cita de ${user.firstName || "Usuario"} 💈`,
          start,
          end,
          userId: user.id,
        },
      ]);
    }

    setSelectedDate(null);
    setSelectedHour(10);
  };

  const handleDeleteAppointment = () => {
    if (editingEvent) {
      if (editingEvent.userId !== user.id) {
        alert("❌ Solo puedes eliminar tus propias citas");
        return;
      }
      setEvents(events.filter((event) => event.id !== editingEvent.id));
      setEditingEvent(null);
      setSelectedDate(null);
    }
  };

  // Mostrar solo las citas del usuario actual
  const userEvents = events.filter((event) => event.userId === user.id);

  return (
    <div id="citas" className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-6">
        📅 Agenda tu cita
      </h2>
      <Calendar
        localizer={localizer}
        events={userEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => {
          setEditingEvent(event as Event);
          setSelectedDate(event.start);
          setSelectedHour(event.start.getHours());
        }}
        style={{ height: 600 }}
        step={60}
        timeslots={1}
        min={new Date(2025, 0, 1, 10, 0)}
        max={new Date(2025, 0, 1, 22, 0)}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
        }}
      />

      {/* Modal para seleccionar hora */}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            <h3 className="text-xl font-bold mb-4 text-center">
              {editingEvent ? "Editar cita" : "Nueva cita"}
            </h3>

            <label className="block mb-2 font-semibold">
              Selecciona la hora:
            </label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              {hours.map((hour) => {
                const start = new Date(selectedDate);
                start.setHours(hour, 0, 0);
                const citasEnHora = events.filter(
                  (event) => event.start.getTime() === start.getTime()
                );

                return (
                  <option
                    key={hour}
                    value={hour}
                    disabled={
                      citasEnHora.length >= 2 &&
                      (!editingEvent ||
                        editingEvent.start.getHours() !== hour)
                    }
                  >
                    {hour}:00 {citasEnHora.length >= 1 ? "(Lleno)" : ""}
                  </option>
                );
              })}
            </select>

            <div className="flex justify-between mt-6">
              {editingEvent && (
                <button
                  onClick={handleDeleteAppointment}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedHour(10);
                  setEditingEvent(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingEvent ? "Guardar cambios" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
