// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Define las rutas que SÍ serán públicas
// Cualquiera puede verlas sin iniciar sesión.
const isPublicRoute = createRouteMatcher([
  '/', 
  '/gallery', 
  '/services',
  
  // Rutas de API y de autenticación de Clerk
  // (para que el login/logout funcione)
  '/api(.*)', 
]);

export default clerkMiddleware((auth, req) => {
  // 2. Protege todas las rutas que NO sean públicas
  if (!isPublicRoute(req)) {
    auth.protect(); // <-- Esta es la función mágica
  }
});

// 3. La configuración del matcher la dejamos igual
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};