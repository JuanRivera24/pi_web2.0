"use client";
import { useMemo, useState, useEffect, Fragment } from "react";
import { useUser } from "@clerk/nextjs";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek as dfStartOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Locale } from "date-fns";
import { Listbox, Transition } from '@headlessui/react';

// --- Definiciones de tipos ---
interface Sede { ID_Sede: string; Nombre_Sede: string; }
interface Barbero { ID_Barbero: string; Nombre_Barbero: string; Apellido_Barbero: string; ID_Sede: string; }
interface Servicio { ID_Servicio: string; Nombre_Servicio: string; Precio: string; Duracion_min: string; }
type AppointmentEvent = { id: string; title: string; start: Date; end: Date; userId: string; sedeId: string; barberoId: string; servicioIds: string[]; };

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const locales: Record<string, Locale> = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: (date: Date) => dfStartOfWeek(date, { weekStartsOn: 1 }), getDay, locales });
type ToastType = "success" | "error" | "info";
type ToolbarProps = { label: string; onNavigate: (a: "PREV" | "NEXT" | "TODAY" | "DATE") => void; onView: (v: View) => void; view: View; };

const Toolbar = ({ label, onNavigate, onView, view }: ToolbarProps) => {
  const btn = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-2"><button onClick={() => onNavigate("PREV")} className={cn(btn, "bg-blue-50 text-blue-700 hover:bg-blue-100")}>← Anterior</button><button onClick={() => onNavigate("TODAY")} className={cn(btn, "bg-blue-600 text-white hover:bg-blue-700")}>Hoy</button><button onClick={() => onNavigate("NEXT")} className={cn(btn, "bg-blue-50 text-blue-700 hover:bg-blue-100")}>Siguiente →</button></div>
      <div className="text-center text-lg font-semibold text-gray-800">{label}</div>
      <div className="flex items-center gap-2"><button onClick={() => onView(Views.DAY)} className={cn(btn, view === Views.DAY ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>Día</button><button onClick={() => onView(Views.WEEK)} className={cn(btn, view === Views.WEEK ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>Semana</button><button onClick={() => onView(Views.MONTH)} className={cn(btn, view === Views.MONTH ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>Mes</button></div>
    </div>
  );
};

const generateEventTitle = (cita: any, barberos: Barbero[], userId: string | undefined): string => {
  const barberoId = cita.barberId;
  const clienteId = cita.clienteId;
  const barbero = barberos.find(b => String(b.ID_Barbero) === String(barberoId));
  const nombreBarbero = barbero ? `${barbero.Nombre_Barbero}` : "Barbero";
  if (userId === clienteId) { return `Tu cita con ${nombreBarbero} 💈`; }
  return `Reservado con ${nombreBarbero}`;
};

export default function AppointmentCalendar() {
  const { user } = useUser();
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<AppointmentEvent | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSede, setSelectedSede] = useState<string>("");
  const [selectedBarbero, setSelectedBarbero] = useState<string>("");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<number>(10);
  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    async function fetchData() {
      try {
        const [sedesRes, barberosRes, serviciosRes, citasRes] = await Promise.all([
          fetch(`${API_URL}/sedes`),
          fetch(`${API_URL}/barberos`),
          fetch(`${API_URL}/servicios`),
          fetch(`${API_URL}/nuevas_citas`) // <-- CORRECCIÓN #1
        ]);
        if (!sedesRes.ok || !barberosRes.ok || !serviciosRes.ok || !citasRes.ok) {
          throw new Error('Fallo al cargar datos iniciales desde la API');
        }
        const sedesData = await sedesRes.json();
        const barberosData = await barberosRes.json();
        const serviciosData = await serviciosRes.json();
        const citasData = await citasRes.json();
        setSedes(sedesData);
        setBarberos(barberosData);
        setServicios(serviciosData);
        const citasFormateadas = citasData.map((cita: any) => ({
          id: cita.id,
          start: new Date(cita.start),
          end: new Date(cita.end),
          userId: cita.clienteId,
          sedeId: cita.sedeId,
          barberoId: cita.barberId,
          servicioIds: typeof cita.services === 'string' ? JSON.parse(cita.services) : [],
          title: generateEventTitle(cita, barberosData, user?.id)
        }));
        setEvents(citasFormateadas);
      } catch (error) {
        console.error("Error cargando datos desde la API:", error);
        showToast("Error al conectar con el servidor", "error");
      } finally {
        setIsLoading(false);
      }
    }
    if (user) { fetchData(); }
  }, [user]);

  const filteredBarberos = useMemo(() => {
    if (!selectedSede) return [];
    return barberos.filter(barbero => String(barbero.ID_Sede) === String(selectedSede));
  }, [selectedSede, barberos]);

  useEffect(() => { setSelectedBarbero(""); }, [selectedSede]);
  const hours = useMemo(() => Array.from({ length: 13 }, (_, i) => i + 10), []);
  const minTime = useMemo(() => new Date(1970, 0, 1, 10, 0, 0), []);
  const maxTime = useMemo(() => new Date(1970, 0, 1, 22, 0, 0), []);
  const { subtotal, totalDuration } = useMemo(() => (selectedServicios.reduce((acc, currId) => { const s = servicios.find(s => String(s.ID_Servicio) === String(currId)); if (s) { acc.subtotal += parseInt(s.Precio); acc.totalDuration += parseInt(s.Duracion_min); } return acc; }, { subtotal: 0, totalDuration: 0 })), [selectedServicios, servicios]);
  const showToast = (m: string, type: ToastType = "info") => { setToast({ message: m, type }); setTimeout(() => setToast(null), 2600); };

  if (!user) {
    return (<div id="citas" className="scroll-mt-24"><p className="text-center py-10 text-lg font-semibold text-gray-700">🔒 Debes iniciar sesión para agendar citas.</p></div>);
  }

  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
    if (slot.start < new Date()) { showToast("No puedes agendar en el pasado", "error"); return; }
    setSelectedDate(slot.start); setEditingEvent(null); setSelectedSede(""); setSelectedBarbero(""); setSelectedServicios([]); setSelectedHour(10);
  };
  const handleServicioChange = (servicioId: string) => {
    setSelectedServicios(prev => prev.includes(servicioId) ? prev.filter(id => id !== servicioId) : [...prev, servicioId]);
  };
  const handleSaveAppointment = async () => {
    if (!user || !selectedDate || !selectedSede || !selectedBarbero || selectedServicios.length === 0) {
      showToast("Por favor, completa todos los campos.", "error"); return;
    }
    const start = new Date(selectedDate); start.setHours(selectedHour, 0, 0, 0);
    const end = new Date(start.getTime() + totalDuration * 60000);
    const clash = events.some(e => e.start < end && e.end > start && String(e.barberoId) === String(selectedBarbero) && (!editingEvent || String(e.id) !== String(editingEvent.id)));
    if (clash) { showToast("Ese barbero ya tiene una cita en ese horario.", "error"); return; }
    const appointmentData = {
      sedeId: selectedSede, barberId: selectedBarbero, clienteId: user.id,
      services: JSON.stringify(selectedServicios), totalCost: subtotal.toString(),
      start: start.toISOString(), end: end.toISOString(),
      title: generateEventTitle({ barberoId: selectedBarbero, clienteId: user.id }, barberos, user.id),
    };
    try {
      // --- CORRECCIÓN DEFINITIVA #2 ---
      const url = editingEvent ? `${API_URL}/nuevas_citas/${editingEvent.id}` : `${API_URL}/nuevas_citas`;
      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) { throw new Error((await response.json()).message || 'Error del servidor'); }
      const savedResult = await response.json();
      const citaGuardada = savedResult.data;
      const newEvent: AppointmentEvent = { id: citaGuardada.id, title: generateEventTitle(citaGuardada, barberos, user.id), start: new Date(citaGuardada.start), end: new Date(citaGuardada.end), userId: citaGuardada.clienteId, sedeId: citaGuardada.sedeId, barberoId: citaGuardada.barberId, servicioIds: JSON.parse(citaGuardada.services) };
      if (editingEvent) {
        setEvents(prev => prev.map(ev => String(ev.id) === String(newEvent.id) ? newEvent : ev));
        showToast("Cita actualizada con éxito", "success");
      } else {
        setEvents(prev => [...prev, newEvent]);
        showToast("Cita creada con éxito", "success");
      }
      setSelectedDate(null); setEditingEvent(null);
    } catch (error: any) {
      console.error("Error en handleSaveAppointment:", error);
      showToast(error.message, "error");
    }
  };
  const handleDeleteAppointment = async () => {
    if (!editingEvent) return;
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) { return; }
    try {
      // --- CORRECCIÓN DEFINITIVA #3 ---
      const response = await fetch(`${API_URL}/nuevas_citas/${editingEvent.id}`, { method: 'DELETE' });
      if (!response.ok) { throw new Error((await response.json()).message || 'Error al eliminar'); }
      setEvents(prev => prev.filter(e => String(e.id) !== String(editingEvent.id)));
      showToast("Cita eliminada correctamente", "success");
      setEditingEvent(null); setSelectedDate(null);
    } catch (error: any) {
      console.error("Error en handleDeleteAppointment:", error);
      showToast(error.message, "error");
    }
  };

  return (
    <div id="citas" className="w-full max-w-6xl mx-auto p-6 scroll-mt-24">
      <div className="text-center mb-8"><h2 className="text-4xl font-bold text-gray-900">Agenda tu cita 💈</h2><p className="text-gray-600 mt-2">Horario: <b>10:00 am - 10:00 pm</b></p></div>
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-4 md:p-6">
        <Calendar culture="es" localizer={localizer} events={events} startAccessor="start" endAccessor="end" selectable onSelectSlot={handleSelectSlot}
          onSelectEvent={(ev) => {
            const e = ev as AppointmentEvent;
            if (e.userId === user.id) {
              setEditingEvent(e); setSelectedDate(e.start); setSelectedSede(e.sedeId); setSelectedBarbero(e.barberoId); setSelectedServicios(e.servicioIds); setSelectedHour(e.start.getHours());
            } else { showToast("Este horario ya está ocupado.", "info"); }
          }}
          style={{ height: 600 }} step={60} timeslots={1} defaultView={Views.WEEK} view={view} onView={(v) => setView(v)} min={minTime} max={maxTime} date={date} onNavigate={(newDate) => setDate(newDate)}
          components={{ toolbar: Toolbar }}
          messages={{ next: "Siguiente", previous: "Anterior", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Agenda", date: "Fecha", time: "Hora", event: "Evento", noEventsInRange: "No hay eventos en este rango", showMore: (c: number) => `+ Ver ${c} más` }}
          eventPropGetter={(event) => ({ style: { backgroundColor: event.userId === user.id ? '#2563eb' : '#6b7280', borderRadius: "8px", color: "white", padding: "4px 6px", border: `1px solid ${event.userId === user.id ? '#1d4ed8' : '#4b5563'}` } })}
        />
      </div>
      {selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 overflow-y-auto p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative my-8">
            <button onClick={() => { setSelectedDate(null); setEditingEvent(null); }} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">✕</button>
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-1">{editingEvent ? "Editar cita" : "Nueva cita"}</h3>
            <p className="text-center text-sm text-gray-500 mb-6">{format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
            <div className="space-y-4">
              <div><label htmlFor="sede" className="block mb-2 font-medium text-gray-700">1. Selecciona la Sede</label><select id="sede" value={selectedSede} onChange={(e) => setSelectedSede(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"><option value="" disabled>-- Elige una sede --</option>{sedes.map((sede) => (<option key={sede.ID_Sede} value={sede.ID_Sede}>{sede.Nombre_Sede}</option>))}</select></div>
              <div>
                <label htmlFor="barbero" className="block mb-2 font-medium text-gray-700">2. Selecciona tu Barbero</label>
                <Listbox value={selectedBarbero} onChange={setSelectedBarbero} disabled={!selectedSede || filteredBarberos.length === 0}>
                  <div className="relative mt-1">
                    <Listbox.Button id="barbero" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100 relative cursor-default text-left bg-white"><span className="block truncate text-black">{(() => { const b = barberos.find(b => String(b.ID_Barbero) === String(selectedBarbero)); return b ? `${b.Nombre_Barbero} ${b.Apellido_Barbero || ''}` : selectedSede ? "-- Elige un barbero --" : "-- Primero selecciona una sede --"; })()}</span><span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400" aria-hidden="true"><path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.03 8.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3z" transform="rotate(180 10 10)" /></svg></span></Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">{filteredBarberos.map((barbero) => (<Listbox.Option key={barbero.ID_Barbero} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`} value={barbero.ID_Barbero}>{({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{barbero.Nombre_Barbero} {barbero.Apellido_Barbero || ''}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg></span>) : null}</>)}</Listbox.Option>))}</Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">3. Elige los Servicios</label>
                <div className="w-full border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-white">{servicios.length > 0 ? (servicios.map((servicio) => (<label key={servicio.ID_Servicio} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"><input type="checkbox" checked={selectedServicios.includes(servicio.ID_Servicio)} onChange={() => handleServicioChange(servicio.ID_Servicio)} disabled={!selectedBarbero} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" /><span className="flex-1 text-gray-800">{servicio.Nombre_Servicio}</span><span className="font-semibold text-gray-600">${parseInt(servicio.Precio).toLocaleString('es-CO')}</span></label>))) : (<p className="text-sm text-gray-500">No hay servicios.</p>)}</div>
                {subtotal > 0 && (<div className="text-right mt-2 pr-2"><p className="text-md font-bold text-gray-800">Subtotal: <span className="text-blue-600">${subtotal.toLocaleString('es-CO')}</span></p></div>)}
              </div>
              <div>
                <label htmlFor="hora" className="block mb-2 font-medium text-gray-700">4. Selecciona la Hora</label>
                <select id="hora" value={selectedHour} onChange={(e) => setSelectedHour(Number(e.target.value))} disabled={selectedServicios.length === 0} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100">
                  {hours.map((hour) => {
                    const start = new Date(selectedDate); start.setHours(hour, 0, 0, 0);
                    const end = new Date(start.getTime() + totalDuration * 60000);
                    const taken = events.some(e => e.start < end && e.end > start && String(e.barberoId) === String(selectedBarbero) && (!editingEvent || String(e.id) !== String(editingEvent.id)));
                    return (<option key={hour} value={hour} disabled={taken} className="text-black">{hour}:00 {taken ? "(Ocupado)" : ""}</option>);
                  })}
                </select>
              </div>
            </div>
            <div className="flex justify-between mt-6 gap-2">
              {editingEvent && (<button onClick={handleDeleteAppointment} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Eliminar</button>)}
              <button onClick={() => { setSelectedDate(null); setEditingEvent(null); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
              <button onClick={handleSaveAppointment} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{editingEvent ? "Guardar Cambios" : "Confirmar Cita"}</button>
            </div>
          </div>
        </div>
      )}
      {toast && (<div className="fixed bottom-6 right-6 z-[70]"><div className={cn("rounded-lg shadow-lg px-4 py-3 text-white", toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600")}>{toast.message}</div></div>)}
    </div>
  );
}