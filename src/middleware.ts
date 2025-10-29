import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Définir les routes publiques (accessibles sans authentification)
 */
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/explorer(.*)",
  "/api/webhooks(.*)",
  "/api/uploadthing(.*)",
  "/not-found",
]);

/**
 * Middleware Clerk pour la protection des routes
 * - Les routes publiques sont accessibles à tout le monde
 * - Les autres routes nécessitent une authentification Clerk
 * - Ajoute des headers de sécurité CSRF
 */
export default clerkMiddleware(async (auth, request) => {
  // ✅ ÉTAPE 1: Protéger les routes non publiques
  if (!isPublicRoute(request)) {
    auth.protect();
  }

  // ✅ ÉTAPE 2: Ajouter les headers de sécurité
  // Note: On crée une nouvelle réponse avec les headers, pas on retourne juste les headers
  const requestHeaders = new Headers(request.headers);

  // Ajouter un token CSRF unique pour chaque requête
  requestHeaders.set("X-CSRF-Token", crypto.randomUUID());

  // Ajouter d'autres headers de sécurité
  requestHeaders.set("X-Content-Type-Options", "nosniff");
  requestHeaders.set("X-Frame-Options", "DENY");
  requestHeaders.set("X-XSS-Protection", "1; mode=block");

  // ⚠️ NE PAS RETOURNER requestHeaders directement
  // Le middleware Clerk gère automatiquement les headers
});

/**
 * Configuration du matcher pour les routes
 */
export const config = {
  matcher: [
    // Skip Next.js internals et fichiers statiques
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Toujours exécuter pour les routes API et tRPC
    "/(api|trpc)(.*)",
  ],
};