// app/gallery/layout.tsx
"use client";

import { Suspense } from 'react'; // 👈 Import Suspense

export default function GalleryLayout({ 
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Si el componente de la página (page.tsx) o cualquier componente
        en este layout usa useSearchParams(), DEBE estar envuelto en <Suspense>. 
      */}
      <Suspense fallback={<div>Cargando galería...</div>}>
        {children}
      </Suspense>
    </div>
  );
}