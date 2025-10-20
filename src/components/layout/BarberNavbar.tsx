"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react"; // 1. Importamos useState
import { UserButton, useUser } from "@clerk/nextjs";
import { Link as ScrollLink } from "react-scroll";
import { usePathname } from 'next/navigation';

// --- COMPONENTE INTERNO PARA LOS ENLACES (para no repetir código) ---
const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const homePath = "/dashboard/barber";
  const isHomePage = pathname === homePath;

  const commonLinkClass = "hover:text-white transition-colors cursor-pointer block py-2";

  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
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
      <li>
        <Link 
          href="https://kingdombarberdashboard.streamlit.app" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={commonLinkClass}
          onClick={handleClick}
        >
          Dashboard
        </Link>
      </li>
    </>
  );
};


// --- NAVBAR PRINCIPAL ---
export default function BarberNavbar() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 2. Estado para el menú móvil

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-900 shadow-md px-6 py-4 flex justify-between items-center z-50">
      <Link href="/dashboard/barber">
        <Image 
          src="/Images/Logo.png" 
          alt="Logo de la página" 
          width={150} 
          height={40}
          className="h-10 w-auto" 
        />
      </Link>
      
      {/* --- MENÚ DE ESCRITORIO (se oculta en móvil) --- */}
      <div className="hidden md:flex items-center space-x-6">
        <ul className="flex space-x-6 text-white/90 font-medium items-center">
          <NavLinks />
        </ul>
        <div className="flex items-center space-x-4">
          <span className="text-white/80 hidden sm:block">
            Hola, {user?.firstName}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* --- BOTÓN DE HAMBURGUESA (solo visible en móvil) --- */}
      <div className="md:hidden flex items-center">
        <UserButton afterSignOutUrl="/" />
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-4 text-white focus:outline-none">
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
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