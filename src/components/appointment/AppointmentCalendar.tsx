"use client";
import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek as dfStartOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Locale } from "date-fns";
// util para clases
const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
// Localizer con tipado correcto
const locales: Record<string, Locale> = { es };
const localizer = dateFnsLocalizer({
format,
parse,
startOfWeek: (date: Date) => dfStartOfWeek(date, { weekStartsOn: 1 }),
getDay,
locales,
});
type AppointmentEvent = {
id: string;
title: string;
start: Date;
end: Date;
userId: string;
};
type ToastType = "success" | "error" | "info";
type ToolbarProps = {
label: string;
onNavigate: (a: "PREV" | "NEXT" | "TODAY" | "DATE") => void;
onView: (v: View) => void;
view: View;
};
const Toolbar = ({ label, onNavigate, onView, view }: ToolbarProps) => {
const btn = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
return (
<div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
<div className="flex items-center gap-2">
<button onClick={() => onNavigate("PREV")} className={cn(btn, "bg-blue-50 text-blue-700 hover:bg-blue-100")}>← Anterior</button>
<button onClick={() => onNavigate("TODAY")} className={cn(btn, "bg-blue-600 text-white hover:bg-blue-700")}>Hoy</button>
<button onClick={() => onNavigate("NEXT")} className={cn(btn, "bg-blue-50 text-blue-700 hover:bg-blue-100")}>Siguiente →</button>
</div>
<div className="text-center text-lg font-semibold text-gray-800">{label}</div>
<div className="flex items-center gap-2">
<button onClick={() => onView(Views.DAY)} className={cn(btn, view === Views.DAY ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>Día</button>
<button onClick={() => onView(Views.WEEK)} className={cn(btn, view === Views.WEEK ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>Semana</button>
<button onClick={() => onView(Views.MONTH)} className={cn(btn, view === Views.MONTH ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>Mes</button>
</div>
</div>
);
};
export default function AppointmentCalendar() {
const { user } = useUser();
const [events, setEvents] = useState<AppointmentEvent[]>([]);
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [selectedHour, setSelectedHour] = useState<number>(10);
const [editingEvent, setEditingEvent] = useState<AppointmentEvent | null>(null);
const [view, setView] = useState<View>(Views.WEEK);
// NUEVO: controlar la fecha para que funcionen Anterior/Siguiente y navegar por todos los meses
const [date, setDate] = useState<Date>(new Date());
const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
const hours = useMemo(() => Array.from({ length: 13 }, (_, i) => i + 10), []);
const minTime = useMemo(() => new Date(1970, 0, 1, 10, 0, 0), []);
const maxTime = useMemo(() => new Date(1970, 0, 1, 22, 0, 0), []);
const showToast = (m: string, type: ToastType = "info") => {
setToast({ message: m, type });
setTimeout(() => setToast(null), 2600);
};
if (!user) {
return (
<div id="citas" className="scroll-mt-24">
<p className="text-center py-10 text-lg font-semibold text-gray-700">
🔒 Debes iniciar sesión para agendar citas.
</p>
</div>
);
}
const handleSelectSlot = (slot: { start: Date; end: Date }) => {
const now = new Date();
if (slot.start < now) {
showToast("No puedes agendar en el pasado", "error");
return;
}
setSelectedDate(slot.start);
setSelectedHour(10);
setEditingEvent(null);
};
const handleSaveAppointment = () => {
if (!selectedDate) return;
const start = new Date(selectedDate);
start.setHours(selectedHour, 0, 0, 0);
const end = new Date(start);
end.setHours(start.getHours() + 1);
const clash = events.some(
  (e) => e.start.getTime() === start.getTime() && (!editingEvent || e.id !== editingEvent.id)
);
if (clash) {
  showToast("Ya hay una cita en esa hora. Elige otra.", "error");
  return;
}

if (editingEvent) {
  if (editingEvent.userId !== user.id) {
    showToast("Solo puedes modificar tus propias citas", "error");
    return;
  }
  setEvents((p) => p.map((e) => (e.id === editingEvent.id ? { ...e, start, end } : e)));
  showToast("Cita actualizada", "success");
  setEditingEvent(null);
} else {
  setEvents((p) => [
    ...p,
    {
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
      title: `Cita de ${user.firstName || "Usuario"} 💈`,
      start,
      end,
      userId: user.id,
    },
  ]);
  showToast("Cita creada", "success");
}
setSelectedDate(null);
setSelectedHour(10);
};
const handleDeleteAppointment = () => {
if (!editingEvent) return;
if (editingEvent.userId !== user.id) {
showToast("Solo puedes eliminar tus propias citas", "error");
return;
}
setEvents((p) => p.filter((e) => e.id !== editingEvent.id));
setEditingEvent(null);
setSelectedDate(null);
showToast("Cita eliminada", "info");
};
const userEvents = events.filter((e) => e.userId === user.id);
return (
<div id="citas" className="w-full max-w-6xl mx-auto p-6 scroll-mt-24">
<div className="text-center mb-8">
<h2 className="text-4xl font-bold text-gray-900">Agenda tu cita 💈</h2>
<p className="text-gray-600 mt-2">Horario: <b>10:00 am - 10:00 pm</b></p>
</div>
  <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-4 md:p-6">
    <Calendar
      culture="es"
      localizer={localizer}
      events={userEvents}
      startAccessor="start"
      endAccessor="end"
      selectable
      onSelectSlot={handleSelectSlot}
      onSelectEvent={(ev) => {
        const e = ev as AppointmentEvent;
        setEditingEvent(e);
        setSelectedDate(e.start);
        setSelectedHour(e.start.getHours());
      }}
      style={{ height: 600 }}
      step={60}
      timeslots={1}
      defaultView={Views.WEEK}
      view={view}
      onView={(v) => setView(v)}
      min={minTime}
      max={maxTime}
      // CONTROLAR LA FECHA PARA QUE FUNCIONEN PREV/NEXT Y TODOS LOS MESES
      date={date}
      onNavigate={(newDate) => setDate(newDate)}
      components={{ toolbar: Toolbar }}
      messages={{
        next: "Siguiente",
        previous: "Anterior",
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        day: "Día",
        agenda: "Agenda",
        date: "Fecha",
        time: "Hora",
        event: "Evento",
        noEventsInRange: "No hay eventos en este rango",
        showMore: (c: number) => `+ Ver ${c} más`,
      }}
      eventPropGetter={() => ({
        style: {
          backgroundColor: "#2563eb",
          borderRadius: "8px",
          color: "white",
          padding: "4px 6px",
          border: "1px solid #1d4ed8",
        },
      })}
    />
  </div>

  {selectedDate && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={() => {
            setSelectedDate(null);
            setSelectedHour(10);
            setEditingEvent(null);
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-gray-900 text-center mb-1">
          {editingEvent ? "Editar cita" : "Nueva cita"}
        </h3>
        <p className="text-center text-sm text-gray-500 mb-4">
          {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>

        <label className="block mb-2 font-medium text-gray-700">Selecciona la hora</label>
        <select
          value={selectedHour}
          onChange={(e) => setSelectedHour(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {hours.map((hour) => {
            const start = new Date(selectedDate);
            start.setHours(hour, 0, 0, 0);
            const taken = events.some(
              (e) => e.start.getTime() === start.getTime() && (!editingEvent || e.id !== editingEvent.id)
            );
            return (
              <option key={hour} value={hour} disabled={taken}>
                {hour}:00 {taken ? "(Lleno)" : ""}
              </option>
            );
          })}
        </select>

        <div className="flex justify-between mt-6 gap-2">
          {editingEvent && (
            <button onClick={handleDeleteAppointment} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Eliminar
            </button>
          )}
          <button
            onClick={() => {
              setSelectedDate(null);
              setSelectedHour(10);
              setEditingEvent(null);
            }}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button onClick={handleSaveAppointment} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {editingEvent ? "Guardar" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  )}

  {toast && (
    <div className="fixed bottom-6 right-6 z-[70]">
      <div className={cn(
        "rounded-lg shadow-lg px-4 py-3 text-white",
        toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"
      )}>
        {toast.message}
      </div>
    </div>
  )}
</div>
);
}
