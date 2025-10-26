"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
// --- AJUSTE 1: Importar useRouter ---
import { useRouter } from "next/navigation";


const services = [
 { id: 201, title: "Corte Premium", description: "Asesoría de estilo...", image: "/Images/premium.png" },
 { id: 204, title: "Ritual Completo", description: "La experiencia completa...", image: "/Images/completo.jpeg" },
 { id: 202, title: "Afeitado Clásico", description: "Relájate con el ritual...", image: "/Images/afeitado.jpg" },
 { id: 209, title: "Limpieza Facial", description: "Revitaliza tu piel...", image: "/Images/limpiezap.jpg" },
 { id: 215, title: "Paquete Ejecutivo", description: "El paquete definitivo...", image: "/Images/paquete.jpg" },
];

export default function ServicesAccordion() {
 const [active, setActive] = useState<number | null>(null);
 // --- AJUSTE 2: Obtener el router ---
 const router = useRouter();

 // --- AJUSTE 3: Función para manejar el clic ---
 const handleReserveClick = (serviceId: number) => {
   // 1. Construir la nueva URL con el parámetro
   const url = `/?servicio=${serviceId}`;
   // 2. Actualizar la URL sin recargar y sin scroll por defecto
   router.push(url, { scroll: false });
   // 3. Buscar el elemento del calendario
   const calendarElement = document.getElementById('citas');
   // 4. Hacer scroll suave hacia el calendario
   calendarElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 };


 return (
   <section id="servicios" className="w-full bg-gray-900 text-white py-20">
     <div className="max-w-7xl mx-auto px-4">
       <header className="text-center mb-12">
         <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Nuestros Servicios Destacados</h2>
         <p className="text-gray-300 mt-2 max-w-2xl mx-auto">Calidad premium, estilo y detalle en cada atención.</p>
       </header>

       {/* --- VISTA PARA ESCRITORIO --- */}
       <div className="hidden md:flex w-full h-[420px] gap-4">
         {services.map((service, index) => (
           <motion.div
             key={service.id}
             className="relative flex-1 rounded-2xl overflow-hidden cursor-pointer shadow-lg ring-1 ring-white/10 bg-gray-800"
             onMouseEnter={() => setActive(index)}
             onMouseLeave={() => setActive(null)}
             animate={{ flex: active === index ? 3 : 1 }}
             transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
           >
             {/* ... Imagen y overlay ... */}
              <Image src={service.image} alt={service.title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" priority={index === 0} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
             <div className="absolute bottom-0 left-0 right-0 p-5"><h3 className="text-xl font-bold text-white drop-shadow">{service.title}</h3></div>

             <AnimatePresence>
               {active === index && (
                 <motion.div
                   key="overlay"
                   className="absolute inset-0 flex items-end p-6"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.25 }}
                 >
                   <div className="w-full bg-black/40 backdrop-blur-md rounded-xl p-5 ring-1 ring-white/20">
                     <h3 className="text-2xl md:text-3xl font-extrabold mb-2 text-white">{service.title}</h3>
                     <p className="text-sm md:text-base text-white/80 max-w-lg">{service.description}</p>
                     <div className="mt-4 flex flex-wrap gap-3">
                       {/* --- AJUSTE 4: Cambiar Link por button con onClick (Escritorio) --- */}
                       <button
                         onClick={() => handleReserveClick(service.id)}
                         className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                       >
                         Reservar ahora
                       </button>
                       <Link href="/services" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2 rounded-lg transition">
                         Ver detalles
                       </Link>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.div>
         ))}
       </div>

       {/* --- VISTA PARA MÓVIL --- */}
       <div className="md:hidden space-y-6">
         {services.map((service, index) => (
           <div key={service.id} className="relative h-72 rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/10 bg-gray-800">
             {/* ... Imagen y overlay ... */}
              <Image src={service.image} alt={service.title} fill className="object-cover" sizes="100vw" priority={index === 0} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

             <div className="absolute inset-x-0 bottom-0 p-6">
               <h3 className="text-2xl font-bold text-white">{service.title}</h3>
               <p className="text-sm text-white/80 mt-1">{service.description}</p>
               <div className="mt-4 flex gap-3">
                 {/* --- AJUSTE 5: Cambiar Link por button con onClick (Móvil) --- */}
                 <button
                   onClick={() => handleReserveClick(service.id)}
                   className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                 >
                   Reservar
                 </button>
                 <Link href="/services" className="bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2 rounded-lg transition text-sm">
                   Detalles
                 </Link>
               </div>
             </div>
           </div>
         ))}
       </div>

       <div className="flex justify-center mt-12">
         <Link href="/services" className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-3 rounded-xl shadow-lg transition">
           Todos los servicios <ArrowRight size={18}/>
         </Link>
       </div>
     </div>
   </section>
 );
}