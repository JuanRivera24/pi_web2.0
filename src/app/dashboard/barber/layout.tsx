// src/app/dashboard/barber/layout.tsx
"use client";
import BarberNavbar from "@/components/layout/BarberNavbar";

export default function BarberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <BarberNavbar />
      <main>
        {children}
      </main>
      {/* El footer se ha ido. Ahora solo se mostrará el del layout principal. */}
    </div>
  );
}