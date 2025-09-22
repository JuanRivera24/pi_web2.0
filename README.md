======================================================================
👑 KINGDOM BARBER - PLATAFORMA DE GESTIÓN DE CITAS
======================================================================

Kingdom Barber es una aplicación web completa desarrollada con Next.js 
(React + TypeScript), diseñada para modernizar y optimizar la gestión 
de una barbería. 

La plataforma ofrece una experiencia de usuario fluida tanto para los 
clientes que desean reservar citas como para los barberos que necesitan 
administrar su agenda y servicios.

-----------------------------
-- ARQUITECTURA DEL PROYECTO --
-----------------------------

El proyecto sigue una estructura modular que facilita su mantenimiento 
y escalabilidad:

- `app/`: Carpeta principal de Next.js con las páginas y layouts.
- `app/page.tsx`: Página principal de la aplicación.
- `app/servicios/page.tsx`: Catálogo de servicios con filtros y carrito 
   de selección.
- `components/`: Componentes reutilizables de la interfaz (Navbar, Footer, Cards, etc.).
- `styles/`: Archivos de estilos, integrados con Tailwind CSS.
- `lib/` o `api/`: Endpoints y lógica de comunicación con la base de datos (CSV o APIs).
- `public/`: Recursos estáticos como imágenes, íconos y logos.

-----------------------------
--     FUNCIONALIDADES CLAVE --
-----------------------------

### 1. Para Clientes (👤)

**a) Autenticación de Usuarios (🔑):**
- Sistema de registro e inicio de sesión seguro.

**b) Sistema de Reservas Avanzado (📅):**
- Calendario interactivo con vistas de día, semana y mes.
- Selección personalizada de sede, barbero y servicios.
- Creación, modificación y cancelación de citas en tiempo real.

**c) Exploración de Servicios (💈):**
- Página dedicada con un carrusel de servicios y descripciones detalladas.

**d) Geolocalización (📍):**
- Mapa interactivo que muestra la ubicación de todas las sedes.

**e) Formulario de Contacto (💬):**
- Canal directo para que los clientes envíen sus consultas.

**f) Página Informativa (ℹ️):**
- Sección "Sobre Nosotros" para conocer más sobre la historia y el equipo.

---

### 2. Para Barberos (✂️)

**a) Acceso Exclusivo (🔑):**
- Panel de control personalizado al iniciar sesión como barbero.

**b) Gestión de Agenda (🗓️):**
- Visualización clara de todas las citas asignadas, 
  permitiendo una organización eficiente del día a día.

**c) Galería de Trabajos (🖼️):**
- Sección para mostrar los mejores cortes y estilos, 
  construida con carga optimizada de imágenes en Next.js.

**d) Acceso a Análisis de Datos (📊):**
- Enlace directo en la barra de navegación hacia un 
  Dashboard externo en Python + Pandas para visualizar métricas.

-----------------------------
--   TECNOLOGÍAS UTILIZADAS  --
-----------------------------

- **Frontend:** Next.js (React + TypeScript)
- **Styling:** Tailwind CSS
- **Backend & Data Storage:** APIs en Node.js con archivos CSV como base de datos
- **Análisis de Datos (Integración):** Python + Pandas
- **Despliegue:** Preparado para Vercel
