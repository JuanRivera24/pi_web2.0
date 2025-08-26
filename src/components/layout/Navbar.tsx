"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-gray-500 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Image 
              src="/images/Logo.png"   // 👈 Ruta desde /public
              alt="Logo Kingdom Barber"
              width={50}                // 👈 Ajusta el tamaño
              height={50}
              priority
            />
          </Link>
        </div>

        {/* Links */}
        <div className="space-x-6 text-gray-700 font-medium">
          <Link href="/nosotros">Nosotros</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/citas">Citas</Link>
          <Link href="/sedes">Sedes</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
      </div>
    </nav>
  );
}
