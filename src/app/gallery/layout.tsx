import Navbar from "@/components/layout/Navbar"; // Asegúrate que esta ruta a tu Navbar de cliente sea correcta

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="pt-20"> {/* pt-20 o similar para compensar la altura de la navbar */}
        {children}
      </main>
    </div>
  );
}
