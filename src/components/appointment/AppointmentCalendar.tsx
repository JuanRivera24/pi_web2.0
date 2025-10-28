"use client";

import { useMemo, useState, useEffect, Fragment, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUser, SignIn } from "@clerk/nextjs";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek as dfStartOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Listbox, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User as UserIcon, Scissors, Clock, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import UserAppointmentModal from  "@/components/appointment/UserAppointmentModal";

// --- INTERFACES Y TIPOS ---

interface Sede {
  id: string;
  nombreSede: string;
}

interface Barbero {
  id: string;
  nombreBarbero: string;
  apellidoBarbero: string;
  sede: { id: string };
}

interface Servicio {
  id: string | number;
  nombreServicio: string;
  precio: number;
  duracionMin: number;
}

// Exportamos este tipo para que el nuevo modal lo pueda usar
export type AppointmentEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  userId: string;
  sedeId: string;
  barberoId: string;
  servicioIds: string[];
};

interface ApiCita {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  clienteId: string;
  sedeId: number;
  barberId: number;
  services: string;
}

interface CitaTitleInfo {
  barberoId: number | string;
  clienteId: string;
}

type ToastType = "success" | "error" | "info";

interface AppointmentCalendarProps {
  preselectedServiceId?: number | string | null;
  onClose?: (closedBeforeLogin?: boolean) => void;
}

// --- CONSTANTES Y UTILIDADES ---

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => dfStartOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { es },
});

const BOOKING_BUFFER_MINUTES = 30;

// --- COMPONENTE PRINCIPAL ---

