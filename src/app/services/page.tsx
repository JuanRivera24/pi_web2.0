"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppointmentCalendar from "@/components/appointment/AppointmentCalendar";

// --- TIPOS ---
type Option = { name: string; price: string };
type Service = {
  id: number;
  title: string;
  category: string;
  image: string;
  details: string;
  options: Option[];
};

// --- DATOS (Constante) ---
const servicios: Service[] = [
  {
    id: 201,
    title: "Corte Premium",
    category: "Cabello",
    image: "/Images/premium.png",
    details:
      "Duración 45 min. Incluye asesoría personalizada, lavado, corte con precisión y acabado con productos de alta calidad.",
    options: [{ name: "Corte Premium", price: "$25.000" }],
  },
  {
    id: 204,
    title: "Ritual Completo",
    category: "Cabello y Barba",
    image: "/Images/completo.jpeg",
    details:
      "Duración 70 min. Corte, arreglo de barba, limpieza facial y masaje relajante en un solo servicio integral.",
    options: [{ name: "Ritual Completo", price: "$40.000" }],
  },
  {
    id: 202,
    title: "Afeitado Clásico",
    category: "Barba",
    image: "/Images/afeitado.jpg",
    details:
      "Duración 30 min. Afeitado tradicional con toalla caliente, navaja y bálsamo calmante para un acabado suave.",
    options: [{ name: "Afeitado Clásico", price: "$18.000" }],
  },
  {
    id: 209,
    title: "Limpieza Facial Profunda",
    category: "Facial",
    image: "/Images/limpiezap.jpg",
    details:
      "Duración 50 min. Tratamiento completo con vapor, exfoliación, extracción y mascarilla purificante.",
    options: [{ name: "Limpieza Facial Profunda", price: "$35.000" }],
  },
  {
    id: 215,
    title: "Paquete Ejecutivo",
    category: "Cabello y Barba",
    image: "/Images/paquete.jpg",
    details:
      "Duración 90 min. Incluye corte, barba, limpieza facial y masaje capilar para una experiencia completa.",
    options: [{ name: "Paquete Ejecutivo", price: "$60.000" }],
  },
  {
    id: 203,
    title: "Arreglo de Barba",
    category: "Barba",
    image: "/Images/barba.jpg",
    details:
      "Duración 25 min. Perfilado y diseño de barba con máquina y navaja, finalizando con aceites hidratantes.",
    options: [{ name: "Arreglo de Barba", price: "$15.000" }],
  },
  {
    id: 205,
    title: "Corte Clásico",
    category: "Cabello",
    image: "/Images/corte-clasico.jpg",
    details:
      "Duración 40 min. Corte tradicional con estilo, lavado y acabado con productos de fijación ligera.",
    options: [{ name: "Corte Clásico", price: "$20.000" }],
  },
  {
    id: 206,
    title: "Corte Infantil",
    category: "Cabello",
    image: "/Images/infantil.jpg",
    details:
      "Duración 30 min. Corte divertido y cuidadoso para niños, con atención especial y ambiente amigable.",
    options: [{ name: "Corte Infantil", price: "$15.000" }],
  },
  {
    id: 207,
    title: "Perfilado de Cejas",
    category: "Facial",
    image: "/Images/perfilado.jpeg",
    details:
      "Duración 15 min. Definición precisa de cejas con cera o navaja para un acabado natural y limpio.",
    options: [{ name: "Perfilado de Cejas", price: "$12.000" }],
  },
  {
    id: 208,
    title: "Limpieza Facial Express",
    category: "Facial",
    image: "/Images/express.jpg",
    details:
      "Duración 25 min. Limpieza rápida para eliminar impurezas y revitalizar la piel en poco tiempo.",
    options: [{ name: "Limpieza Facial Express", price: "$22.000" }],
  },
  {
    id: 214,
    title: "Tratamiento Capilar Nutritivo",
    category: "Capilar",
    image: "/Images/tratamiento.jpg",
    details:
      "Duración 50 min. Hidratación profunda para fortalecer el cabello con mascarillas y masajes nutritivos.",
    options: [{ name: "Tratamiento Capilar Nutritivo", price: "$40.000" }],
  },
  {
    id: 211,
    title: "Tinte Capilar",
    category: "Capilar",
    image: "/Images/color.jpg",
    details:
      "Duración 45 min. Coloración completa del cabello con productos de alta calidad y asesoría de tono.",
    options: [{ name: "Tinte Capilar", price: "$30.000" }],
  },
  {
    id: 212,
    title: "Masaje Capilar Relajante",
    category: "Capilar",
    image: "/Images/masajec.jpg",
    details:
      "Duración 20 min. Masaje profundo en cuero cabelludo que estimula la circulación y reduce el estrés.",
    options: [{ name: "Masaje Capilar Relajante", price: "$20.000" }],
  },
  {
    id: 213,
    title: "Exfoliación Facial",
    category: "Facial",
    image: "/Images/exfoliacion.jpg",
    details:
      "Duración 30 min. Limpieza que elimina células muertas y deja la piel suave y renovada.",
    options: [{ name: "Exfoliación Facial", price: "$28.000" }],
  },
  {
    id: 210,
    title: "Coloración de Barba",
    category: "Barba",
    image: "/Images/colorb.jpg",
    details:
      "Duración 30 min. Aplicación de tinte profesional para igualar el tono y cubrir canas de la barba.",
    options: [{ name: "Coloración de Barba", price: "$18.000" }],
  },
];

