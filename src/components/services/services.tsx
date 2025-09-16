"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const services = [
  {
    id: 1,
    title: "Corte Clásico",
    description: "Un corte limpio y elegante para todo tipo de ocasión.",
    image: "/images/corte-clasico.jpg",
  },
  {
    id: 2,
    title: "Fade Moderno",
    description: "El degradado perfecto que marca tendencia.",
    image: "/images/fade.jpg",
  },
  {
    id: 3,
    title: "Barba Perfilada",
    description: "Diseño y perfilado para resaltar tu estilo.",
    image: "/images/barba.jpg",
  },
  {
    id: 4,
    title: "Afeitado Premium",
    description: "Afeitado con toalla caliente y productos de calidad.",
    image: "/images/afeitado.jpg",
  },
  {
    id: 5,
    title: "Color y Tintura",
    description: "Personaliza tu look con color y estilo.",
    image: "/images/color.jpg",
  },
];

export default function ServicesAccordion() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="servicios" className="w-full py-12 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Nuestros Servicios
      </h2>

      {/* Contenedor de imágenes */}
      <div className="flex w-full h-[400px] gap-4 px-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            className="relative flex-1 rounded-xl overflow-hidden cursor-pointer shadow-lg"
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            animate={{
              flex: active === index ? 3 : 1,
              filter: active === null || active === index ? "blur(0px)" : "blur(3px)",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {/* Imagen */}
            <motion.img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
              animate={{
                scale: active === index ? 1.1 : 1,
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Overlay con descripción */}
            {active === index && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md flex flex-col items-center justify-center text-center text-white p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: .5 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-sm max-w-xs">{service.description}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Botón de todos los servicios */}
      <div className="flex justify-center mt-10">
        <Link href="\services">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Todos los servicios
          </button>
        </Link>
      </div>
    </section>
  );
}
