"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Se importa el componente Image
import { UserButton, useUser } from "@clerk/nextjs";
import { Link as ScrollLink } from "react-scroll";

export default function BarberNavbar() {
  const { user } = useUser();

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-900 shadow-md px-6 py-4 flex justify-between items-center z-50">
      <Link href="/dashboard/barber">
        {/* 2. Se reemplaza <img> por <Image> con width y height */}
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
          
          <li>
            <Link href="/dashboard/barber/gallery" className="hover:text-white transition-colors cursor-pointer">
              Galería
            </Link>
          </li>

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