"use client";

import { useState } from "react";
import Register from "./RegisterForm";

export default function Login() {
  const [showRegister, setShowRegister] = useState(false);

  const toggleRegister = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Iniciar sesión
      </h2>
      <form className="space-y-5">
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
        >
          Entrar
        </button>
      </form>

      {/* Botón para abrir modal */}
      <p className="text-center mt-4 text-gray-600">
        ¿No tienes cuenta?{" "}
        <button
          onClick={toggleRegister}
          className="text-black font-semibold hover:underline"
        >
          Regístrate
        </button>
      </p>

      {/* Modal de registro */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl relative w-full max-w-md">
            <button
              onClick={toggleRegister}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✖
            </button>
            <Register />
          </div>
        </div>
      )}
    </div>
  );
}
