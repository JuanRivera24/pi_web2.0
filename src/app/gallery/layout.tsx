// src/app/dashboard/barber/layout.tsx
import Navbar from "@/components/layout/Navbar"; 
export default function BarberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main>
        {children}
      </main>
      {/* El footer se ha ido. Ahora solo se mostrará el del layout principal. */}
    </div>
  );
}