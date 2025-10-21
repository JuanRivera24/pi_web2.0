import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar"; 
import Footer from "@/components/layout/Footer"; 
import "react-big-calendar/lib/css/react-big-calendar.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Puedes actualizar esto para que sea más profesional
  title: "Kingdom Barber",
  description: "Eleva tu estilo, gobierna tu imagen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body
          // --- CORRECCIÓN APLICADA AQUÍ ---
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-900`}
        >
          <Navbar />

          {/* El pt-20 aquí es correcto, pero ahora se verá sobre un fondo oscuro */}
          <main className="flex-1 pt-20">
            {children}
          </main>

          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}