import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Kingdom Barber",
  description: "La mejor barbería de Medellín 👑✂️",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen bg-gray-100">
        {/* Navbar fijo arriba */}
        <Navbar />

        {/* Contenido de cada página */}
        <main className="flex-1">{children}</main>

        {/* Footer fijo abajo */}
        <Footer />
      </body>
    </html>
  );
}
