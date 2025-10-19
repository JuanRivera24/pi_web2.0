// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // 1. Define las rutas que SÍ son PÚBLICAS.
  publicRoutes: [
    "/", 
    "/gallery", 
    "/services", 
    "/api(.*)" // Permite que las APIs de Clerk funcionen
  ],

  // 2. /dashboard/barber NO está en la lista,
  //    así que será protegida automáticamente.
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/(api|trpc)(.*)',
  ],
};