// --- COMPONENTE ---
export default function ServiciosPage() {
  const [detalle, setDetalle] = useState<Service | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [serviceIdToBook, setServiceIdToBook] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Efecto: Cerrar modales con 'Escape'
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDetalle(null);
        setIsCalendarModalOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // Abrir modal de calendario
  const openCalendarModal = (serviceId: number) => {
    setServiceIdToBook(serviceId);
    setIsCalendarModalOpen(true);
    setDetalle(null); // Cierra el modal de detalles
  };

  // Cerrar modal de calendario
  // Acepta un parámetro opcional
  const closeCalendarModal = (closedBeforeLogin?: boolean) => {
    setIsCalendarModalOpen(false);
    setServiceIdToBook(null);

    // Solo muestra el toast si NO se cerró antes de iniciar sesión
    if (!closedBeforeLogin) {
      setToastMessage(
        "Calendario cerrado. Puedes visualizar la agenda completa en el inicio."
      );
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <main id="services" className="bg-gray-900 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-[100] bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Encabezado */}
      <section className="px-6 pt-28">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Nuestros Servicios 💈
          </h1>
          <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
            Estilo, precisión y una experiencia premium pensada para ti.
          </p>
        </div>
      </section>

      {/* Listado de Servicios */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {servicios.map((servicio: Service) => (
            <div
              key={servicio.id}
              onClick={() => setDetalle(servicio)}
              className="group bg-gray-800 rounded-2xl shadow-lg ring-1 ring-white/10 hover:shadow-blue-500/20 hover:ring-blue-500 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
                {/* Imagen */}
                <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
                  <Image
                    src={servicio.image}
                    alt={servicio.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={servicio.id === 201}
                  />
                </div>
                {/* Contenido */}
                <div className="p-6 flex flex-col justify-center">
                  <h2 className="text-2xl md:text-3xl font-semibold text-white">
                    {servicio.title}
                  </h2>
                  <ul className="mt-4 divide-y divide-gray-700">
                    {servicio.options.map((option: Option, idx: number) => (
                      <li
                        key={idx}
                        className="py-3 flex items-center justify-between"
                      >
                        <span className="text-gray-300">
                          {servicio.category}
                          <br />
                          {servicio.details.split(".")[0]}
                        </span>
                        <span className="text-blue-300 bg-blue-900/50 px-2.5 py-1 rounded-md font-semibold">
                          {option.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-blue-400 mt-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver detalles y reservar →
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Detalles del Servicio */}
      {detalle && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          aria-labelledby="detalle-title"
          role="dialog"
          aria-modal="true"
          onClick={() => setDetalle(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full sm:max-w-lg mx-auto bg-gray-800 rounded-2xl shadow-xl ring-1 ring-white/10 p-6 m-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDetalle(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden ring-1 ring-gray-700 shrink-0">
                <Image
                  src={detalle.image}
                  alt={detalle.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4
                  id="detalle-title"
                  className="text-xl font-semibold text-white"
                >
                  {detalle.title}
                </h4>
                <p className="mt-2 text-gray-300">{detalle.details}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {detalle.options.map((op: Option, i: number) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-gray-700 px-3 py-2"
                >
                  <span className="text-gray-300">Precio</span>
                  <span className="text-blue-300 font-semibold">
                    {op.price}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDetalle(null)}
                className="px-5 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => openCalendarModal(detalle.id)}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Calendario */}
      <AnimatePresence>
        {isCalendarModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => closeCalendarModal(true)} // <- Pasar true si se cierra desde fuera (asume pre-login)
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-7xl mx-auto" // <- Quitamos estilos de fondo/padding
              onClick={(e) => e.stopPropagation()}
            >
              <AppointmentCalendar
                preselectedServiceId={serviceIdToBook}
                onClose={closeCalendarModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}