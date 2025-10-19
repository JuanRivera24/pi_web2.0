"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { Link as ScrollLink } from "react-scroll";
import { usePathname } from 'next/navigation';

export default function BarberNavbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const homePath = "/dashboard/barber";
  const isHomePage = pathname === homePath;

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
      
      <div className="flex items-center space-x-6">
        <ul className="flex space-x-6 text-white/90 font-medium items-center">
          
          {/* --- ENLACES REORDENADOS --- */}

          {/* 1. Agenda */}
          {isHomePage ? (
            <li>
              <ScrollLink
                to="citas"
                smooth
                duration={600}
                offset={-80}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Agenda
              </ScrollLink>
            </li>
          ) : (
            <li>
              <Link 
                href={`${homePath}#citas`}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Agenda
              </Link>
            </li>
          )}
          
          {/* 2. Galería */}
          <li>
            <Link href="/dashboard/barber/gallery" className="hover:text-white transition-colors cursor-pointer">
              Galería
            </Link>
          </li>
          
          {/* 3. Contacto */}
          {isHomePage ? (
            <li>
              <ScrollLink
                to="contacto"
                smooth
                duration={600}
                offset={-50}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contacto
              </ScrollLink>
            </li>
          ) : (
            <li>
              <Link 
                href={`${homePath}#contacto`}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contacto
              </Link>
            </li>
          )}

          {/* 4. Dashboard */}
          <li>
            <Link 
              href="https://kingdombarberdashboard.streamlit.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </Link>
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