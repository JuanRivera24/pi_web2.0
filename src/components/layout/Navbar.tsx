"use client";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Link as ScrollLink } from "react-scroll";
const Navbar: FC = () => {
const [showLogin, setShowLogin] = useState(false);
const [showRegister, setShowRegister] = useState(false);
const { isSignedIn } = useUser();
useEffect(() => {
if (isSignedIn) {
setShowLogin(false);
setShowRegister(false);
}
}, [isSignedIn]);
return (
<nav className="fixed top-0 left-0 w-full bg-blue-900 shadow-md px-6 py-4 flex justify-between items-center z-50">
<Link href="/">
<img src="/Images/Logo.png" alt="Logo de la página" className="h-10 w-auto" />
</Link>
  <ul className="flex space-x-6 text-white/90 font-medium items-center">
    <li>
      <Link href="/" className="hover:text-white transition-colors">
        Nosotros
      </Link>
    </li>

    {/* Ir a la página de servicios */}
    <li>
      <Link href="/services" className="hover:text-white transition-colors">
        Servicios
      </Link>
    </li>

    <li>
      <ScrollLink
        to="citas"
        smooth
        duration={600}
        offset={-50}
        className="hover:text-white transition-colors cursor-pointer"
      >
        Citas
      </ScrollLink>
    </li>
    <li>
      <Link href="#mapa" className="hover:text-white transition-colors">
        Sedes
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

    <SignedOut>
      <li>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-blue-300 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
        >
          Iniciar sesión
        </button>
      </li>
      <li>
        <button
          onClick={() => setShowRegister(true)}
          className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
        >
          Registrarse
        </button>
      </li>
    </SignedOut>

    <SignedIn>
      <li>
        <UserButton afterSignOutUrl="/" />
      </li>
    </SignedIn>
  </ul>

  <SignedOut>
    {showLogin && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
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

    {showRegister && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
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
  </SignedOut>
</nav>
);
};
export default Navbar;