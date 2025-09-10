"use client";

import { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Event as RBCEvent,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface Appointment extends RBCEvent {
  id: number;
}

export default function AppointmentCalendar() {
  const [events, setEvents] = useState<Appointment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);

  // 📅 Restricción: no permitir fechas pasadas ni fuera de horario
  const isValidSlot = (slot: SlotInfo) => {
    const now = new Date();

    // No permitir fechas pasadas
    if (slot.start < now) return false;

    // Validar rango horario (10 AM - 10 PM)
    const startHour = moment(slot.start).hour();
    const endHour = moment(slot.end).hour();
    if (startHour < 10 || endHour > 22) return false;

    return true;
  };

  // Crear cita
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!isValidSlot(slotInfo)) {
      alert("❌ Solo puedes agendar entre 10 AM y 10 PM y no en fechas pasadas.");
      return;
    }

    const title = prompt("Ingrese el motivo de la cita:");
    if (title) {
      const newEvent: Appointment = {
        id: events.length + 1,
        title,
        start: slotInfo.start,
        end: slotInfo.end,
      };
      setEvents([...events, newEvent]);
    }
  };

  // Editar cita
  const handleSelectEvent = (event: Appointment) => {
    const action = confirm(
      `📌 Cita: ${event.title}\n¿Deseas eliminarla? (Aceptar = eliminar, Cancelar = mantener)`
    );
    if (action) {
      setEvents(events.filter((e) => e.id !== event.id));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-10">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        📅 Agenda tu cita
      </h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        style={{ height: 600 }}
        step={60} // ⏱️ Duración de cada slot = 1 hora
        timeslots={1}
        min={new Date(2023, 0, 1, 10, 0)} // 10:00 AM
        max={new Date(2023, 0, 1, 22, 0)} // 10:00 PM
        views={["month", "week", "day"]}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
        }}
      />
    </div>
  );
}
