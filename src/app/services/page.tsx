"use client";

import Link from "next/link";

const servicios = [
  {
    id: 1,
    title: "Corte Clásico",
    image: "/images/corte-clasico.jpg",
    options: [
      { name: "Corte clásico básico", price: "$20.000" },
      { name: "Corte clásico premium", price: "$35.000" },
      { name: "Corte clásico + bebida", price: "$40.000" },
    ],
  },
  {
    id: 2,
    title: "Fade Moderno",
    image: "/images/fade.jpg",
    options: [
      { name: "Fade básico", price: "$25.000" },
      { name: "Fade con diseño", price: "$40.000" },
      { name: "Fade + barba", price: "$50.000" },
    ],
  },
  {
    id: 3,
    title: "Barba Perfilada",
    image: "/images/barba.jpg",
    options: [
      { name: "Perfilado básico", price: "$15.000" },
      { name: "Perfilado + toalla caliente", price: "$25.000" },
      { name: "Barba + hidratación", price: "$35.000" },
    ],
  },
  {
    id: 4,
    title: "Afeitado Premium",
    image: "/images/afeitado.jpg",
    options: [
      { name: "Afeitado tradicional", price: "$18.000" },
      { name: "Afeitado premium", price: "$30.000" },
      { name: "Afeitado + spa facial", price: "$50.000" },
    ],
  },
  {
    id: 5,
    title: "Color y Tintura",
    image: "/images/color.jpg",
    options: [
      { name: "Color parcial", price: "$45.000" },
      { name: "Color completo", price: "$70.000" },
      { name: "Mechas + corte", price: "$120.000" },
    ],
  },
];

export default function ServiciosPage() {
  return (
    <main className="bg-gray-100 min-h-screen py-16 px-6">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Nuestros Servicios 💈
      </h1>

      <div className="max-w-6xl mx-auto space-y-12">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            {/* Imagen */}
            <img
              src={servicio.image}
              alt={servicio.title}
              className="rounded-xl w-full h-72 object-cover shadow-md"
            />

            {/* Info */}
            <div>
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                {servicio.title}
              </h2>
              <ul className="space-y-3 mb-6">
                {servicio.options.map((option, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span className="text-lg">{option.name}</span>
                    <span className="font-semibold text-blue-600">
                      {option.price}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/citas">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Agendar cita
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
