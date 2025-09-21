// En: src/components/layout/BarberNavbar.tsx

"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Link as ScrollLink } from "react-scroll";

export default function BarberNavbar() {
  const { user } = useUser();

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-900 shadow-md px-6 py-4 flex justify-between items-center z-50">
      <Link href="/dashboard/barber">
        {/* Usar el componente <Image> de Next.js es una mejor práctica para optimización */}
        <img src="/Images/Logo.png" alt="Logo de la página" className="h-10 w-auto" />
      </Link>
      
      <div className="flex items-center space-x-6">
        <ul className="flex space-x-6 text-white/90 font-medium items-center">
          
          {/* --- ENLACE AL DASHBOARD GENERAL (CORREGIDO) --- */}
          <li>
            {/* 
              Corrección: Se eliminaron `legacyBehavior` y `passHref`.
              El componente <Link> ahora pasa automáticamente las propiedades a la etiqueta <a> hija.
            */}
            <Link 
              href="http://localhost:8501/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </Link>
          </li>
          
          {/* --- NUEVO ENLACE A LA GALERÍA --- */}
          <li>
            <Link href="/dashboard/barber/gallery" className="hover:text-white transition-colors cursor-pointer">
              Galería
            </Link>
          </li>
          {/* --- FIN DEL ENLACE A LA GALERÍA --- */}

          <li>
            <ScrollLink
              to="contacto" // Asumiendo que 'contacto' es un ID en tu página principal
              smooth
              duration={600}
              offset={-50}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contacto
            </ScrollLink>
          </li>
        </ul>

        {/* Saludo y botón de sesión */}
        <div className="flex items-center space-x-4">
            <span className="text-white/80 hidden sm:block">
              Hola, {user?.firstName}
            </span>
            <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
};