export default function AppointmentCalendar({
  preselectedServiceId,
  onClose,
}: AppointmentCalendarProps) {
  // --- HOOKS (Router, Auth, Refs) ---
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const calendarRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- ESTADO (State) ---
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUserAppointmentIndex, setCurrentUserAppointmentIndex] =
    useState<number>(-1);

  // Estado del modal/formulario
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<AppointmentEvent | null>(
    null
  );
  const [selectedSede, setSelectedSede] = useState<string>("");
  const [selectedBarbero, setSelectedBarbero] = useState<string>("");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<number>(10);
  const [isPreselected, setIsPreselected] = useState(false);

  // --- NUEVO ESTADO ---
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estado de datos (API)
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isClient, setIsClient] = useState(false);

  // --- FUNCIONES (Callbacks) ---

  const showToast = useCallback((m: string, type: ToastType = "info") => {
    setToast({ message: m, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // --- EFECTOS (UseEffect) ---

  // Efecto: Cargar datos iniciales (Sedes, Barberos, Servicios, Citas)
  useEffect(() => {
    setIsClient(true);
    async function fetchData() {
      if (!user && !isClient) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        if (user) {
          const [sedesRes, barberosRes, serviciosRes, citasRes] =
            await Promise.all([
              fetch(`${API_URL}/sedes`),
              fetch(`${API_URL}/barberos`),
              fetch(`${API_URL}/servicios`),
              fetch(`${API_URL}/citas-activas`),
            ]);

          if (
            !sedesRes.ok ||
            !barberosRes.ok ||
            !serviciosRes.ok ||
            !citasRes.ok
          ) {
            const failedRes = [
              sedesRes,
              barberosRes,
              serviciosRes,
              citasRes,
            ].find((res) => !res.ok);
            throw new Error(
              `Fallo al cargar datos: ${failedRes?.statusText} en ${failedRes?.url}`
            );
          }
          const sedesData = await sedesRes.json();
          const barberosData = await barberosRes.json();
          const serviciosData = await serviciosRes.json();
          const citasData: ApiCita[] = await citasRes.json();

          setSedes(sedesData);
          setBarberos(barberosData);
          setServicios(serviciosData);

          const citasFormateadas = citasData.map((cita: ApiCita) => ({
            id: cita.id,
            start: new Date(cita.fechaInicio),
            end: new Date(cita.fechaFin),
            userId: cita.clienteId,
            sedeId: String(cita.sedeId),
            barberoId: String(cita.barberId),
            servicioIds:
              typeof cita.services === "string" ? JSON.parse(cita.services) : [],
            title: generateEventTitle(
              { barberoId: cita.barberId, clienteId: cita.clienteId },
              barberosData,
              user?.id
            ),
          }));
          setEvents(citasFormateadas);
        } else {
          // Usuario no logueado, cargar solo servicios
          const serviciosRes = await fetch(`${API_URL}/servicios`);
          if (!serviciosRes.ok)
            throw new Error("Fallo al cargar servicios");
          const serviciosData = await serviciosRes.json();
          setServicios(serviciosData);
          setSedes([]);
          setBarberos([]);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        showToast("Error al conectar", "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, isClient, API_URL, showToast]);

  // Efecto: Manejar servicio preseleccionado (desde URL o props)
  useEffect(() => {
    let serviceIdFromSource: string | number | null = null;
    if (preselectedServiceId) {
      serviceIdFromSource = preselectedServiceId;
    } else {
      serviceIdFromSource = searchParams.get("servicio");
    }

    if (serviceIdFromSource && servicios.length > 0) {
      const servicioValido = servicios.find(
        (s) => String(s.id) === String(serviceIdFromSource)
      );
      if (servicioValido) {
        setSelectedServicios([String(serviceIdFromSource)]);
        setIsPreselected(true);
        // Scroll hacia el calendario
        requestAnimationFrame(() => {
          calendarRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }

      // Limpiar URL si es la página principal (index) y no un modal
      if (!onClose && pathname === "/") {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("servicio");
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      }
    }
  }, [servicios, preselectedServiceId, searchParams, pathname, router, onClose]);
  

  // --- DATOS MEMORIZADOS (UseMemo) ---

  const filteredBarberos = useMemo(() => {
    if (!selectedSede) return [];
    return barberos.filter(
      (barbero) =>
        barbero.sede && String(barbero.sede.id) === String(selectedSede)
    );
  }, [selectedSede, barberos]);

  const userAppointments = useMemo(() => {
    if (!user) return [];
    const filtered = events.filter((event) => event.userId === user.id);
    return filtered.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, user]);

  const sortedServicios = useMemo(() => {
    const servicesToUse = editingEvent
      ? editingEvent.servicioIds
      : selectedServicios;
    if (servicesToUse.length > 0) {
      const selectedIds = servicesToUse.map(String);
      const selectedFullServices = servicios.filter((s) =>
        selectedIds.includes(String(s.id))
      );
      const otherServices = servicios.filter(
        (s) => !selectedIds.includes(String(s.id))
      );
      return [...selectedFullServices, ...otherServices];
    }
    return servicios;
  }, [servicios, selectedServicios, editingEvent]);

  const hours = useMemo(() => Array.from({ length: 13 }, (_, i) => i + 10), []);
  const minTime = useMemo(() => new Date(1970, 0, 1, 10, 0, 0), []);
  const maxTime = useMemo(() => new Date(1970, 0, 1, 22, 0, 0), []);

  const { subtotal, totalDuration } = useMemo(
    () =>
      selectedServicios.reduce(
        (acc, currId) => {
          const s = servicios.find((s) => String(s.id) === String(currId));
          if (s) {
            acc.subtotal += s.precio;
            acc.totalDuration += s.duracionMin;
          }
          return acc;
        },
        { subtotal: 0, totalDuration: 0 }
      ),
    [selectedServicios, servicios]
  );

  // --- MANEJADORES DE EVENTOS (Handlers) ---

  // Manejador: Seleccionar un slot (horario) en el calendario
  const handleSelectSlot = useCallback(
    (slot: { start: Date; end: Date }) => {
      const isAllDaySlot =
        slot.start.getHours() === 0 &&
        slot.start.getMinutes() === 0 &&
        slot.start.getSeconds() === 0 &&
        (view === Views.WEEK || view === Views.DAY);

      if (isAllDaySlot) return;

      const now = new Date();
      const clickedDate = slot.start;

      // Validar día pasado
      const startOfClickedDate = new Date(
        clickedDate.getFullYear(),
        clickedDate.getMonth(),
        clickedDate.getDate()
      );
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      if (startOfClickedDate < startOfToday) {
        showToast("No puedes agendar en un día que ya pasó.", "error");
        return;
      }

      // Validar hora pasada (con buffer)
      const minimumBookingTime = new Date(
        now.getTime() + BOOKING_BUFFER_MINUTES * 60000
      );
      if (
        (view === Views.WEEK || view === Views.DAY) &&
        clickedDate < now
      ) {
        showToast("No puedes agendar en un horario que ya pasó.", "error");
        return;
      }
      if (
        (view === Views.WEEK || view === Views.DAY) &&
        clickedDate < minimumBookingTime
      ) {
        showToast(
          `Debes agendar con al menos ${BOOKING_BUFFER_MINUTES} minutos de antelación.`,
          "error"
        );
        return;
      }

      // Lógica para determinar la hora
      const isToday = clickedDate.toDateString() === now.toDateString();
      const clickedHourInWeekView = clickedDate.getHours();
      let hourToSet = 10;

      if (isToday) {
        // Encontrar la primera hora disponible hoy (con buffer)
        let firstAvailableHourToday = -1;
        for (let hour = 10; hour <= 22; hour++) {
          const slotStartTime = new Date(clickedDate);
          slotStartTime.setHours(hour, 0, 0, 0);
          if (
            slotStartTime.getTime() - now.getTime() >=
            BOOKING_BUFFER_MINUTES * 60000
          ) {
            firstAvailableHourToday = hour;
            break;
          }
        }

        if (firstAvailableHourToday === -1) {
          showToast("Ya no hay horas disponibles para hoy.", "error");
          return;
        }

        if (
          view === Views.MONTH ||
          clickedHourInWeekView < firstAvailableHourToday
        ) {
          hourToSet = firstAvailableHourToday;
        } else {
          hourToSet = clickedHourInWeekView;
        }

        // Validar que la hora + duración mínima no exceda el cierre
        const minDuration =
          servicios.length > 0
            ? Math.min(...servicios.map((s) => s.duracionMin))
            : 30;
        const potentialStartTime = new Date(clickedDate);
        potentialStartTime.setHours(hourToSet, 0, 0, 0);
        const potentialEndTime = new Date(
          potentialStartTime.getTime() + minDuration * 60000
        );

        if (
          hourToSet > 22 ||
          (potentialEndTime.getHours() > 22 ||
            (potentialEndTime.getHours() === 22 &&
              potentialEndTime.getMinutes() > 0))
        ) {
          showToast("Ya no hay horas disponibles para hoy.", "error");
          return;
        }
      } else {
        hourToSet = Math.max(10, clickedHourInWeekView);
      }

      // Abrir modal
      setSelectedHour(hourToSet);
      setSelectedDate(clickedDate);
      setEditingEvent(null);
      setSelectedSede("");
      setSelectedBarbero("auto");
      if (!isPreselected) {
        setSelectedServicios([]);
      }
    },
    [view, showToast, isPreselected, servicios]
  );

  // Manejador: Cambiar selección de servicios
  const handleServicioChange = useCallback(
    (servicioId: string) => {
      const isSelected = selectedServicios.includes(servicioId);
      const availableMinutes = (22 - selectedHour) * 60;

      if (!isSelected) {
        // Validar si al AÑADIR excede el tiempo
        const servicioToAdd = servicios.find(
          (s) => String(s.id) === servicioId
        );
        if (!servicioToAdd) return;

        const newTotalDuration = totalDuration + servicioToAdd.duracionMin;
        if (newTotalDuration > availableMinutes) {
          const remaining = availableMinutes - totalDuration;
          showToast(
            `Excede hora de cierre (10pm). ${remaining <= 0 ? "No queda tiempo" : `Quedan ${remaining} min`
            }.`,
            "error"
          );
          return;
        }
      }

      setSelectedServicios((prev) =>
        prev.includes(servicioId)
          ? prev.filter((id) => id !== servicioId)
          : [...prev, servicioId]
      );
      setIsPreselected(false); // Si cambian servicios, ya no es preseleccionado
    },
    [selectedServicios, selectedHour, totalDuration, servicios, showToast]
  );

  // Manejador: Guardar o Actualizar Cita
  const handleSaveAppointment = useCallback(async () => {
    let finalBarberoId = selectedBarbero;

    if (finalBarberoId === "auto") {
      if (!selectedSede) {
         showToast("Por favor, selecciona una sede primero.", "error");
         return;
      }
      // Buscar barberos DISPONIBLES en esa sede y hora
      const start = new Date(selectedDate!);
      start.setHours(selectedHour, 0, 0, 0);
      const end = new Date(start.getTime() + totalDuration * 60000);

      const availableBarberos = filteredBarberos.filter(barbero => {
        // Está disponible si NO tiene ninguna cita que choque con el horario deseado
        return !events.some(e =>
          e.start < end &&
          e.end > start &&
          String(e.barberoId) === String(barbero.id) &&
          (!editingEvent || String(e.id) !== String(editingEvent.id)) // Excluir la cita actual si se edita
        );
      });


      if (availableBarberos.length === 0) {
        showToast("No hay barberos disponibles en esta sede para la hora seleccionada.", "error");
        return;
      }
      // Seleccionar uno aleatorio DE LOS DISPONIBLES
      const randomIndex = Math.floor(Math.random() * availableBarberos.length);
      finalBarberoId = availableBarberos[randomIndex].id;
    }


    if (
      !user ||
      !selectedDate ||
      !selectedSede ||
      !finalBarberoId || // Ahora SIEMPRE será un ID específico aquí
      selectedServicios.length === 0
    ) {
      showToast("Por favor, completa todos los campos requeridos.", "error");
      return;
    }

    const start = new Date(selectedDate);
    start.setHours(selectedHour, 0, 0, 0);

    // Doble validación de tiempo (por si el usuario dejó el modal abierto)
    const now = new Date();
    if (start < now && (!editingEvent || editingEvent.start > start)) { // Permitir guardar si la hora original era en el pasado
      showToast("No puedes agendar o mover una cita a un horario que ya pasó.", "error");
      return;
    }
    const minimumBookingTime = new Date(
      now.getTime() + BOOKING_BUFFER_MINUTES * 60000
    );
     // Solo aplicar buffer para citas nuevas o citas futuras movidas al presente
    if (!editingEvent || start > now) {
        if (start < minimumBookingTime) {
          showToast(
            `Debes agendar con al menos ${BOOKING_BUFFER_MINUTES} minutos de antelación.`,
            "error"
          );
          return;
        }
    }


    const end = new Date(start.getTime() + totalDuration * 60000);

    // Validar hora de cierre
    if (
      end.getHours() > 22 ||
      (end.getHours() === 22 && end.getMinutes() > 0)
    ) {
      showToast(
        "La cita excede la hora de cierre (10pm). Revisa los servicios o la hora.",
        "error"
      );
      return;
    }

    // Validar choque de horarios (clash) - Doble verificación por seguridad
    const clash = events.some(
      (e) =>
        e.start < end &&
        e.end > start &&
        String(e.barberoId) === String(finalBarberoId) &&
        (!editingEvent || String(e.id) !== String(editingEvent.id))
    );

    if (clash) {
      showToast("Conflicto de horario detectado. El barbero seleccionado ya está ocupado.", "error");
      return;
    }

    // Preparar datos para la API
    const appointmentData = {
      id: editingEvent ? editingEvent.id : `cita_${Date.now()}`,
      title: "Cita Cliente",
      fechaInicio: start.toISOString(),
      fechaFin: end.toISOString(),
      totalCost: subtotal,
      clienteId: user.id,
      sedeId: Number(selectedSede),
      barberId: Number(finalBarberoId),
      services: JSON.stringify(selectedServicios),
      serviciosDetalle: JSON.stringify(
        selectedServicios.map(
          (id) => servicios.find((s) => String(s.id) === String(id))?.nombreServicio
        )
      ),
      nombreSede: sedes.find((s) => s.id === selectedSede)?.nombreSede,
      nombreCompletoBarbero: (() => {
        const b = barberos.find((b) => b.id === finalBarberoId);
        return b ? `${b.nombreBarbero} ${b.apellidoBarbero}` : "";
      })(),
    };

    try {
      const url = editingEvent
        ? `${API_URL}/citas-activas/${editingEvent.id}`
        : `${API_URL}/citas-activas`;
      const method = editingEvent ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el servidor");
      }

      const savedResult: ApiCita = await response.json();

      // Formatear para el calendario local
      const newEvent: AppointmentEvent = {
        id: savedResult.id,
        title: generateEventTitle(
          {
            barberoId: savedResult.barberId,
            clienteId: savedResult.clienteId,
          },
          barberos,
          user.id
        ),
        start: new Date(savedResult.fechaInicio),
        end: new Date(savedResult.fechaFin),
        userId: savedResult.clienteId,
        sedeId: String(savedResult.sedeId),
        barberoId: String(savedResult.barberId),
        servicioIds:
          typeof savedResult.services === "string"
            ? JSON.parse(savedResult.services)
            : [],
      };

      if (editingEvent) {
        setEvents((prev) =>
          prev.map((ev) => (String(ev.id) === String(newEvent.id) ? newEvent : ev))
        );
        showToast("Cita actualizada", "success");
      } else {
        setEvents((prev) => [...prev, newEvent]);
        showToast("Cita creada", "success");
        // Actualizar índice de cita actual
        const updatedUserAppointments = [...userAppointments, newEvent].sort(
          (a, b) => a.start.getTime() - b.start.getTime()
        );
        const newIndex = updatedUserAppointments.findIndex(
          (app) => app.id === newEvent.id
        );
        setCurrentUserAppointmentIndex(newIndex);
      }

      // Cerrar modal de edición
      setSelectedDate(null);
      setEditingEvent(null);
    } catch (error: unknown) {
      console.error("Error al guardar:", error);
      showToast(
        error instanceof Error ? error.message : "Error inesperado.",
        "error"
      );
    }
  }, [
    user,
    selectedDate,
    selectedSede,
    selectedBarbero, // Se necesita aquí para saber si era 'auto' originalmente
    selectedServicios,
    selectedHour,
    totalDuration,
    events,
    editingEvent,
    API_URL,
    barberos,
    sedes,
    showToast,
    userAppointments,
    servicios,
    subtotal,
    filteredBarberos, // Necesario para buscar disponibles si era 'auto'
  ]);


  // --- MANEJADOR DE BORRADO DESDE DETALLES (MODIFICADO) ---
  const handleDeleteFromDetails = useCallback(async (citaId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/citas-activas/${citaId}`,
        { method: "DELETE" }
      );

      if (response.status === 204 || response.ok) {
        setEvents((prev) =>
          prev.filter((e) => String(e.id) !== String(citaId))
        );
        showToast("Cita eliminada", "success");
        setCurrentUserAppointmentIndex(-1); // Resetea el índice

        // Si el modal de edición estaba abierto para *esa* cita, cerrarlo.
        if (editingEvent && editingEvent.id === citaId) {
          setSelectedDate(null);
          setEditingEvent(null);
        }

      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar");
      }
    } catch (error: unknown) {
      console.error("Error al eliminar desde detalles:", error);
      showToast(
        error instanceof Error ? error.message : "Error inesperado.",
        "error"
      );
    }
  }, [API_URL, showToast, editingEvent]);


  // El manejador de borrado original ahora solo llama a la nueva función
  const handleDeleteAppointment = useCallback(async () => {
    if (editingEvent) {
      handleDeleteFromDetails(editingEvent.id);
    }
  }, [editingEvent, handleDeleteFromDetails]);


  // --- MANEJADOR DE EDICIÓN DESDE DETALLES (MODIFICADO) ---
  const handleEditFromDetails = useCallback((cita: AppointmentEvent) => {
    // 1. Establecer el estado para abrir el modal de edición estándar
    setEditingEvent(cita);
    setSelectedDate(cita.start);
    setSelectedSede(cita.sedeId);
    setSelectedBarbero(cita.barberoId);
    setSelectedServicios(cita.servicioIds.map(String));
    setSelectedHour(cita.start.getHours());
    setIsPreselected(false);

    // 2. Actualizar el índice del carrusel de citas
    const index = userAppointments.findIndex((app) => app.id === cita.id);
    setCurrentUserAppointmentIndex(index);
    
  }, [userAppointments]);


  // Manejadores: Navegación entre citas del usuario
  const handleNavigateToPrevUserAppointment = useCallback(() => {
    if (userAppointments.length === 0 || currentUserAppointmentIndex <= 0)
      return;
    const newIndex = currentUserAppointmentIndex - 1;
    setCurrentUserAppointmentIndex(newIndex);
    setDate(userAppointments[newIndex].start);
  }, [userAppointments, currentUserAppointmentIndex]);

  const handleNavigateToNextUserAppointment = useCallback(() => {
    if (
      userAppointments.length === 0 ||
      currentUserAppointmentIndex >= userAppointments.length - 1
    )
      return;
    const newIndex = currentUserAppointmentIndex + 1;
    setCurrentUserAppointmentIndex(newIndex);
    setDate(userAppointments[newIndex].start);
  }, [userAppointments, currentUserAppointmentIndex]);

  // --- RENDERIZADO CONDICIONAL (Auth y Carga) ---

  // Estado inicial (SSR/Pre-hydratation)
  if (!isClient && !user) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-gray-900 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white">Agenda tu cita 💈</h2>
          <p className="text-gray-300 mt-2">
            Horario: <b>10:00 am - 10:00 pm</b>
          </p>
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  // Usuario no logueado (en el cliente)
  if (isClient && !user) {
    // Versión Modal (si 'onClose' se provee)
    if (onClose) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4 min-h-[400px]">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center ring-1 ring-white/10 relative">
            <button
              onClick={() => onClose(true)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-3">
              🔒 Inicia Sesión
            </h2>
            <p className="text-gray-300 mb-6">
              Debes iniciar sesión para poder agendar tu cita.
            </p>
            <SignIn routing="hash" afterSignInUrl={pathname} />
            <button
              onClick={() => onClose(true)}
              className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cerrar calendario
            </button>
          </div>
        </div>
      );
    }
    // Versión Página Completa (index)
    else {
      return (
        <>
          <section
            ref={calendarRef}
            id="citas"
            className="scroll-mt-24 py-16 bg-blue-950 w-full"
          >
            <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                🔒 Inicia Sesión
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Debes iniciar sesión para poder agendar tu cita.
              </p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-transform duration-300 hover:scale-105"
              >
                Ingresar
              </button>
            </div>
          </section>
          {/* Modal de Login (si se hace clic) */}
          {isLoginOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setIsLoginOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <SignIn routing="hash" afterSignInUrl={pathname} />
              </div>
            </div>
          )}
        </>
      );
    }
  }

  // --- RENDERIZADO PRINCIPAL (Calendario) ---

  return (
    <div
      ref={calendarRef}
      id={onClose ? "citas-modal" : "citas"}
      className="w-full max-w-7xl mx-auto p-6 bg-gray-900 rounded-2xl relative scroll-mt-24"
    >
      {/* Botón de cerrar (solo en modo modal) */}
      {onClose && (
        <button
          onClick={() => onClose()}
          className="absolute top-3 right-3 z-10 bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 transition-colors"
          aria-label="Cerrar calendario"
        >
          <X size={20} />
        </button>
      )}

      {/* Encabezado */}
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-white">Agenda tu cita 💈</h2>
        <p className="text-gray-300 mt-2">
          Horario: <b>10:00 am - 10:00 pm</b>
        </p>
      </div>

      {/* Navegación de Citas del Usuario */}
      <div className="text-center mb-4 flex items-center justify-center gap-2 text-gray-300">
        <span>Citas activas: {userAppointments.length}</span>
        {userAppointments.length > 0 && (
          <>
            <button
              onClick={handleNavigateToPrevUserAppointment}
              disabled={currentUserAppointmentIndex <= 0}
              className="disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Ir a cita anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold w-6 text-center">
              {currentUserAppointmentIndex >= 0
                ? currentUserAppointmentIndex + 1
                : "-"}
            </span>
            <button
              onClick={handleNavigateToNextUserAppointment}
              disabled={
                currentUserAppointmentIndex >= userAppointments.length - 1
              }
              className="disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Ir a cita siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Calendario o Skeleton */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-4 md:p-6">
          <Calendar
            culture="es"
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={(ev) => {
              const e = ev as AppointmentEvent;
              if (e.userId === user?.id) {
                // Es cita del usuario: Abrir edición
                setEditingEvent(e);
                setSelectedDate(e.start);
                setSelectedSede(e.sedeId);
                setSelectedBarbero(e.barberoId);
                setSelectedServicios(e.servicioIds.map(String));
                setSelectedHour(e.start.getHours());
                setIsPreselected(false);
                // Actualizar índice
                const index = userAppointments.findIndex(
                  (app) => app.id === e.id
                );
                setCurrentUserAppointmentIndex(index);
              } else {
                // Es cita de otro: Mostrar ocupado
                showToast("Horario ocupado.", "info");
              }
            }}
            style={{ height: 600 }}
            step={60}
            timeslots={1}
            defaultView={Views.WEEK}
            view={view}
            onView={setView}
            min={minTime}
            max={maxTime}
            date={date}
            onNavigate={setDate}
            components={{ toolbar: Toolbar }}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              noEventsInRange: "No hay eventos",
              showMore: (c: number) => `+${c} más`,
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor:
                  event.userId === user?.id ? "#2563eb" : "#6b7280",
                borderRadius: "8px",
                color: "white",
                padding: "4px 6px",
                border: `1px solid ${event.userId === user?.id ? "#1d4ed8" : "#4b5563"
                  }`,
              },
            })}
          />
        </div>
      )}

      {/* Botón "Detalles de la cita" */}
      {!onClose && !isLoading && userAppointments.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setIsDetailsModalOpen(true)}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Ver Detalles de mis Citas ({userAppointments.length})
          </button>
        </div>
      )}

      {/* Modal de Detalles */}
      <AnimatePresence>
        {isDetailsModalOpen && (
          <UserAppointmentModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            appointments={userAppointments}
            onEditAppointment={handleEditFromDetails}
            onDeleteAppointment={handleDeleteFromDetails}
            servicios={servicios}
            barberos={barberos}
            sedes={sedes}
          />
        )}
      </AnimatePresence>


      {/* Modal de Agendamiento / Edición (Existente) */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // --- Z-INDEX MODIFICADO ---
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gray-800 text-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative my-8 ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()} // Evita cierre al hacer clic dentro
            >
              {/* IIFE para calcular minutos disponibles */}
              {(() => {
                const availableMinutes = (22 - selectedHour) * 60;
                return (
                  <>
                    <button
                      onClick={() => {
                        setSelectedDate(null);
                        setEditingEvent(null);
                        setIsPreselected(false);
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                      aria-label="Cerrar modal"
                    >
                      <X />
                    </button>
                    <h3 className="text-2xl font-semibold text-white text-center mb-1">
                      {editingEvent ? "Editar Cita" : "Nueva Cita"}
                    </h3>
                    <p className="text-center text-sm text-gray-400 mb-6">
                      {format(selectedDate, "EEEE d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </p>

                    {/* Formulario */}
                    <div className="space-y-5">
                      {/* 1. Sede */}
                      <div className="space-y-2">
                        <label
                          htmlFor="sede"
                          className="flex items-center gap-2 font-medium text-gray-200"
                        >
                          <MapPin size={18} className="text-blue-400" /> 1. Sede
                        </label>
                        <select
                          id="sede"
                          value={selectedSede}
                          onChange={(e) => {
                            const newSede = e.target.value;
                            setSelectedSede(newSede);

                            // Lógica para resetear el barbero al cambiar de sede
                            if (editingEvent) {
                              if (newSede !== editingEvent.sedeId) {
                                setSelectedBarbero("auto");
                              } else {
                                setSelectedBarbero(editingEvent.barberoId);
                              }
                            } else {
                              setSelectedBarbero("auto");
                            }
                          }}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>
                            -- Elige --
                          </option>
                          {sedes.map((sede) => (
                            <option key={sede.id} value={sede.id}>
                              {sede.nombreSede}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Servicios (Aparece si hay sede) */}
                      <AnimatePresence>
                        {selectedSede && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <label className="flex items-center gap-2 font-medium text-gray-200">
                              <Scissors size={18} className="text-blue-400" /> 2.
                              Servicios
                            </label>
                            <div className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                              {sortedServicios.length > 0 ? (
                                sortedServicios.map((servicio) => {
                                  const isSelected = selectedServicios.includes(
                                    String(servicio.id)
                                  );
                                  const wouldExceedTime =
                                    !isSelected &&
                                    totalDuration + servicio.duracionMin >
                                    availableMinutes;
                                  return (
                                    <label
                                      key={servicio.id}
                                      className={cn(
                                        "flex items-center gap-3 p-2 rounded-md hover:bg-gray-600 cursor-pointer",
                                        wouldExceedTime &&
                                        "opacity-50 cursor-not-allowed"
                                      )}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          handleServicioChange(String(servicio.id))
                                        }
                                        disabled={
                                          !selectedSede || wouldExceedTime
                                        }
                                        className="h-5 w-5 rounded border-gray-500 bg-gray-600 text-blue-500 focus:ring-blue-500 disabled:opacity-50"
                                      />
                                      <span className="flex-1 text-gray-200">
                                        {servicio.nombreServicio}
                                      </span>
                                      <span className="font-semibold text-gray-300">
                                        ${servicio.precio.toLocaleString("es-CO")}
                                      </span>
                                    </label>
                                  );
                                })
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No hay servicios disponibles.
                                </p>
                              )}
                            </div>
                            {subtotal > 0 && (
                              <div className="text-right mt-2 pr-1">
                                <p className="text-md font-bold text-white">
                                  Subtotal:{" "}
                                  <span className="text-blue-400">
                                    ${subtotal.toLocaleString("es-CO")}
                                  </span>
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 3. Barbero (Aparece si hay servicios seleccionados) */}
                      <AnimatePresence>
                        {selectedSede && selectedServicios.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <label className="flex items-center gap-2 font-medium text-gray-200">
                              <UserIcon size={18} className="text-blue-400" /> 3.
                              Barbero (Opcional)
                            </label>
                            <Listbox
                              value={selectedBarbero}
                              onChange={setSelectedBarbero}
                              disabled={!selectedSede || filteredBarberos.length === 0}
                            >
                              <div className="relative mt-1">
                                <Listbox.Button className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 relative cursor-default disabled:opacity-50 disabled:cursor-not-allowed">
                                  <span className="block truncate">
                                    {(() => {
                                      if (selectedBarbero === "auto") {
                                        return "Asignación automática";
                                      }
                                      const b = barberos.find(
                                        (b) =>
                                          String(b.id) === String(selectedBarbero)
                                      );
                                      if (b)
                                        return `${b.nombreBarbero} ${b.apellidoBarbero || ""
                                          }`;
                                      if (!selectedSede)
                                        return "-- Selecciona sede --";
                                      if (filteredBarberos.length === 0)
                                        return "-- No hay barberos -- 🚫";
                                      return "-- Elige --";
                                    })()}
                                  </span>
                                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="w-5 h-5 text-gray-400"
                                      aria-hidden="true"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.03 8.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3z"
                                        transform="rotate(180 10 10)"
                                      />
                                    </svg>
                                  </span>
                                </Listbox.Button>

                                <Transition
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                                    <Listbox.Option
                                      key="auto"
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active
                                          ? "bg-blue-600 text-white"
                                          : "text-gray-200"
                                        }`
                                      }
                                      value="auto"
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={`block truncate ${selected
                                              ? "font-medium"
                                              : "font-normal"
                                              }`}
                                          >
                                            Asignación automática
                                          </span>
                                          {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                                              <Check
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>

                                    {filteredBarberos.map((barbero) => (
                                      <Listbox.Option
                                        key={barbero.id}
                                        className={({ active }) =>
                                          `relative cursor-default select-none py-2 pl-10 pr-4 ${active
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-200"
                                          }`
                                        }
                                        value={barbero.id}
                                      >
                                        {({ selected }) => (
                                          <>
                                            <span
                                              className={`block truncate ${selected
                                                ? "font-medium"
                                                : "font-normal"
                                                }`}
                                            >
                                              {barbero.nombreBarbero}{" "}
                                              {barbero.apellidoBarbero || ""}
                                            </span>
                                            {selected ? (
                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                                                <Check
                                                  className="h-5 w-5"
                                                  aria-hidden="true"
                                                />
                                              </span>
                                            ) : null}
                                          </>
                                        )}
                                      </Listbox.Option>
                                    ))}
                                  </Listbox.Options>
                                </Transition>
                              </div>
                            </Listbox>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 4. Hora (Aparece si hay servicios) */}
                      <AnimatePresence>
                        {selectedSede && selectedServicios.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <label
                              htmlFor="hora"
                              className="flex items-center gap-2 font-medium text-gray-200"
                            >
                              <Clock size={18} className="text-blue-400" /> 4.
                              Hora
                            </label>
                            <select
                              id="hora"
                              value={selectedHour}
                              onChange={(e) =>
                                setSelectedHour(Number(e.target.value))
                              }
                              disabled={selectedServicios.length === 0}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {/* --- INICIO MODIFICACIÓN VALIDACIÓN VISUAL HORA --- */}
                              {hours.map((hour) => {
                                const now = new Date();
                                const isToday =
                                  new Date(selectedDate).setHours(0, 0, 0, 0) ===
                                  new Date(now).setHours(0, 0, 0, 0);

                                // Calcular tiempos
                                const potentialStart = new Date(selectedDate!);
                                potentialStart.setHours(hour, 0, 0, 0);
                                const potentialEnd = new Date(
                                  potentialStart.getTime() + totalDuration * 60000
                                );

                                // Validaciones comunes
                                const isPast = isToday && hour < now.getHours();
                                const timeDifference =
                                  potentialStart.getTime() - now.getTime();
                                const isWithinBuffer =
                                  isToday &&
                                  timeDifference <
                                  BOOKING_BUFFER_MINUTES * 60000;
                                const exceedsClose =
                                  potentialEnd.getHours() > 22 ||
                                  (potentialEnd.getHours() === 22 &&
                                    potentialEnd.getMinutes() > 0);

                                // Validación de Ocupado (Taken) - Depende si es "auto" o específico
                                let taken = false;
                                let label = "";

                                if (selectedBarbero === "auto") {
                                  // Caso "auto": ¿Están TODOS los barberos de la sede ocupados?
                                  if (filteredBarberos.length > 0) {
                                      taken = filteredBarberos.every(barbero => {
                                          return events.some(e =>
                                              e.start < potentialEnd &&
                                              e.end > potentialStart &&
                                              String(e.barberoId) === String(barbero.id) &&
                                              (!editingEvent || String(e.id) !== String(editingEvent.id))
                                          );
                                      });
                                      if (taken) label = " (Todos ocupados)";
                                  } else {
                                      taken = true; // No hay barberos en la sede para esa hora
                                      label = " (No hay barberos)";
                                  }
                                } else {
                                  // Caso específico: ¿Está ESTE barbero ocupado?
                                  taken = events.some(
                                    (e) =>
                                      e.start < potentialEnd &&
                                      e.end > potentialStart &&
                                      String(e.barberoId) === String(selectedBarbero) &&
                                      (!editingEvent ||
                                        String(e.id) !== String(editingEvent.id))
                                  );
                                   if (taken) label = " (Ocupado)";
                                }

                                // Combinar todas las condiciones de deshabilitado
                                const isDisabled =
                                  taken ||
                                  isPast ||
                                  exceedsClose ||
                                  isWithinBuffer;

                                // Ajustar etiquetas de prioridad (más importante primero)
                                if (isPast) label = " (Pasado)";
                                else if (isWithinBuffer) label = " (No disponible)";
                                else if (exceedsClose) label = " (Excede cierre)";
                                // La etiqueta 'taken' ya se estableció arriba

                                return (
                                  <option
                                    key={hour}
                                    value={hour}
                                    disabled={isDisabled}
                                  >
                                    {hour}:00 {label}
                                  </option>
                                );
                              })}
                               {/* --- FIN MODIFICACIÓN VALIDACIÓN VISUAL HORA --- */}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-between mt-8 gap-3">
                      {editingEvent && (
                        <button
                          onClick={handleDeleteAppointment}
                          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedDate(null);
                          setEditingEvent(null);
                          setIsPreselected(false);
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 font-semibold transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveAppointment}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-blue-800 disabled:opacity-70"
                        disabled={
                          !selectedSede || selectedServicios.length === 0
                        }
                      >
                        {editingEvent ? "Guardar" : "Confirmar"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast / Notificación */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100]">
          {/* Z-index subido a 100 para que aparezca sobre todos los modales */}
          <div
            className={cn(
              "rounded-lg shadow-lg px-5 py-3 text-white font-semibold",
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
            )}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES Y AYUDANTES ---

type ToolbarProps = {
  label: string;
  onNavigate: (a: "PREV" | "NEXT" | "TODAY" | "DATE") => void;
  onView: (v: View) => void;
  view: View;
};

// Componente: Barra de herramientas personalizada del calendario
const Toolbar = ({ label, onNavigate, onView, view }: ToolbarProps) => {
  const btn = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Navegación (Izquierda) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("PREV")}
          className={cn(btn, "bg-blue-50 text-blue-700 hover:bg-blue-100")}
        >
          ← Anterior
        </button>
        <button
          onClick={() => onNavigate("TODAY")}
          className={cn(btn, "bg-blue-600 text-white hover:bg-blue-700")}
        >
          Hoy
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className={cn(btn, "bg-blue-50 text-blue-700 hover:bg-blue-100")}
        >
          Siguiente →
        </button>
      </div>
      {/* Label (Centro) */}
      <div className="text-center text-lg font-semibold text-gray-800">
        {label}
      </div>
      {/* Vistas (Derecha) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(Views.DAY)}
          className={cn(
            btn,
            view === Views.DAY
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Día
        </button>
        <button
          onClick={() => onView(Views.WEEK)}
          className={cn(
            btn,
            view === Views.WEEK
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Semana
        </button>
        <button
          onClick={() => onView(Views.MONTH)}
          className={cn(
            btn,
            view === Views.MONTH
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Mes
        </button>
      </div>
    </div>
  );
};

// Función: Generar título del evento
const generateEventTitle = (
  cita: CitaTitleInfo,
  barberos: Barbero[],
  userId: string | undefined
): string => {
  const barberoId = cita.barberoId;
  const clienteId = cita.clienteId;
  const barbero = barberos.find((b) => String(b.id) === String(barberoId));
  const nombreBarbero = barbero ? `${barbero.nombreBarbero}` : "Barbero";

  if (userId === clienteId) {
    return `Tu cita con ${nombreBarbero}`;
  }
  return `Reservado`;
};

// Componente: Skeleton de Carga
const CalendarSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 md:p-6 animate-pulse">
    {/* Skeleton Toolbar */}
    <div className="flex justify-between items-center mb-4 h-10">
      <div className="flex gap-2">
        <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="w-48 h-8 bg-gray-200 rounded-lg"></div>
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
    {/* Skeleton Calendar Body */}
    <div className="border-t border-gray-200 h-[600px]"></div>
  </div>
);