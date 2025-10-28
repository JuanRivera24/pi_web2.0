"use client";

import Link from "next/link";
import Image from "next/image";
import { FC, useState, useEffect, Fragment } from "react";
// --- Hooks añadidos ---
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
// --- Fin Hooks añadidos ---
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Menu, Transition } from "@headlessui/react";
import { Link as ScrollLink } from "react-scroll";

import LoginForm from "@/components/auth/LoginForm";
import BarberLoginForm from "@/components/auth/BarberLoginForm";

// --- COMPONENTE INTERNO PARA EVITAR REPETIR CÓDIGO ---
const NavLinks: FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const commonLinkClass = "hover:text-white transition-colors cursor-pointer block py-2";

  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
      <li>
        <Link href="/" className={commonLinkClass} onClick={handleClick}>
          Nosotros
        </Link>
      </li>
      <li>
        <Link href="/services" className={commonLinkClass} onClick={handleClick}>
          Servicios
        </Link>
      </li>
      
      <li>
        <Link href="/gallery" className={commonLinkClass} onClick={handleClick}>
          Galería
        </Link>
      </li>
      
      {isHomePage ? (
        <>
          <li><ScrollLink to="citas" smooth duration={600} offset={-80} className={commonLinkClass} onClick={handleClick}>Citas</ScrollLink></li>
          <li><ScrollLink to="contacto" smooth duration={600} offset={-50} className={commonLinkClass} onClick={handleClick}>Contacto</ScrollLink></li>
          <li><ScrollLink to="mapa" smooth duration={600} offset={-80} className={commonLinkClass} onClick={handleClick}>Sedes</ScrollLink></li>
        </>
      ) : (
        <>
          <li><Link href="/#citas" className={commonLinkClass} onClick={handleClick}>Citas</Link></li>
          <li><Link href="/#contacto" className={commonLinkClass} onClick={handleClick}>Contacto</Link></li>
          <li><Link href="/#mapa" className={commonLinkClass} onClick={handleClick}>Sedes</Link></li>
        </>
      )}
    </>
  );
};


// --- NAVBAR PRINCIPAL ---
const Navbar: FC = () => {
  const [modalView, setModalView] = useState<"client-login" | "client-register" | "barber-login" | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  // --- INICIO: LÓGICA PARA LEER LA URL ---
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Este useEffect leerá la URL al cargar la página
  useEffect(() => {
    // 1. Lee el parámetro 'modal' de la URL
    const modalQuery = searchParams.get('modal');

    // 2. Si existe y el usuario NO está logueado, abre el modal
    if (!isSignedIn && modalQuery === 'barber-login') {
      setModalView('barber-login');
      // 3. Limpia la URL para que no se quede el ?modal=...
      router.replace(pathname, { scroll: false });
    } else if (!isSignedIn && modalQuery === 'client-login') {
      setModalView('client-login');
      // 3. Limpia la URL
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, isSignedIn]); // Dependencias del Effect
  // --- FIN: LÓGICA PARA LEER LA URL ---


  // Este useEffect ya lo tenías (cierra el modal si inicia sesión)
  useEffect(() => {
    if (isSignedIn) {
      setModalView(null);
    }
  }, [isSignedIn]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-900 shadow-md px-6 py-3 flex justify-between items-center z-50">
      <Link href="/">
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

      {/* --- MENÚ DE ESCRITORIO (se oculta en móvil) --- */}
      <div className="hidden md:flex items-center space-x-6">
        <ul className="flex space-x-6 text-white/90 font-medium items-center">
          <NavLinks />
        </ul>
        <div className="flex items-center">
          <SignedOut>
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="bg-blue-300 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-200 font-semibold">Ingresar</Menu.Button>
              </div>
              <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item><button onClick={() => setModalView("client-login")} className="hover:bg-gray-100 text-gray-700 block w-full text-left px-4 py-2 text-sm">Soy Cliente</button></Menu.Item>
                    <Menu.Item><button onClick={() => setModalView("barber-login")} className="hover:bg-gray-100 text-gray-700 block w-full text-left px-4 py-2 text-sm">Soy Barbero</button></Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      
      {/* --- BOTÓN DE HAMBURGUESA (solo visible en móvil) --- */}
      <div className="md:hidden flex items-center">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
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
        <div className="md:hidden absolute top-full left-0 w-full bg-blue-900 shadow-lg p-6">
          <ul className="flex flex-col space-y-4 text-white/90 font-medium items-center text-center">
            <NavLinks onLinkClick={() => setIsMenuOpen(false)} />
            <SignedOut>
              <li className="w-full pt-4 border-t border-white/20">
                <Menu as="div" className="relative w-full">
                  <div><Menu.Button className="bg-blue-300 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-200 font-semibold w-full">Ingresar</Menu.Button></div>
                  <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item><button onClick={() => { setModalView("client-login"); setIsMenuOpen(false); }} className="hover:bg-gray-100 text-gray-700 block w-full text-left px-4 py-2 text-sm">Soy Cliente</button></Menu.Item>
                        <Menu.Item><button onClick={() => { setModalView("barber-login"); setIsMenuOpen(false); }} className="hover:bg-gray-100 text-gray-700 block w-full text-left px-4 py-2 text-sm">Soy Barbero</button></Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </li>
            </SignedOut>
          </ul>
        </div>
      )}

      {/* --- MODALES --- */}
      <SignedOut>
        {modalView && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
            <div className="relative bg-white rounded-lg shadow-lg">
              <button onClick={() => setModalView(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl">✕</button>
              {modalView === "client-login" && (
                <div className="p-8">
                  <LoginForm />
                  <p className="text-center text-sm mt-4">¿No tienes cuenta? <button onClick={() => setModalView("client-register")} className="font-semibold text-blue-600 hover:underline">Regístrate</button></p>
                </div>
              )}
              {modalView === "client-register" && (
                <div className="p-8">
                  <LoginForm />
                  <p className="text-center text-sm mt-4">¿Ya tienes cuenta? <button onClick={() => setModalView("client-login")} className="font-semibold text-blue-600 hover:underline">Inicia Sesión</button></p>
                </div>
              )}
              {modalView === "barber-login" && <BarberLoginForm />}
            </div>
          </div>
        )}
      </SignedOut>
    </nav>
  );
};

export default Navbar;