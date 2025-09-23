// src/components/auth/BarberLoginForm.tsx

"use client";

import { SignIn } from "@clerk/nextjs";

export default function BarberLoginForm() {
  return (
    // Puedes personalizar los estilos si quieres que se vea diferente
    <div className="w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Ingreso de Barbero
      </h2>
      <SignIn
        routing="hash"
        // ¡Esta es la línea clave!
        // Después de iniciar sesión, redirige al dashboard del barbero.
        redirectUrl="/dashboard/barber"
      />
    </div>
  );
}