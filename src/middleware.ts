// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Define la ÚNICA ruta que queremos proteger
const isProtectedRoute = createRouteMatcher([
  '/dashboard/barber(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // 2. Si la ruta es la que protegemos, llama a auth.protect()
  if (isProtectedRoute(req)) {
    auth.protect();
  }
  // Todas las demás rutas serán públicas por defecto
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/(api|trpc)(.*)',
  ],
};