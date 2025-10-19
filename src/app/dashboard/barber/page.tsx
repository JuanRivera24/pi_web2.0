"use client"; // Es necesario para el onClick del botón

import Image from "next/image";
import Link from "next/link";
// Se ELIMINA la importación de "react-scroll" que causaba el error
import ContactSection from "@/components/contactform/ContactForm";
import BarberAgenda from "@/components/dashboard/BarberAgenda"; 

export default function BarberHomePage() {

  // Función simple para manejar el scroll suave
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // El offset de -80px es para compensar la altura de la navbar
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  return (
    <> {/* Usamos un Fragment porque el <main> ya está en el layout */}
      
      {/* HERO Section */}
      <section id="hero" className="relative isolate w-full min-h-screen flex items-center pt-24">
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
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur ring-1 ring-white/20">
            💈 Panel de Barbero
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight drop-shadow">
            Bienvenido a tu Espacio
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/85">
            Gestiona tu agenda y mantente en contacto con nosotros.
          </p>

          {/* --- BOTONES CON LA SOLUCIÓN CORRECTA --- */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleScroll('citas')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Ver Agenda
            </button>
            <Link
              href="/dashboard/barber/gallery"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/30 backdrop-blur cursor-pointer"
            >
              Ver Galería
            </Link>
          </div>
          
        </div>
      </section>

      {/* Sección de "Tu Agenda" */}
      <section id="citas" className="scroll-mt-24 py-16">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Tu Agenda</h2>
          <div className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6 min-h-[300px]">
            <BarberAgenda />
          </div>
        </div>
      </section>

      {/* Sección para el Dashboard General */}
      <section id="dashboard-general" className="scroll-mt-24 py-16 bg-gray-50">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Análisis de Datos</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Explora las métricas y visualizaciones de tu rendimiento en nuestro dashboard general.
          </p>
          <Link
            href="https://kingdombarberdashboard.streamlit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-transform duration-300 hover:scale-105"
          >
            Dashboard General
          </Link>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="scroll-mt-24 py-16">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Contáctanos</h2>
          <div className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 sm:p-6">
            <ContactSection />
          </div>
        </div>
      </section>
    </>
  );
}