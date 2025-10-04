======================================================================
             KINGDOM BARBER - WEB CLIENTE (PI_WEB2.0)
======================================================================

📘 **Documentación:** Web 2 - Kingdom Barber  
📆 **Fecha:** Octubre, 2025  
👥 **Autores:** Juan Rivera, Andrés Vallejo, Alejandro Urrego  

======================================================================
              🧭 MANUAL DE USUARIO Y GUÍA DE EJECUCIÓN
======================================================================

### -- 1. REQUISITOS PREVIOS --

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- 🟢 **Node.js** (versión 18.x o superior)  
- ⚙️ **npm** (gestor de paquetes)

⚠️ **Importante:**  
Esta aplicación es **solo el front-end**.  
Para que funcione correctamente, la **API de Java (pi_movil2)** debe estar ejecutándose en:  
👉 `http://localhost:8080`

---

### -- 2. INSTALACIÓN Y EJECUCIÓN --

**🧩 Paso 1: Instalar dependencias**

Abre una terminal en la carpeta raíz del proyecto y ejecuta:
```bash
npm install
```

**🚀 Paso 2: Iniciar la aplicación**

Una vez instaladas las dependencias, ejecuta:
```bash
npm run dev
```

La aplicación estará disponible en tu navegador en:  
👉 `http://localhost:3000`

======================================================================
                   💈 1. RESUMEN DEL PROYECTO
======================================================================

**Kingdom Barber (PI_WEB2.0)** es la plataforma web orientada al **cliente y personal de la barbería**.  
Desarrollada con **Next.js (React + TypeScript)**, ofrece una experiencia fluida, moderna y responsiva.

Este proyecto es un **front-end puro**, sin lógica de negocio ni conexión directa a la base de datos.  
Toda la información (citas, usuarios, servicios, imágenes, etc.) se comunica exclusivamente con la **API Central de Java + Spring Boot**, que actúa como la **única fuente de verdad**.

======================================================================
                 🎯 2. OBJETIVOS DEL PROYECTO
======================================================================

### 🎯 Objetivo Principal
Proveer una **experiencia de usuario moderna, rápida y eficiente** para clientes y barberos, consumiendo los servicios REST de la API centralizada.

### 🔹 Objetivos Específicos
- 💆 **Experiencia de Cliente Fluida:** Sistema de agendamiento intuitivo y en tiempo real con calendario interactivo.  
- 💇 **Presentación de la Marca:** Mostrar servicios, galería de trabajos e información de sedes de forma visual.  
- 🧔 **Herramienta del Barbero:** Panel sencillo para que el barbero vea su agenda de citas.  
- 🔗 **Desacoplamiento Total:** Cliente independiente del back-end, comunicación solo vía HTTP.  
- 📱 **Diseño Responsivo:** Adaptado a dispositivos móviles, tablets y escritorio.

======================================================================
           🏗️ 3. ARQUITECTURA Y ESTRUCTURA DE CARPETAS
======================================================================

El proyecto usa la arquitectura **App Router** de Next.js, que organiza la app por rutas y componentes reutilizables.

```
pi_web2.0/
├── 📂 app/                  # Rutas principales y páginas del proyecto
│   ├── 📂 dashboard/
│   │   └── 📂 barber/
│   │       └── 📜 page.tsx        # Agenda del barbero
│   ├── 📂 gallery/
│   │   └── 📜 page.tsx           # Galería de imágenes
│   ├── 📂 services/
│   │   └── 📜 page.tsx           # Página de servicios
│   ├── 📜 page.tsx               # Página principal (Home)
│   ├── 📜 layout.tsx             # Layout base
│   └── 📜 globals.css            # Estilos globales
│
├── 📂 components/           # Componentes reutilizables
│   ├── 📂 appointment/      # Calendario y modal de cita
│   ├── 📂 auth/             # Autenticación (login/register)
│   ├── 📂 contactform/      # Formulario de contacto
│   ├── 📂 dashboard/        # Componentes del panel de barbero
│   ├── 📂 diagnosis/        # Diagnóstico de estado API
│   ├── 📂 layout/           # Navbar, Footer, etc.
│   └── 📂 services/         # Componentes de servicios
│
├── 📂 public/               # Recursos estáticos (logos, imágenes)
│
├── 📜 middleware.ts         # Gestión de rutas protegidas
├── 📜 next.config.ts        # Configuración de Next.js
└── 📜 tailwind.config.js    # Personalización de Tailwind CSS
```

======================================================================
                🧩 4. STACK TECNOLÓGICO UTILIZADO
======================================================================

| Tecnología | Descripción |
|-------------|-------------|
| ⚛️ **Next.js 13+** | Framework principal (App Router) |
| 💡 **React 18+** | Librería base de UI |
| 🟦 **TypeScript** | Tipado estático y robustez |
| 🎨 **Tailwind CSS** | Estilos y diseño responsivo |
| 🔐 **Clerk** | Autenticación y manejo de sesiones |
| 🌐 **Fetch API** | Peticiones HTTP asíncronas |
| 📅 **react-big-calendar** | Calendario interactivo para citas |
| 📂 **@headlessui/react** | Listas y menús accesibles |
| 🧠 **lucide-react** | Iconografía moderna |
| 🔗 **API REST Java (Spring Boot)** | Fuente de datos principal — `http://localhost:8080` |

======================================================================
             🔄 5. FLUJO DE DATOS: RESERVA DE UNA CITA
======================================================================

**1️⃣ Cliente (React):**  
El usuario autenticado selecciona sede, barbero, servicio y hora en el calendario.

**2️⃣ Front-End (Next.js):**  
El componente `AppointmentCalendar.tsx` empaqueta los datos en un objeto JSON compatible con la API de Java (ej: `fechaInicio`, `barberId`, `serviceId`).

**3️⃣ Petición Fetch:**  
Se realiza un `POST` al endpoint:  
👉 `http://localhost:8080/citas-activas`

**4️⃣ Back-End (Java + Spring Boot):**  
El `AgendamientoController` recibe la petición, crea un objeto `NuevaCita`, añade información adicional y guarda los datos en la base de datos H2 mediante `NuevaCitaRepository`.

**5️⃣ Respuesta:**  
La API devuelve la cita completa en formato JSON con estado **200 OK**.

**6️⃣ Actualización UI:**  
React actualiza el estado interno con la nueva cita → el calendario se re-renderiza → se muestra la nueva cita y una notificación de éxito.

======================================================================
                     🧱 ESTADO DEL PROYECTO
======================================================================

✅ Integración completa con la API de Java (Spring Boot)  
✅ Autenticación funcional con Clerk  
✅ Diseño modular y 100% responsivo  
🚧 Próximos pasos: optimizar rendimiento e implementar notificaciones visuales

======================================================================
                     ✨ FIN DEL DOCUMENTO
======================================================================
