"use client";

import React, { useState } from "react"; 
import Image from "next/image";
import { User, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function ContactSection() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const data = {
      nombre: formData.get("name"),
      email: formData.get("email"),
      mensaje: formData.get("message"),
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactanos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Algo salió mal al contactar la API.');
      }

      setStatus("¡Gracias! Tu mensaje ha sido enviado.");
      (e.target as HTMLFormElement).reset();

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="relative isolate overflow-hidden bg-gray-900 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="relative">
              <Image 
                src="/Images/contactanos.jpg" 
                alt="Barbero atendiendo a un cliente"
                width={800}
                height={600}
                className="mx-auto aspect-[4/3] w-full max-w-2xl rounded-3xl object-cover shadow-2xl ring-1 ring-white/10" 
              />
            </div>
          </div>
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="relative rounded-3xl bg-gray-800 p-8 shadow-xl ring-1 ring-white/10 md:p-10">
              
              {status ? (
                <div className="text-center">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">¡Mensaje Enviado!</h2>
                  <p className="mt-2 text-gray-300">{status}</p>
                  <button 
                    onClick={() => setStatus(null)}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <>
                  <header className="mb-8">
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Contáctanos</h2>
                    <p className="mt-3 text-gray-300">Estamos atentos para brindarte la mejor atención. Escríbenos y te respondemos pronto.</p>
                  </header>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                      <label htmlFor="name" className="sr-only">Nombre</label>
                      <User className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input id="name" name="name" type="text" autoComplete="name" required className="block w-full rounded-xl border border-white/10 bg-gray-900/50 py-3 pl-12 pr-4 text-white placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Tu nombre" />
                    </div>
                    <div className="relative">
                      <label htmlFor="email" className="sr-only">Correo electrónico</label>
                      <Mail className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className="block w-full rounded-xl border border-white/10 bg-gray-900/50 py-3 pl-12 pr-4 text-white placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="tu@correo.com" />
                    </div>
                    <div className="relative">
                      <label htmlFor="message" className="sr-only">Mensaje</label>
                      <MessageSquare className="pointer-events-none absolute top-4 left-4 h-5 w-5 text-gray-400" />
                      <textarea id="message" name="message" rows={4} required className="block w-full resize-none rounded-xl border border-white/10 bg-gray-900/50 py-3 pl-12 pr-4 text-white placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Cuéntanos en qué podemos ayudarte" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-400">Respuesta: 24-48h hábiles</span>
                      <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:bg-blue-800 disabled:opacity-70">
                        {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                        {!isSubmitting && <Send size={16} />}
                      </button>
                    </div>
                    {error && (<p className="mt-3 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300 ring-1 ring-red-500/50">{error}</p>)}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}