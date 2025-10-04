======================================================================
            KINGDOM BARBER - PLATAFORMA WEB (PI_WEB2)
======================================================================

📅 **Documentación:** Web 2 - Kingdom Barber  
📆 **Fecha:** Octubre, 2025  
👥 **Autores:** Juan Rivera, Andrés Vallejo, Alejandro Urrego  

======================================================================
                   📘 DESCRIPCIÓN GENERAL
======================================================================

Kingdom Barber - Plataforma Web (pi_web2)  
Este repositorio contiene el código del **front-end** para la plataforma **Kingdom Barber**, desarrollado con **Next.js**, **React** y **TypeScript**.  
Esta aplicación es un **cliente puro** que consume la **API Central de Java (Spring Boot)**.

======================================================================
        📖 MANUAL DE USUARIO Y GUÍA DE EJECUCIÓN
======================================================================

-----------------------------
-- 1. REQUISITOS PREVIOS --
-----------------------------

Antes de empezar, asegúrate de tener instalado lo siguiente en tu sistema:

- Node.js (versión 18.x o superior)  
- npm  

⚠️ **Importante:** Esta aplicación es **solo el front-end**.  
Para que funcione correctamente, la API de Java (**pi_movil2**) debe estar ejecutándose en:  
👉 `http://localhost:8080`

-----------------------------
-- 2. INSTALACIÓN Y EJECUCIÓN --
-----------------------------

**Paso 1: Instalar dependencias**

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```
npm install
```

**Paso 2: Iniciar la aplicación**

Una vez instaladas las dependencias, ejecuta:

```
npm run dev
```

La aplicación estará disponible en tu navegador en:  
👉 `http://localhost:3000`

======================================================================
                   💡 GUÍA DE USO DE LA PLATAFORMA
======================================================================

-----------------------------
-- COMO CLIENTE --
-----------------------------

### a) Agendar una Cita:
1. **Inicia Sesión:** Regístrate o inicia sesión.  
2. **Ve al Calendario:** Navega a la sección de “Citas”.  
3. **Selecciona un Día:** Haz clic en un día y hora disponible.  
4. **Selecciona la Sede:** Elige una sede del primer desplegable.  
5. **Selecciona el Barbero:** Escoge un barbero disponible.  
6. **Elige los Servicios:** Marca uno o varios servicios.  
7. **Selecciona la Hora:** Escoge una hora libre. Las horas ocupadas se marcan como “Ocupado”.  
8. **Confirma la Cita:** Haz clic en “Confirmar Cita”. Recibirás una notificación y la cita se mostrará en el calendario.

### b) Modificar o Cancelar una Cita:
1. Haz clic sobre una de tus citas (en color azul).  
2. Se abrirá la ventana con los datos de tu cita.  
3. Puedes modificar campos y hacer clic en **Guardar Cambios**, o  
4. Hacer clic en **Eliminar** para cancelarla.

-----------------------------
-- COMO BARBERO --
-----------------------------

### a) Ver la Agenda:
1. Inicia sesión con un usuario que tenga el rol de barbero.  
2. Navega al panel **"Tu Agenda"**.  
3. Verás una lista de todas las citas activas, ordenadas por fecha.

### b) Gestionar la Galería:
1. Navega a la página de **"Galería"**.  
2. **Subir Imagen:** Haz clic en “Subir Imagen”, selecciona un archivo, añade una categoría y descripción.  
3. **Editar/Eliminar:** Cada foto incluye íconos para editar o eliminar.

======================================================================
                   📊 RESUMEN DEL PROYECTO
======================================================================

**Kingdom Barber (PI_WEB2.0)** es la plataforma web orientada al cliente y al personal de la barbería.  
Desarrollada con **Next.js (React + TypeScript)**, ofrece una interfaz fluida, rápida y responsiva.

Este proyecto es un **front-end puro**, sin lógica de negocio ni conexión directa a la base de datos.  
Toda la información y acciones (agendar citas, subir imágenes, etc.) se comunican exclusivamente con la  
**API Central de Java + Spring Boot**, que actúa como la **única fuente de verdad**.

======================================================================
                   🎯 OBJETIVOS DEL PROYECTO
======================================================================

