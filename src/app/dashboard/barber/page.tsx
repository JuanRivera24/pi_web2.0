"use client"; 

import Image from "next/image";
import Link from "next/link";
import ContactSection from "@/components/contactform/ContactForm";
import BarberAgenda from "@/components/dashboard/BarberAgenda"; 

export default function BarberHomePage() {

  // Tu función de scroll (sin cambios)
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  return (
    // El Fragment es correcto ya que el <main> está en el layout principal
    <> 
      {/* HERO Section (sin cambios) */}
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
            Bienvenido a tu Espacio
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/85">
            Gestiona tu agenda y mantente en contacto con nosotros.
          </p>
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

      {/* --- MEJORA: Secciones integradas en el fondo oscuro --- */}

      {/* Sección de "Tu Agenda" */}
      <section id="citas" className="scroll-mt-24 py-16">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* Se elimina la caja blanca y se ajusta el título */}
          <h2 className="text-3xl font-bold tracking-tight text-white mb-8 text-center">Tu Agenda</h2>
          <BarberAgenda />
        </div>
      </section>

      {/* Sección para el Dashboard General */}
      {/* MEJORA: Fondo sutilmente distinto para jerarquía */}
      <section id="dashboard-general" className="scroll-mt-24 py-16 bg-blue-950">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Se ajustan colores de texto */}
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Análisis de Datos</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
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
           {/* Se elimina la caja blanca */}
          <ContactSection />
        </div>
      </section>
    </>
  );
}