// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define tus rutas públicas
const isPublicRoute = createRouteMatcher([
  '/',
  '/services',
  '/gallery',
  // ...otras rutas públicas
]);

// Define rutas protegidas específicas de barberos
const isBarberRoute = createRouteMatcher([
  '/dashboard/barber(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Si la ruta NO es pública, es una ruta protegida
  if (!isPublicRoute(req)) {
    const { userId } = await auth();

    // Si el usuario NO está logueado...
    if (!userId) {
      let modalType = 'client-login'; // Por defecto, abrir el modal de cliente
      
      // ...pero si intentaba entrar a una ruta de barbero, cambia el modal
      if (isBarberRoute(req)) {
        modalType = 'barber-login';
      }

      // Construye la URL de redirección
      const loginUrl = new URL(`/?modal=${modalType}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Si es pública o si el usuario está logueado, permite el acceso
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};