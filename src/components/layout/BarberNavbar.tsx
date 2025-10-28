"use client";

import Link from "next/link";
import Image from "next/image";
// --- AÑADIR React ---
import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Link as ScrollLink } from "react-scroll";
import { usePathname } from 'next/navigation';

// --- COMPONENTE INTERNO PARA LOS ENLACES (CON TIPO DE RETORNO EXPLÍCITO) ---
const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }): React.ReactElement => {
  const pathname = usePathname();
  const homePath = "/dashboard/barber";
  const isHomePage = pathname === homePath;
  const commonLinkClass = "hover:text-white transition-colors cursor-pointer block py-2";
  const handleClick = () => { if (onLinkClick) { onLinkClick(); } };

  return (
    <React.Fragment>
      {/* 1. Agenda */}
      {isHomePage ? (
        <li><ScrollLink to="citas" smooth duration={600} offset={-80} className={commonLinkClass} onClick={handleClick}>Agenda</ScrollLink></li>
      ) : (
        <li><Link href={`${homePath}#citas`} className={commonLinkClass} onClick={handleClick}>Agenda</Link></li>
      )}
      {/* 2. Galería */}
      <li><Link href="/dashboard/barber/gallery" className={commonLinkClass} onClick={handleClick}>Galería</Link></li>
      {/* 3. Contacto */}
      {isHomePage ? (
        <li><ScrollLink to="contacto" smooth duration={600} offset={-50} className={commonLinkClass} onClick={handleClick}>Contacto</ScrollLink></li>
      ) : (
        <li><Link href={`${homePath}#contacto`} className={commonLinkClass} onClick={handleClick}>Contacto</Link></li>
      )}
      {/* 4. Dashboard */}
      <li> <Link href="https://kingdombarberdashboard.streamlit.app" target="_blank" rel="noopener noreferrer" className={commonLinkClass} onClick={handleClick}> Dashboard </Link> </li>
    </React.Fragment>
  );
};


// --- NAVBAR PRINCIPAL (CON CORRECCIÓN HIDRATACIÓN REVISADA) ---
export default function BarberNavbar() {
  const { user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determinar si podemos mostrar contenido dependiente del cliente/auth
  // Solo es true si estamos en cliente Y Clerk ha cargado
  const canRenderClientContent = isClient && isLoaded;

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-900 shadow-md px-6 py-3 flex justify-between items-center z-50">
      <Link href="/dashboard/barber">
        <div className="relative h-12 w-12">
          <Image
            src="/Images/Logo.png"
            alt="Logo de la página"
            fill 
            className="object-contain" 
            priority
          />
        </div>
      </Link>

      {/* --- MENÚ DE ESCRITORIO --- */}
      <div className="hidden md:flex items-center space-x-6">
        <ul className="flex space-x-6 text-white/90 font-medium items-center">
          <NavLinks />
        </ul>

        {/* --- Renderizado Condicional UserButton (Escritorio) --- */}
        <div className="flex items-center space-x-4 h-8"> {/* Contenedor con altura */}
          {canRenderClientContent ? (
            <>
              {user && (<span className="text-white/80 hidden sm:block"> Hola, {user.firstName} </span>)}
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <div className="h-8 w-28 bg-gray-700 rounded animate-pulse"></div> // Placeholder
          )}
        </div>
        {/* --- Fin Renderizado Condicional --- */}
      </div>

      {/* --- BOTÓN HAMBURGUESA Y USERBUTTON MÓVIL --- */}
      <div className="md:hidden flex items-center">
        {/* --- Renderizado Condicional UserButton (Móvil) --- */}
        <div className="h-8 w-8"> {/* Contenedor fijo */}
          {canRenderClientContent ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="h-full w-full rounded-full bg-gray-700 animate-pulse"></div> // Placeholder
          )}
        </div>
        {/* --- Fin Renderizado Condicional --- */}

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-4 text-white focus:outline-none" aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}>
          {isMenuOpen ? ( /* Icono X */ <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>)
            : ( /* Icono Hamburguesa */ <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>)}
        </button>
      </div>

      {/* --- MENÚ DESPLEGABLE MÓVIL --- */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-blue-900 shadow-lg px-6 pb-6">
          <ul className="flex flex-col space-y-4 text-white/90 font-medium items-center text-center pt-4">
            <NavLinks onLinkClick={() => setIsMenuOpen(false)} />
          </ul>
        </div>
      )}
    </nav>
  );
};