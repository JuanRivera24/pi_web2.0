// v2 - forzando el despliegue
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/', 
  '/gallery', 
  '/services',
  '/api(.*)', 
]);

export default clerkMiddleware((auth, req) => {
  // LOG DE DIAGNÓSTICO: Para ver si el middleware se ejecuta
  console.log('Middleware está corriendo para la ruta:', req.url);

  if (!isPublicRoute(req)) {
    // LOG DE DIAGNÓSTICO: Para ver si está intentando proteger
    console.log('RUTA PROTEGIDA. ¡Debería redirigir!:', req.url);
    auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};