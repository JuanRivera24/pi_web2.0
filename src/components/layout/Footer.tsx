'use client';
import Image from 'next/image';
import React from 'react';
import ApiStatusDiagnostic from '@/components/diagnosis/ApiStatusDiagnostic';
import { MapPin, Phone, Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';

// 1. ACTUALIZAR INTERFAZ
interface Sede {
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  googleMapsUrl: string; // <-- Añadido
}

export default function Footer() {
  const pathname = usePathname();

  // 2. ACTUALIZAR ARRAY DE DATOS
  const sedes: Sede[] = [
    // ... (Tu array de sedes sigue igual, lo omito por brevedad) ...
    {
      nombre: 'Sede C.C Puerta del Norte',
      direccion: 'Autopista Nte. #34-67, Bello, Antioquia',
      telefono: '+57 300 123 4567',
      horario: 'Lun-Sab: 9:00 AM - 10:15 PM',
      googleMapsUrl:
        'https://www.google.com/maps/search/?api=1&query=C.C+Puerta+del+Norte+Bello', 
    },
    {
      nombre: 'Sede C.C Parque Fabricato',
      direccion: 'Cra. 50 #38a-185, Bello, Antioquia',
      telefono: '+57 300 123 4568',
      horario: 'Lun-Sab: 9:00 AM - 10:15 PM',
      googleMapsUrl:
        'https://www.google.com/maps/search/?api=1&query=C.C+Parque+Fabricato+Bello', 
    },
    {
      nombre: 'Sede C.C La Central',
      direccion: 'Cl. 49B #21-38, Medellín, Antioquia',
      telefono: '+57 300 123 4569',
      horario: 'Lun-Sab: 9:00 AM - 10:15 PM',
      googleMapsUrl:
        'https://www.google.com/maps/search/?api=1&query=C.C+La+Central+Medellín', 
    },
    {
      nombre: 'Sede C.C Los Molinos',
      direccion: 'Cl. 30A #82A-26, Medellín, Antioquia',
      telefono: '+57 300 123 4570',
      horario: 'Lun-Sab: 9:00 AM - 10:15 PM',
      googleMapsUrl:
        'https://www.google.com/maps/search/?api=1&query=C.C+Los+Molinos+Medellín', 
    },
    {
      nombre: 'Sede C.C Santafé',
      direccion: 'Carrera 43A, Cl. 7 Sur #170, Medellín',
      telefono: '+57 300 123 4571',
      horario: 'Lun-Sab: 9:00 AM - 10:15 PM',
      googleMapsUrl:
        'https://www.google.com/maps/search/?api=1&query=C.C+Santafé+Medellín', 
    },
    {
      nombre: 'Sede C.C Premium Plaza',
      direccion: 'Cra. 43A #30-25, Medellín, Antioquia',
      telefono: '+57 300 123 4572',
      horario: 'Lun-Sab: 9:00 AM - 10:15 PM',
      googleMapsUrl:
        'https://www.google.com/maps/search/?api=1&query=C.C+Premium+Plaza+Medellín', 
    },
  ];

  return (
    <footer className="bg-blue-950 text-blue-200">
      {/* Sección del Mapa */}
      <section id="mapa" className="content mapa scroll-mt-24">
        <iframe
          title="Sedes Kingdom Barber"
          src="https://www.google.com/maps/d/embed?mid=1AQAwtmEsO5XweBQcXXGe7A5l-frhDpA&ehbc=2E312F" // Nota: Esta URL parece incorrecta, deberías revisarla.
          width="100%"
          height="350"
          loading="lazy"
          className="w-full border-0"
        />
      </section>

      {/* --- SECCIÓN DE SEDES --- */}
      <section className="py-12 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-10 text-white">
            Nuestras Sedes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 3. MODIFICAR JSX */}
            {sedes.map((sede, index) => (
              <a
                key={index}
                href={sede.googleMapsUrl} // <-- Enlace de Google Maps
                target="_blank" // <-- Abre en una nueva pestaña
                rel="noopener noreferrer" // <-- Por seguridad
                className="block bg-gray-800 p-4 rounded-lg ring-1 ring-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-blue-500 cursor-pointer" // <-- Se cambió 'div' por 'a' y se añadió 'block' y 'cursor-pointer'
              >
                <h4 className="font-bold text-base mb-2 text-white truncate">
                  {sede.nombre}
                </h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{sede.direccion}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{sede.telefono}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{sede.horario}</span>
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- INFORMACIÓN DE CONTACTO --- */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <a href={pathname}>
                {/* ----- INICIO DE LA CORRECCIÓN ----- */}
                <Image
                  src="/Images/Logo.png"
                  alt="Logo Kingdom Barber"
                  width={180} // Dejas tus props originales
                  height={48} // Dejas tus props originales
                  className="h-10 w-auto mb-2 mx-auto md:mx-0" // Tu clase 'h-10' que lo hace chiquito
                  style={{ width: 'auto' }} // <-- AÑADE ESTA LÍNEA
                />
                {/* ----- FIN DE LA CORRECCIÓN ----- */}
              </a>
              <p className="text-blue-300">Tu estilo, nuestra pasión</p>
            </div>
            <div className="text-center">
              <p className="text-blue-300">📧 info@kingdombarber.com</p>
              <p className="text-blue-300">🌐 www.kingdombarber.com</p>
              <ApiStatusDiagnostic />
            </div>
            <div className="text-center md:text-right">
              <p className="text-blue-300">Síguenos en redes sociales</p>
              <div className="flex justify-center md:justify-end gap-5 mt-2">
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="hover:opacity-75 transition-opacity"
                >
                  <Image
                    src="/Images/logowpp.png"
                    alt="WhatsApp"
                    width={28}
                    height={28}
                  />
                </a>
                <a
                  href="https://instagram.com/kingdombarber"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:opacity-75 transition-opacity"
                >
                  <Image
                    src="/Images/logoigg.png"
                    alt="Instagram"
                    width={28}
                    height={28}
                  />
                </a>
                <a
                  href="https://github.com/kingdombarber"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="hover:opacity-75 transition-opacity"
                >
                  <Image
                    src="/Images/logogit.png"
                    alt="GitHub"
                    width={28}
                    height={28}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <div className="text-center py-5 bg-black/20 border-t border-blue-800/50">
        <p className="text-sm text-blue-300">
          Kingdom Barber ® {new Date().getFullYear()} | Todos los derechos
          reservados
        </p>
      </div>
    </footer>
  );
}