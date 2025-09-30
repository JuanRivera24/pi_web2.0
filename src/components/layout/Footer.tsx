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
          height="250"
          loading="lazy"
          className="w-full border-0"
        />
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