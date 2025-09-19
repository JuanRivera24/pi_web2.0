"use client";
import { useState } from "react";
export default function ContactSection() {
const [status, setStatus] = useState<string | null>(null);
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();
setStatus("Gracias, hemos recibido tu mensaje.");
};
return (
<section id="contacto" className="relative isolate overflow-hidden bg-gray-50 py-16 md:py-20">
<div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-gray-200/40 blur-3xl"></div>
<div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gray-200/40 blur-3xl"></div>
  <div className="mx-auto max-w-7xl px-6">
    <div className="grid items-center gap-10 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <div className="relative">
          <img
            src="/Images/contactanos.jpg"
            alt="Contacto"
            className="mx-auto aspect-[4/3] w-full max-w-2xl rounded-3xl object-cover shadow-2xl ring-1 ring-gray-200"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40"></div>
        </div>
      </div>

      <div className="lg:col-span-6 xl:col-span-5">
        <div className="relative rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200 md:p-10">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Contacto</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              Contáctanos
            </h2>
            <p className="mt-3 text-gray-600">
              Estamos atentos para brindarte la mejor atención. Escríbenos y te respondemos pronto.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="block w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Cuéntanos en qué podemos ayudarte"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">Respuesta: 24-48h hábiles</span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Enviar mensaje
              </button>
            </div>

            {status && (
              <p className="mt-3 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 ring-1 ring-gray-300">
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
);
}