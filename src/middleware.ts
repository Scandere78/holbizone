import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Définir les routes publiques (accessibles sans authentification)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/explorer(.*)',
  '/api/webhooks(.*)',
  '/api/uploadthing(.*)',
  '/not-found',
]);

/**
 * Middleware Clerk pour la protection des routes
 * - Les routes publiques sont accessibles à tout le monde
 * - Les autres routes nécessitent une authentification
 */
export default clerkMiddleware((auth, request) => {
  // Si la route n'est pas publique, protéger l'accès
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

// Configuration du matcher pour les routes
export const config = {
  matcher: [
    // Skip Next.js internals et fichiers statiques, sauf s'ils sont dans les search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter pour les routes API et tRPC
    '/(api|trpc)(.*)',
  ],
};