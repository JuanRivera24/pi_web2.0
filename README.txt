======================================================================
             🌐 KINGDOM BARBER - PLATAFORMA WEB (PI_WEB2)
======================================================================

📘 Documentación: Web 2 - Kingdom Barber  
📆 Fecha: Octubre, 2025  
👥 Autores: Juan Rivera, Andrés Vallejo, Alejandro Urrego  

======================================================================
                        📖 DESCRIPCIÓN GENERAL
======================================================================

Este repositorio contiene el código fuente del **front-end principal**
para clientes y personal de **Kingdom Barber**.  

Es una aplicación moderna desarrollada con **Next.js (React + TypeScript)**,
diseñada para ofrecer una experiencia fluida, responsiva y optimizada.

La aplicación actúa como el **cliente visual del ecosistema**, consumiendo
toda la información (citas, barberos, servicios, galería, contacto, etc.)
desde la API central `pi_movil2`, garantizando sincronización y rendimiento.

======================================================================
                      🚀 INFORMACIÓN DE DESPLIEGUE
======================================================================

🌐 Plataforma: Vercel (https://vercel.com/)  
🔗 URL Pública: https://pi-web2-six.vercel.app  
🧩 API Consumida: https://pi-movil2-0.onrender.com  
📦 Estado: Activo y en Producción  

======================================================================
                  🧭 GUÍA DE USUARIO Y EJECUCIÓN LOCAL
======================================================================

1️⃣ REQUISITOS PREVIOS  
----------------------
- 🟢 Node.js v18 o superior  
- ⚙️ npm (gestor de paquetes)  

⚠️ Nota:  
Esta aplicación es **solo el front-end**.  
Debe conectarse correctamente con la API de Java (`pi_movil2`)
para funcionar en modo de desarrollo.

2️⃣ INSTALACIÓN Y EJECUCIÓN  
----------------------------
git clone https://github.com/JuanRivera24/pi_web2.git  
cd pi_web2  
npm install  
npm run dev  

La aplicación estará disponible en:  
👉 http://localhost:3000  

======================================================================
                         💈 RESUMEN DEL PROYECTO
======================================================================

**PI_WEB2** es la interfaz visual de Kingdom Barber, dirigida tanto a
clientes como al personal.  

Desarrollada con **Next.js**, utiliza **React + Tailwind CSS** para ofrecer
una experiencia moderna, rápida y adaptable a cualquier dispositivo.

Toda la lógica de negocio reside en la API central (Java + Spring Boot),
por lo que este front-end se encarga únicamente de la **presentación,
interacción y consumo de datos** mediante peticiones HTTP (fetch/axios).

Desplegada globalmente en **Vercel**, garantiza rendimiento, seguridad
y escalabilidad en el ecosistema Kingdom Barber.

======================================================================
                        🎯 OBJETIVOS DEL PROYECTO
======================================================================

🎯 OBJETIVO PRINCIPAL  
Brindar una experiencia de usuario moderna y eficiente, conectando
a clientes y barberos con las funcionalidades centrales de la API.

🧩 OBJETIVOS ESPECÍFICOS  
- 💆 Experiencia fluida para clientes al agendar citas en tiempo real.  
- 💇 Mostrar servicios, galería e información de sedes de forma atractiva.  
- 🧔 Proveer al barbero un panel protegido para gestionar su agenda.  
- 🔗 Desacoplar completamente la interfaz del backend central.  
- 📱 Mantener un diseño responsivo y estético en todos los dispositivos.  

======================================================================
                 🏗️ ARQUITECTURA Y ESTRUCTURA DE CARPETAS
======================================================================

El proyecto implementa la **App Router Architecture** de Next.js,
organizando rutas, vistas y componentes de forma modular y escalable.

📂 pi_web2/
│
├── 📂 app/                     → Rutas y vistas principales
│   ├── dashboard/              → Panel interno del personal
│   │   ├── barber/             → Vista de agenda del barbero
│   │   │   └── page.tsx
│   │   └── gallery/            → Panel de galería
│   │       └── page.tsx
│   ├── page.tsx                → Página principal (Home)
│   ├── services/page.tsx       → Listado de servicios
│   ├── layout.tsx              → Layout global de la app
│   └── globals.css             → Estilos globales (Tailwind)
│
├── 📂 components/              → Componentes reutilizables
│   ├── appointment/            → Módulos de cita y calendario
│   ├── auth/                   → Login, registro y perfil
│   └── ...                     → Navbar, Footer, Modals, etc.
│
├── 📂 public/                  → Archivos estáticos (logos, imágenes)
│
├── 📜 middleware.ts            → Protección de rutas (auth Clerk)
└── 📜 next.config.ts           → Configuración del proyecto  

======================================================================
                   🧩 STACK TECNOLÓGICO UTILIZADO
======================================================================

⚛️ Next.js 13+ ............ Framework principal de React (App Router)  
💡 React 18+ .............. Librería base de componentes  
🟦 TypeScript ............. Tipado estático y mayor mantenibilidad  
🎨 Tailwind CSS ........... Framework CSS utility-first  
🔐 Clerk .................. Gestión de usuarios y sesiones  
🌐 Fetch API .............. Comunicación HTTP con la API Java  
📅 react-big-calendar ..... Calendario interactivo de agendamiento  
📂 @headlessui/react ...... Modales y menús accesibles sin estilos  
✨ lucide-react ........... Iconos SVG ligeros y personalizables  

======================================================================
                  🔄 FLUJO DE DATOS - RESERVA DE CITA
======================================================================

1️⃣ CLIENTE (React)  
El usuario autenticado con Clerk selecciona sede, barbero y servicio
en el calendario interactivo.

2️⃣ FRONT-END (Next.js)  
El componente `AppointmentCalendar.tsx` crea un objeto JSON con los datos
y lo envía mediante una petición `POST` a la API.

3️⃣ PETICIÓN HTTP  
Se envía la solicitud a:  
👉 https://pi-movil2-0.onrender.com/citas-activas  

4️⃣ BACK-END (Java + Spring Boot)  
El `AgendamientoController` recibe, valida y guarda la cita en PostgreSQL.

5️⃣ RESPUESTA Y ACTUALIZACIÓN DE UI  
La API devuelve el JSON de la cita creada.  
El front-end actualiza su estado y muestra la nueva cita en pantalla.  

======================================================================
                  🧱 DESPLIEGUE Y AUTOMATIZACIÓN (VERCEL)
======================================================================

🚀 Plataforma: **Vercel** (optimizada para Next.js)  
🔄 CI/CD: Despliegue automático al hacer push a la rama `main`.  
🧹 Linter: ESLint ejecuta validaciones y corrige importaciones no usadas.  
🔐 Variables de Entorno: Claves de Clerk y API gestionadas en Vercel.  
📦 Build automática: Genera versiones optimizadas de producción.  

======================================================================
                     👥 AUTORES Y CONTRIBUIDORES
======================================================================

👤 Juan Manuel Rivera  
👤 Andrés Vallejo  
👤 Alejandro Urrego  

Repositorio oficial:  
🔗 https://github.com/JuanRivera24/pi_web2.git  

======================================================================
                         🧩 FIN DEL DOCUMENTO
======================================================================
