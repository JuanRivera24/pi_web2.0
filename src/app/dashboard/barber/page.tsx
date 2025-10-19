import Image from "next/image";
import Link from "next/link"; // 1. Importa el componente Link de Next.js
import ContactSection from "@/components/contactform/ContactForm";
import BarberAgenda from "@/components/dashboard/BarberAgenda"; 

export default function BarberHomePage() {
  return (
    <> {/* Usamos un Fragment porque el <main> ya está en el layout */}
      
      {/* HERO Section (sin cambios) */}
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
        </div>
      </section>

      {/* Sección de "Tu Agenda" (sin cambios) */}
      <section id="agenda" className="scroll-mt-24 py-16">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Tu Agenda</h2>
          <div className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6 min-h-[300px]">
            <BarberAgenda />
          </div>
        </div>
      </section>

      {/* --- NUEVA SECCIÓN PARA EL DASHBOARD --- */}
      <section id="dashboard-general" className="scroll-mt-24 py-16 bg-gray-50">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Análisis de Datos</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Explora las métricas y visualizaciones de tu rendimiento en nuestro dashboard general.
          </p>
          {/* 2. Usamos Link para la navegación externa, con target="_blank" para abrir en una nueva pestaña */}
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
      {/* --- FIN DE LA NUEVA SECCIÓN --- */}


      {/* Contacto (sin cambios) */}
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
