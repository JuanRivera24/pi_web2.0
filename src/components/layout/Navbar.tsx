"use client";

import Link from "next/link";
import { FC, useState } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Link as ScrollLink } from "react-scroll";

const Navbar: FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-400 shadow-md px-6 py-4 flex justify-between items-center z-50">
      {/* Logo */}
      <Link href="/">
        <img
          src="/Images/Logo.png"
          alt="Logo de la página"
          className="h-10 w-auto"
        />
      </Link>

      {/* Opciones de navegación */}
      <ul className="flex space-x-6 text-gray-800 font-medium items-center">
        <li>
          <Link href="/" className="hover:text-blue-600 transition">
            Nosotros
          </Link>
        </li>
        <li>
          <Link href="/servicios" className="hover:text-blue-600 transition">
            Servicios
          </Link>
        </li>
        <li>
          <ScrollLink
            to="citas"
            smooth={true}
            duration={600}
            offset={-50}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            Citas
          </ScrollLink>
        </li>
        <li>
          <Link href="/sedes" className="hover:text-blue-600 transition">
            Sedes
          </Link>
        </li>
        <li>
          <ScrollLink
            to="contacto"
            smooth={true}
            duration={600}
            offset={-50}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            Contacto
          </ScrollLink>

        </li>

        {/* 🔐 Autenticación SIEMPRE visible */}
        <li>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        </li>
        <li>
          <button
            onClick={() => setShowRegister(true)}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Registrarse
          </button>
        </li>

        {/* 🔐 Si hay sesión, mostrar UserButton */}
        <SignedIn>
          <li>
            <UserButton afterSignOutUrl="/" />
          </li>
        </SignedIn>
      </ul>

      {/* Modal Login */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white rounded-lg p-6 shadow-lg">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <LoginForm />
          </div>
        </div>
      )}

      {/* Modal Register */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white rounded-lg p-6 shadow-lg">
            <button
              onClick={() => setShowRegister(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <RegisterForm />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
