"use client";
import ContactSection from "@/components/contactform/ContactForm";
import AppointmentsCalendar from "@/components/appointment/AppointmentCalendar";
import ServicesAccordion from "@/components/services/services";
export default function HomePage() {
return (
<main className="bg-blue-200">
{/* Hero: ocupa el alto de la pantalla */}
<section
id="hero"
className="relative w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-6 pt-24"
>
<div className="max-w-3xl text-center">
<h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-wide">
Kingdom Barber ✂️💈
</h1>
<p className="text-base sm:text-lg leading-relaxed">
En <span className="font-semibold">Kingdom Barber</span> creemos que un buen corte no solo transforma tu estilo, también eleva tu confianza. Somos más que una barbería: un espacio donde tradición, excelencia y modernidad se unen para que vivas una experiencia única.
</p>
<p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-300">
Ven a disfrutar de un servicio premium, pensado para quienes saben que el cuidado personal es parte de su reino. 💈👑
</p>
      {/* Call to actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <a href="#citas" className="px-5 py-3 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 transition">
          Agendar cita
        </a>
      </div>
    </div>
  </section>

  {/* Servicios */}
  <section id="servicios" className="w-full scroll-mt-24 py-12 bg-white">
    <div className="container mx-auto px-6">
      <ServicesAccordion />
    </div>
  </section>

  {/* Citas */}
  <section id="citas" className="w-full scroll-mt-24 py-12 bg-gray-100">
    <div className="container mx-auto px-6">
      <AppointmentsCalendar />
    </div>
  </section>

  {/* Contacto */}
  <section id="contacto" className="w-full scroll-mt-24 py-12 bg-white">
    <div className="container mx-auto px-6">
      <ContactSection />
    </div>
  </section>
</main>
);
}