**Objetivo Principal:**  
Proveer una experiencia de usuario moderna y eficiente para clientes y barberos,  
consumiendo los servicios de una API centralizada.

**Objetivos Específicos:**
- 🧭 Experiencia de Cliente Fluida: Sistema de agendamiento intuitivo y en tiempo real.  
- 💈 Presentación de la Marca: Mostrar servicios, galería e información de sedes.  
- 👨‍🔧 Herramienta del Barbero: Panel con agenda personal y gestión de citas.  
- 🔗 Desacoplamiento Total: Cliente independiente del backend (solo peticiones HTTP).  
- 📱 Diseño Responsivo: Funcionalidad óptima en móvil, tablet y escritorio.

======================================================================
           🏗️ ARQUITECTURA Y ESTRUCTURA DE CARPETAS
======================================================================

El proyecto usa la **arquitectura App Router de Next.js**, que organiza la aplicación  
por rutas y componentes modulares basados en la estructura de archivos real.

```
pi_web2.0/
├── 📂 app/              # Directorio principal de enrutamiento y páginas.
│   ├── 📂 dashboard/
│   │   └── 📂 barber/
│   │       └── 📜 page.tsx        # Vista de la agenda del barbero.
│   ├── 📂 gallery/
│   │   └── 📜 page.tsx            # Página de la galería.
│   ├── 📂 services/
│   │   └── 📜 page.tsx            # Página de servicios.
│   ├── 📜 page.tsx                # Página principal (Home).
│   ├── 📜 layout.tsx              # Layout global.
│   └── 📜 globals.css             # Estilos globales.
│
├── 📂 components/       # Componentes reutilizables de la interfaz.
│   ├── 📂 appointment/  # Componentes del calendario y modal de cita.
│   ├── 📂 auth/         # Autenticación de usuarios.
│   ├── 📂 contactform/  # Formulario de contacto.
│   ├── 📂 dashboard/    # Panel del barbero.
│   ├── 📂 diagnosis/    # Diagnóstico de API.
│   ├── 📂 layout/       # Navbar, Footer, etc.
│   └── 📂 services/     # Página de servicios.
│
├── 📂 public/           # Recursos estáticos (imágenes, logos, íconos).
│
├── 📜 middleware.ts     # Middleware para rutas protegidas.
├── 📜 next.config.ts    # Configuración de Next.js.
└── 📜 tailwind.config.js # Configuración de Tailwind CSS.
```

======================================================================
                   ⚙️ STACK TECNOLÓGICO
======================================================================

- **Framework Principal:** Next.js 13+ (App Router)  
- **Librería UI:** React 18+  
- **Lenguaje:** TypeScript  
- **Estilos:** Tailwind CSS  
- **Autenticación:** Clerk (`@clerk/nextjs`)  
- **Comunicación con Back-End:** Fetch API  
- **Componentes UI:**
  - Calendario → `react-big-calendar`  
  - Listas Desplegables → `@headlessui/react`  
  - Iconos → `lucide-react`
- **Back-End Externo:** API REST Java + Spring Boot (`http://localhost:8080`)

======================================================================
           🔄 FLUJO DE DATOS: RESERVA DE UNA CITA
======================================================================

1. **Cliente (React):**  
   El usuario autenticado selecciona sede, barbero, servicios y hora desde la interfaz.

2. **Front-End (Next.js):**  
   El componente `AppointmentCalendar.tsx` empaqueta los datos del formulario en un JSON  
   con los nombres esperados por la API (ej. `fechaInicio`, `barberId`).

3. **Petición Fetch:**  
   Se envía un `POST` al endpoint de la API:  
   👉 `http://localhost:8080/citas-activas`

4. **Back-End (Spring Boot):**  
   El `AgendamientoController` recibe la petición, crea el objeto `NuevaCita`  
   y lo persiste en la base de datos H2 mediante `NuevaCitaRepository`.

5. **Respuesta del Back-End:**  
   Devuelve el objeto `NuevaCita` guardado en formato JSON (HTTP 200 OK).

6. **Actualización de UI (React):**  
   El estado se actualiza y el calendario muestra la nueva cita junto con una notificación de éxito.

======================================================================
✅ FIN DE LA DOCUMENTACIÓN
======================================================================
