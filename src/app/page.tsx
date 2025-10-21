"use client"; 

// --- AJUSTE 1: Importar Suspense ---
import { Suspense } from 'react';
import Image from "next/image";
import { Link as ScrollLink } from "react-scroll";
import ContactSection from "@/components/contactform/ContactForm";
import AppointmentsCalendar from "@/components/appointment/AppointmentCalendar";
import ServicesAccordion from "@/components/services/services";

// --- AJUSTE 2: Definir un componente de fallback (esqueleto) ---
const LoadingCalendar = () => (
 <div className="w-full max-w-7xl mx-auto p-6 scroll-mt-24 bg-gray-900 rounded-2xl">
    <div className="text-center mb-8"><h2 className="text-4xl font-bold text-white">Agenda tu cita 💈</h2><p className="text-gray-300 mt-2">Horario: <b>10:00 am - 10:00 pm</b></p></div>
    <div className="bg-white rounded-2xl p-4 md:p-6 animate-pulse">
      <div className="flex justify-between items-center mb-4 h-10"><div className="flex gap-2"><div className="w-24 h-8 bg-gray-200 rounded-lg"></div><div className="w-16 h-8 bg-gray-200 rounded-lg"></div><div className="w-24 h-8 bg-gray-200 rounded-lg"></div></div><div className="w-48 h-8 bg-gray-200 rounded-lg"></div><div className="flex gap-2"><div className="w-16 h-8 bg-gray-200 rounded-lg"></div><div className="w-20 h-8 bg-gray-200 rounded-lg"></div><div className="w-16 h-8 bg-gray-200 rounded-lg"></div></div></div>
      <div className="border-t border-gray-200 h-[600px]"></div>
    </div>
  </div>
);


export default function HomePage() {
 return (
   <main className="bg-gray-900">
     {/* HERO */}
     <section id="hero" className="relative isolate w-full min-h-screen flex items-center">
       <Image
         src="/Images/fondo-barberia.jpg"
         alt="Barbería"
         fill
         priority
         sizes="100vw"
         className="object-cover object-center"
       />
       <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />
       <div className="relative z-10 mx-auto max-w-screen-xl px-6 text-center text-white">
         <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight drop-shadow">
           Eleva tu estilo, gobierna tu imagen
         </h1>
         <p className="mt-4 text-base sm:text-lg text-white/85 max-w-2xl mx-auto">
           Un espacio donde tradición, excelencia y modernidad se unen para que vivas una experiencia única.
         </p>
         <div className="mt-8 flex flex-wrap justify-center gap-4">
           <ScrollLink
             to="citas"
             smooth
             duration={600}
             offset={-80}
             className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 cursor-pointer"
           >
             Agendar cita
           </ScrollLink>
           <ScrollLink
             to="servicios"
             smooth
             duration={600}
             offset={-80}
             className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/30 backdrop-blur cursor-pointer"
           >
             Ver servicios
           </ScrollLink>
         </div>
       </div>
       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm animate-bounce">
         Desliza para ver más
       </div>
     </section>

     {/* Servicios */}
     <section id="servicios" className="scroll-mt-24">
       <ServicesAccordion />
     </section>

     {/* Citas */}
     <section id="citas" className="scroll-mt-24 py-16">
       {/* --- AJUSTE 3: Envolver AppointmentsCalendar con Suspense --- */}
       <Suspense fallback={<LoadingCalendar />}>
         <AppointmentsCalendar />
       </Suspense>
     </section>

     {/* Contacto */}
     <section id="contacto" className="scroll-mt-24">
       <ContactSection />
     </section>
   </main>
 );
}