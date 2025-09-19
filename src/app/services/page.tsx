"use client";
import Link from "next/link";
import Image from "next/image";
import AppointmentsCalendar from "@/components/appointment/AppointmentCalendar";
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
<main id="services" className="bg-gray-50 min-h-screen">
{/* Hero con cuadro claro y texto centrado */}
<section className="px-6 pt-16 md:pt-20">
<div className="max-w-7xl mx-auto">
<div className="bg-blue-50 ring-1 ring-blue-100 rounded-2xl p-10 md:p-12 text-center shadow-sm">
<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-900">
Nuestros Servicios 💈
</h1>
<p className="mt-3 text-blue-900/70 max-w-2xl mx-auto">
Estilo, precisión y una experiencia premium pensada para ti.
</p>
</div>
</div>
</section>
  {/* Lista de servicios */}
  <section className="max-w-7xl mx-auto px-6 py-12 space-y-10">
    {servicios.map((servicio) => (
      <div
        key={servicio.id}
        className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-xl hover:ring-blue-200 transition-all duration-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 p-0 md:p-6 items-stretch">
          {/* Imagen */}
          <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden rounded-t-2xl md:rounded-2xl">
            <Image
              src={servicio.image}
              alt={servicio.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={servicio.id === 1}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>

          {/* Info */}
          <div className="p-6 md:pl-0 flex flex-col">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {servicio.title}
            </h2>

            <ul className="mt-4 divide-y divide-gray-100">
              {servicio.options.map((option, idx) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <span className="text-gray-700">{option.name}</span>
                  <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-semibold">
                    {option.price}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="#calendario"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                aria-label={`Ir al calendario para agendar ${servicio.title}`}
              >
                Agendar cita
              </Link>
              <Link
                href="#calendario"
                className="px-6 py-3 rounded-lg font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                Ver disponibilidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    ))}
  </section>

  {/* Calendario */}
  <section id="calendario" className="px-6 pb-16 scroll-mt-24">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Agenda tu cita</h3>
        <AppointmentsCalendar />
      </div>
    </div>
  </section>
</main>
);
}