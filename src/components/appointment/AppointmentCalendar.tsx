"use client";
import { useMemo, useState, useEffect, Fragment, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUser, SignIn } from "@clerk/nextjs";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek as dfStartOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Listbox, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User as UserIcon, Scissors, Clock, Check, X } from 'lucide-react';

// --- Interfaces ---
interface Sede { id: string; nombreSede: string; }
interface Barbero {
  id: string;
  nombreBarbero: string;
  apellidoBarbero: string;
  sede: { id: string };
}
interface Servicio { id: string | number; nombreServicio: string; precio: number; duracionMin: number; }
type AppointmentEvent = { id: string; title: string; start: Date; end: Date; userId: string; sedeId: string; barberoId: string; servicioIds: string[]; };
interface ApiCita { id: string; fechaInicio: string; fechaFin: string; clienteId: string; sedeId: number; barberId: number; services: string; }
interface CitaTitleInfo { barberoId: number | string; clienteId: string; }

// --- Helpers ---
const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: (date: Date) => dfStartOfWeek(date, { weekStartsOn: 1 }), getDay, locales: { es } });
type ToastType = "success" | "error" | "info";
type ToolbarProps = { label: string; onNavigate: (a: "PREV" | "NEXT" | "TODAY" | "DATE") => void; onView: (v: View) => void; view: View; };

// --- Toolbar ---
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

// --- generateEventTitle ---
const generateEventTitle = (cita: CitaTitleInfo, barberos: Barbero[], userId: string | undefined): string => {
  const barberoId = cita.barberoId;
  const clienteId = cita.clienteId;
  const barbero = barberos.find(b => String(b.id) === String(barberoId));
  const nombreBarbero = barbero ? `${barbero.nombreBarbero}` : "Barbero";
  if (userId === clienteId) { return `Tu cita con ${nombreBarbero} 💈`; }
  return `Reservado`;
};

// --- CalendarSkeleton ---
const CalendarSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 md:p-6 animate-pulse">
    <div className="flex justify-between items-center mb-4 h-10"><div className="flex gap-2"><div className="w-24 h-8 bg-gray-200 rounded-lg"></div><div className="w-16 h-8 bg-gray-200 rounded-lg"></div><div className="w-24 h-8 bg-gray-200 rounded-lg"></div></div><div className="w-48 h-8 bg-gray-200 rounded-lg"></div><div className="flex gap-2"><div className="w-16 h-8 bg-gray-200 rounded-lg"></div><div className="w-20 h-8 bg-gray-200 rounded-lg"></div><div className="w-16 h-8 bg-gray-200 rounded-lg"></div></div></div>
    <div className="border-t border-gray-200 h-[600px]"></div>
  </div>
);

