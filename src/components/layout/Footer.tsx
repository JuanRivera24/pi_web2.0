import Image from 'next/image';
import React from 'react';

// Interface para las sedes
interface Sede {
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
}

export default function Footer() {
  // Datos de las sedes
  const sedes: Sede[] = [
    {
      nombre: "Centro Comercial Florida",
      direccion: "Cra. 65 #75-01, Medellín",
      telefono: "+57 300 123 4567",
      horario: "Lun-Sab: 9:00 AM - 8:00 PM"
    },
    {
      nombre: "Centro Comercial Santa Fe",
      direccion: "Cra. 43A #7 Sur-170, Medellín",
      telefono: "+57 300 123 4568",
      horario: "Lun-Sab: 9:00 AM - 8:00 PM"
    },
    {
      nombre: "Centro Comercial Puerta del Norte",
      direccion: "Diagonal 55 #34-67, Bello",
      telefono: "+57 300 123 4569",
      horario: "Lun-Sab: 9:00 AM - 8:00 PM"
    },
    {
      nombre: "Centro Comercial Mayorca",
      direccion: "Cl. 51 Sur #48-57, Sabaneta",
      telefono: "+57 300 123 4570",
      horario: "Lun-Sab: 9:00 AM - 8:00 PM"
    },
    {
      nombre: "Centro Comercial Oviedo",
      direccion: "Cra. 43A #6 Sur-150, Medellín",
      telefono: "+57 300 123 4571",
      horario: "Lun-Sab: 9:00 AM - 8:00 PM"
    },
    {
      nombre: "Centro Comercial San Nicolas",
      direccion: "Cl. 43 #54-139, Rionegro",
      telefono: "+57 300 123 4571",
      horario: "Lun-Sab: 9:00 AM - 8:00 PM"
    }
  ];
return (
    <footer className="bg-blue-950 text-white">
      {/* Sección del Mapa */}
      <section id="mapa" className="content mapa scroll-mt-24">
        <iframe
          title="Sedes Kingdom Barber"
          src="https://www.google.com/maps/d/embed?mid=1fE4auR4b1fRD0ut4VGMrG8i1-C4DpJ8&ehbc=2E312F"
          width="100%"
          height="300"
          loading="lazy"
          className="w-full border-0"
        />
      </section>

      {/* Sección de Sedes */}
      <section className="py-8 px-4 bg-blue-900">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-yellow-400">
            Nuestras Sedes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {sedes.map((sede, index) => (
              <div 
                key={index} 
                className="bg-blue-800 p-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                <h4 className="font-bold text-lg mb-2 text-yellow-300">
                  {sede.nombre}
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start">
                    <span className="mr-2">📍</span>
                    {sede.direccion}
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">📞</span>
                    {sede.telefono}
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">🕒</span>
                    {sede.horario}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Información de Contacto General */}
      <section className="py-6 bg-blue-950 border-t border-blue-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-lg mb-2">Kingdom Barber</h4>
              <p className="text-blue-200">Tu estilo, nuestra pasión</p>
            </div>
            <div className="text-center">
              <p className="text-blue-200">📧 info@kingdombarber.com</p>
              <p className="text-blue-200">🌐 www.kingdombarber.com</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-blue-200">Síguenos en redes sociales</p>
              <div className="flex justify-center md:justify-end gap-4 mt-2">
                {/* Iconos de redes sociales */}
                {/* WhatsApp */}
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <div className="text-center py-4 bg-blue-950 border-t border-blue-800">
        <p className="text-blue-300">
          Kingdom Barber ® {new Date().getFullYear()} | Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
  
}