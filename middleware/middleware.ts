// src/middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server';

// Esta es la forma más compatible. La función no necesita argumentos aquí.
export default clerkMiddleware();

// La configuración se lee por separado. Clerk la entiende.
export const config = {
  matcher: [
    // Esta expresión regular aplica el middleware a casi todas las rutas...
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // ...y también a las rutas de API
    '/(api|trpc)(.*)',
  ],
};