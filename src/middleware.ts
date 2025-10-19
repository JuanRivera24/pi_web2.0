// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define las rutas que SÍ son públicas
const isPublicRoute = createRouteMatcher([
  '/', 
  '/gallery', 
  '/services',
  '/api(.*)', // Permite que las APIs de Clerk funcionen
]);

export default clerkMiddleware((auth, req) => {
  // Protege todas las rutas que NO estén en la lista pública
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  // Este matcher hace que el middleware se ejecute en casi todo
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/(api|trpc)(.*)',
  ],
};