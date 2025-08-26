import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";  // 👈 Importamos el Navbar

export const metadata: Metadata = {
  title: "Mi página",
  description: "Página creada con Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Navbar /> {/* 👈 Aquí ponemos el navbar */}
        <main className="pt-20">{children}</main> {/* 👈 pt-20 evita que el contenido quede tapado */}
      </body>
    </html>
  );
}
