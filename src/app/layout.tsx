// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

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
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-900`}
        >
          {/* 🎯 PASO 1: Envolver la Navbar. Si usa useSearchParams(), esto lo resuelve. */}
          <Suspense>
            <Navbar />
          </Suspense>

          <main className="flex-1 pt-20">
            {/* 🎯 PASO 2: Envolver los children para cubrir errores en las páginas anidadas. */}
            <Suspense fallback={<div className="text-white text-center p-8">Cargando contenido...</div>}>
              {children}
            </Suspense>
          </main>

          {/* 🎯 PASO 3: Envolver el Footer por si también usa el hook. */}
          <Suspense>
            <Footer />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}