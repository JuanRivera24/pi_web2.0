import Link from "next/link";
import { FC } from "react";

const Navbar: FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-4 flex justify-between items-center z-50">
      {/* Logo */}
      <Link href="/">
  <img
    src="https://files.fm/u/7trbjpt6v3"  // link aquí
    alt="Logo de la página"
    className="h-10 w-auto" 
  />
</Link>


      {/* Opciones de navegación */}
      <ul className="flex space-x-6 text-gray-700 font-medium">
        <li>
          <Link href="/nosotros" className="hover:text-blue-600 transition">
            Nosotros
          </Link>
        </li>
        <li>
          <Link href="/servicios" className="hover:text-blue-600 transition">
            Servicios
          </Link>
        </li>
        <li>
          <Link href="/citas" className="hover:text-blue-600 transition">
            Citas
          </Link>
        </li>
        <li>
          <Link href="/sedes" className="hover:text-blue-600 transition">
            Sedes
          </Link>
        </li>
        <li>
          <Link href="/contacto" className="hover:text-blue-600 transition">
            Contacto
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