export default function AppointmentCalendar() {
  // --- ESTADO ---
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
  const [selectedSede, setSelectedSede] = useState<string>("");
  const [selectedBarbero, setSelectedBarbero] = useState<string>("");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPreselected, setIsPreselected] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- LÓGICA DE FETCH ---
  useEffect(() => {
    async function fetchData() {
      if (!user) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const [sedesRes, barberosRes, serviciosRes, citasRes] = await Promise.all([
          fetch(`${API_URL}/sedes`),
          fetch(`${API_URL}/barberos`),
          fetch(`${API_URL}/servicios`),
          fetch(`${API_URL}/citas-activas`)
        ]);
        if (!sedesRes.ok || !barberosRes.ok || !serviciosRes.ok || !citasRes.ok) {
          const failedRes = [sedesRes, barberosRes, serviciosRes, citasRes].find(res => !res.ok);
          throw new Error(`Fallo al cargar datos: ${failedRes?.statusText} en ${failedRes?.url}`);
        }
        const sedesData = await sedesRes.json();
        const barberosData = await barberosRes.json();
        const serviciosData = await serviciosRes.json();
        const citasData: ApiCita[] = await citasRes.json();
        setSedes(sedesData);
        setBarberos(barberosData);
        setServicios(serviciosData);
        const citasFormateadas = citasData.map((cita: ApiCita) => ({ id: cita.id, start: new Date(cita.fechaInicio), end: new Date(cita.fechaFin), userId: cita.clienteId, sedeId: String(cita.sedeId), barberoId: String(cita.barberId), servicioIds: typeof cita.services === 'string' ? JSON.parse(cita.services) : [], title: generateEventTitle({ barberoId: cita.barberId, clienteId: cita.clienteId }, barberosData, user?.id) }));
        setEvents(citasFormateadas);
      } catch (error) { console.error("Error cargando datos:", error); showToast("Error al conectar", "error");
      } finally { setIsLoading(false); }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, API_URL]); // showToast quitado de dependencias

  // --- useEffect para leer el parámetro de la URL ---
  useEffect(() => {
    const servicioId = searchParams.get('servicio');

    if (servicioId && servicios.length > 0) {
      const servicioValido = servicios.find(s => String(s.id) === String(servicioId));

      if (servicioValido) {
        setSelectedServicios([String(servicioId)]);
        setIsPreselected(true);

        requestAnimationFrame(() => {
            calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('servicio');
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });

      } else {
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.delete('servicio');
          router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicios, searchParams, pathname, router]); // Mantenemos dependencias originales

  // --- LÓGICA DE MEMOS Y HELPERS ---
  const filteredBarberos = useMemo(() => {
    if (!selectedSede) return [];
    return barberos.filter(barbero => barbero.sede && String(barbero.sede.id) === String(selectedSede));
  }, [selectedSede, barberos]);

  // --- AJUSTE useMemo para ordenar los servicios ---
  const sortedServicios = useMemo(() => {
    // Caso 1: Editando una cita existente
    if (editingEvent && editingEvent.servicioIds.length > 0) {
      const selectedIds = editingEvent.servicioIds.map(String); // Asegurar que sean strings
      const selectedFullServices = servicios.filter(s => selectedIds.includes(String(s.id)));
      const otherServices = servicios.filter(s => !selectedIds.includes(String(s.id)));
      // Pone primero los seleccionados (en el orden que estaban si importa), luego los demás
      return [...selectedFullServices, ...otherServices];
    }
    // Caso 2: Preseleccionado desde URL (solo si no estamos editando)
    if (!editingEvent && selectedServicios.length === 1) {
      const preselectedId = selectedServicios[0];
      const preselectedService = servicios.find(s => String(s.id) === preselectedId);
      if (preselectedService) {
        const otherServices = servicios.filter(s => String(s.id) !== preselectedId);
        return [preselectedService, ...otherServices];
      }
    }
    // Caso 3: Ninguno de los anteriores, lista normal
    return servicios;
  // Depende de servicios, selectedServicios (para preselección URL) y editingEvent (para edición)
  }, [servicios, selectedServicios, editingEvent]);


  useEffect(() => { setSelectedBarbero(""); }, [selectedSede]);
  const hours = useMemo(() => Array.from({ length: 13 }, (_, i) => i + 10), []);
  const minTime = useMemo(() => new Date(1970, 0, 1, 10, 0, 0), []);
  const maxTime = useMemo(() => new Date(1970, 0, 1, 22, 0, 0), []);
  const { subtotal, totalDuration } = useMemo(() => (selectedServicios.reduce((acc, currId) => { const s = servicios.find(s => String(s.id) === String(currId)); if (s) { acc.subtotal += s.precio; acc.totalDuration += s.duracionMin; } return acc; }, { subtotal: 0, totalDuration: 0 })), [selectedServicios, servicios]);

  const showToast = (m: string, type: ToastType = "info") => { setToast({ message: m, type }); setTimeout(() => setToast(null), 3000); };


  // --- Bloque !user ---
  if (!user) {
    return (
      <>
        <div ref={calendarRef} id="citas" className="scroll-mt-24 bg-gray-900 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">🔒 Inicia Sesión</h3>
          <p className="text-gray-300">Debes iniciar sesión para poder ver la agenda y reservar tu cita.</p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          >
            Ingresar
          </button>
        </div>

        {isLoginOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setIsLoginOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <SignIn routing="hash" afterSignInUrl="/" />
            </div>
          </div>
        )}
      </>
    );
  }

  // --- HANDLERS (Funcional) ---
  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
    const now = new Date();
    const clickedDate = slot.start;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (clickedDate < startOfToday) { showToast("No puedes agendar en un día que ya pasó.", "error"); return; }
    if (clickedDate < now) { showToast("No puedes agendar en un horario que ya pasó.", "error"); return; }

    setSelectedDate(clickedDate);
    // IMPORTANTE: Asegurarse de limpiar editingEvent al seleccionar un nuevo slot
    setEditingEvent(null);
    setSelectedSede("");
    setSelectedBarbero("");

    if (!isPreselected) {
      setSelectedServicios([]);
    }
    setIsPreselected(false);

    const defaultHour = clickedDate.getHours();
    const currentHour = now.getHours();
    const isToday = clickedDate.toDateString() === now.toDateString();
    setSelectedHour(Math.max(isToday && defaultHour < currentHour ? currentHour : defaultHour, 10));
  };

  const handleServicioChange = (servicioId: string) => {
    setSelectedServicios(prev => prev.includes(servicioId) ? prev.filter(id => id !== servicioId) : [...prev, servicioId]);
  };

  const handleSaveAppointment = async () => {
    if (!user || !selectedDate || !selectedSede || !selectedBarbero || selectedServicios.length === 0) { showToast("Por favor, completa todos los campos.", "error"); return; }
    const start = new Date(selectedDate); start.setHours(selectedHour, 0, 0, 0);
    if (start < new Date()) { showToast("No puedes agendar en pasado.", "error"); return; }
    const end = new Date(start.getTime() + totalDuration * 60000);
    const clash = events.some(e => e.start < end && e.end > start && String(e.barberoId) === String(selectedBarbero) && (!editingEvent || String(e.id) !== String(editingEvent.id)));
    if (clash) { showToast("Barbero ocupado en ese horario.", "error"); return; }
    const appointmentData = { id: editingEvent ? editingEvent.id : `cita_${Date.now()}`, title: "Cita Cliente", fechaInicio: start.toISOString(), fechaFin: end.toISOString(), totalCost: subtotal, clienteId: user.id, sedeId: Number(selectedSede), barberId: Number(selectedBarbero), services: JSON.stringify(selectedServicios), serviciosDetalle: JSON.stringify(selectedServicios.map(id => servicios.find(s => String(s.id) === String(id))?.nombreServicio)), nombreSede: sedes.find(s => s.id === selectedSede)?.nombreSede, nombreCompletoBarbero: (() => { const b = barberos.find(b => b.id === selectedBarbero); return b ? `${b.nombreBarbero} ${b.apellidoBarbero}` : "" })(), };
    try { const url = editingEvent ? `${API_URL}/citas-activas/${editingEvent.id}` : `${API_URL}/citas-activas`; const response = await fetch(url, { method: editingEvent ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(appointmentData), }); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Error servidor'); } const savedResult: ApiCita = await response.json(); const newEvent: AppointmentEvent = { id: savedResult.id, title: generateEventTitle({ barberoId: savedResult.barberId, clienteId: savedResult.clienteId }, barberos, user.id), start: new Date(savedResult.fechaInicio), end: new Date(savedResult.fechaFin), userId: savedResult.clienteId, sedeId: String(savedResult.sedeId), barberoId: String(savedResult.barberId), servicioIds: typeof savedResult.services === 'string' ? JSON.parse(savedResult.services) : [] }; if (editingEvent) { setEvents(prev => prev.map(ev => String(ev.id) === String(newEvent.id) ? newEvent : ev)); showToast("Cita actualizada", "success"); } else { setEvents(prev => [...prev, newEvent]); showToast("Cita creada", "success"); } setSelectedDate(null); setEditingEvent(null); } catch (error: unknown) { console.error("Error save:", error); if (error instanceof Error) { showToast(error.message, "error"); } else { showToast("Error inesperado.", "error"); } }
   };

  const handleDeleteAppointment = async () => {
    if (!editingEvent) return; if (!window.confirm("¿Eliminar cita?")) { return; } try { const response = await fetch(`${API_URL}/citas-activas/${editingEvent.id}`, { method: 'DELETE' }); if (response.status === 204 || response.ok) { setEvents(prev => prev.filter(e => String(e.id) !== String(editingEvent.id))); showToast("Cita eliminada", "success"); setEditingEvent(null); setSelectedDate(null); } else { const errorData = await response.json(); throw new Error(errorData.error || 'Error al eliminar'); } } catch (error: unknown) { console.error("Error delete:", error); if (error instanceof Error) { showToast(error.message, "error"); } else { showToast("Error inesperado al eliminar.", "error"); } }
   };

  // --- JSX (Diseño) ---
  return (
    <div ref={calendarRef} id="citas" className="w-full max-w-7xl mx-auto p-6 scroll-mt-24 bg-gray-900 rounded-2xl">
      <div className="text-center mb-8"><h2 className="text-4xl font-bold text-white">Agenda tu cita 💈</h2><p className="text-gray-300 mt-2">Horario: <b>10:00 am - 10:00 pm</b></p></div>
      {isLoading ? <CalendarSkeleton /> : ( <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-4 md:p-6"> <Calendar culture="es" localizer={localizer} events={events} startAccessor="start" endAccessor="end" selectable onSelectSlot={handleSelectSlot} onSelectEvent={(ev) => { const e = ev as AppointmentEvent; if (e.userId === user?.id) {
        // Al seleccionar un evento para editar, setea editingEvent PRIMERO
        setEditingEvent(e);
        setSelectedDate(e.start);
        setSelectedSede(e.sedeId);
        setSelectedBarbero(e.barberoId);
        // IMPORTANTE: Setea selectedServicios directamente desde el evento
        setSelectedServicios(e.servicioIds.map(String)); // Asegurar que sean strings
        setSelectedHour(e.start.getHours());
        // Resetea la bandera de preselección por URL, ya que estamos editando
        setIsPreselected(false);
       } else { showToast("Horario ocupado.", "info"); } }} style={{ height: 600 }} step={60} timeslots={1} defaultView={Views.WEEK} view={view} onView={(v) => setView(v)} min={minTime} max={maxTime} date={date} onNavigate={(newDate) => setDate(newDate)} components={{ toolbar: Toolbar }} messages={{ next: "Siguiente", previous: "Anterior", today: "Hoy", month: "Mes", week: "Semana", day: "Día", noEventsInRange: "No hay eventos", showMore: (c: number) => `+${c} más` }} eventPropGetter={(event) => ({ style: { backgroundColor: event.userId === user?.id ? '#2563eb' : '#6b7280', borderRadius: "8px", color: "white", padding: "4px 6px", border: `1px solid ${event.userId === user?.id ? '#1d4ed8' : '#4b5563'}` } })} /> </div> )}
      <AnimatePresence> {selectedDate && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4"> <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="bg-gray-800 text-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative my-8 ring-1 ring-white/10"> <button onClick={() => { setSelectedDate(null); setEditingEvent(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Cerrar modal"><X /></button> <h3 className="text-2xl font-semibold text-white text-center mb-1">{editingEvent ? "Editar Cita" : "Nueva Cita"}</h3> <p className="text-center text-sm text-gray-400 mb-6">{format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p> <div className="space-y-5"> {/* PASO 1 */} <div className="space-y-2"> <label htmlFor="sede" className="flex items-center gap-2 font-medium text-gray-200"><MapPin size={18} className="text-blue-400" /> 1. Sede</label> <select id="sede" value={selectedSede} onChange={(e) => setSelectedSede(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="" disabled>-- Elige --</option>{sedes.map((sede) => (<option key={sede.id} value={sede.id}>{sede.nombreSede}</option>))}</select> </div> {/* PASO 2 */} <AnimatePresence> {selectedSede && ( <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2"> <label className="flex items-center gap-2 font-medium text-gray-200"><UserIcon size={18} className="text-blue-400" /> 2. Barbero</label> <Listbox value={selectedBarbero} onChange={setSelectedBarbero} disabled={!selectedSede || filteredBarberos.length === 0}> <div className="relative mt-1"> <Listbox.Button className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 relative cursor-default disabled:opacity-50 disabled:cursor-not-allowed"><span className="block truncate">{(() => { const b = barberos.find(b => String(b.id) === String(selectedBarbero)); if (b) return `${b.nombreBarbero} ${b.apellidoBarbero || ''}`; if (!selectedSede) return "-- Selecciona sede --"; if (filteredBarberos.length === 0) return "-- No hay barberos -- 🚫"; return "-- Elige --"; })()}</span><span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400" aria-hidden="true"><path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.03 8.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3z" transform="rotate(180 10 10)" /></svg></span></Listbox.Button> <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0"><Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">{filteredBarberos.map((barbero) => (<Listbox.Option key={barbero.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-blue-600 text-white' : 'text-gray-200'}`} value={barbero.id}>{({ selected }) => (<><span className={`block truncate ${ selected ? 'font-medium' : 'font-normal'}`}>{barbero.nombreBarbero} {barbero.apellidoBarbero || ''}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400"><Check className="h-5 w-5" aria-hidden="true" /></span>) : null}</>)}</Listbox.Option>))}</Listbox.Options></Transition> </div> </Listbox> </motion.div> )} </AnimatePresence> {/* PASO 3 */} <AnimatePresence> {selectedBarbero && ( <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2"> <label className="flex items-center gap-2 font-medium text-gray-200"><Scissors size={18} className="text-blue-400" /> 3. Servicios</label> <div className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
      {/* Mapear sobre sortedServicios */}
      {sortedServicios.length > 0 ? (sortedServicios.map((servicio) => ( <label key={servicio.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-600 cursor-pointer"><input type="checkbox" checked={selectedServicios.includes(String(servicio.id))} onChange={() => handleServicioChange(String(servicio.id))} disabled={!selectedBarbero} className="h-5 w-5 rounded border-gray-500 bg-gray-600 text-blue-500 focus:ring-blue-500 disabled:opacity-50" /><span className="flex-1 text-gray-200">{servicio.nombreServicio}</span><span className="font-semibold text-gray-300">${servicio.precio.toLocaleString('es-CO')}</span></label> ))) : (<p className="text-sm text-gray-500">No hay.</p>)}</div> {subtotal > 0 && (<div className="text-right mt-2 pr-1"><p className="text-md font-bold text-white">Subtotal: <span className="text-blue-400">${subtotal.toLocaleString('es-CO')}</span></p></div>)} </motion.div> )} </AnimatePresence> {/* PASO 4 */} <AnimatePresence> {selectedServicios.length > 0 && ( <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2"> <label htmlFor="hora" className="flex items-center gap-2 font-medium text-gray-200"><Clock size={18} className="text-blue-400" /> 4. Hora</label> <select id="hora" value={selectedHour} onChange={(e) => setSelectedHour(Number(e.target.value))} disabled={selectedServicios.length === 0} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">{hours.map((hour) => { const now = new Date(); const isToday = new Date(selectedDate).setHours(0,0,0,0) === now.setHours(0,0,0,0); const isPast = isToday && hour < now.getHours(); const start = new Date(selectedDate!); start.setHours(hour,0,0,0); const end = new Date(start.getTime() + totalDuration * 60000); const taken = events.some(e => e.start < end && e.end > start && String(e.barberoId) === String(selectedBarbero) && (!editingEvent || String(e.id) !== String(editingEvent.id))); const isDisabled = taken || isPast; return (<option key={hour} value={hour} disabled={isDisabled}>{hour}:00 {taken ? "(Ocupado)" : isPast ? "(No disp.)" : ""}</option>); })}</select> </motion.div> )} </AnimatePresence> </div> {/* BOTONES */} <div className="flex justify-between mt-8 gap-3">{editingEvent && (<button onClick={handleDeleteAppointment} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">Eliminar</button>)}<button onClick={() => { setSelectedDate(null); setEditingEvent(null); }} className="flex-1 px-4 py-2.5 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 font-semibold transition-colors">Cancelar</button><button onClick={handleSaveAppointment} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-blue-800 disabled:opacity-70" disabled={!selectedBarbero || selectedServicios.length === 0}>{editingEvent ? "Guardar" : "Confirmar"}</button></div> </motion.div> </motion.div> )} </AnimatePresence>
      {toast && (<div className="fixed bottom-6 right-6 z-[70]"><div className={cn("rounded-lg shadow-lg px-5 py-3 text-white font-semibold", toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600")}>{toast.message}</div></div>)}
    </div>
  );
}