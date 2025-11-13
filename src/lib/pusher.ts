import type Pusher from "pusher";
import type PusherClient from "pusher-js";

/**
 * Configuration Pusher avec lazy initialization
 *
 * IMPORTANT: Les instances ne sont créées qu'au runtime, pas pendant le build
 */

// ============================================
// SERVER-SIDE PUSHER (LAZY)
// ============================================

let pusherServerInstance: Pusher | null = null;
let pusherServerInitialized = false;

export async function getPusherServer(): Promise<Pusher | null> {
  if (pusherServerInitialized) {
    return pusherServerInstance;
  }

  try {
    // Vérifier les variables d'environnement
    if (
      !process.env.PUSHER_APP_ID ||
      !process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
      !process.env.PUSHER_SECRET ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      pusherServerInitialized = true;
      pusherServerInstance = null;
      return null;
    }

    // Dynamic import pour éviter l'exécution pendant le build
    const PusherModule = await import("pusher");
    const PusherConstructor = PusherModule.default;

    pusherServerInstance = new PusherConstructor({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    pusherServerInitialized = true;
    return pusherServerInstance;
  } catch (error) {
    pusherServerInitialized = true;
    pusherServerInstance = null;
    return null;
  }
}

// Export pour compatibilité (mais préférer getPusherServer())
export const pusherServer = {
  get: getPusherServer,
};

// ============================================
// CLIENT-SIDE PUSHER (LAZY)
// ============================================

let pusherClientInstance: PusherClient | null = null;
let pusherClientInitialized = false;

export async function getPusherClient(): Promise<PusherClient | null> {
  if (pusherClientInitialized) {
    return pusherClientInstance;
  }

  try {
    // Vérifier les variables d'environnement
    if (
      !process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      pusherClientInitialized = true;
      pusherClientInstance = null;
      return null;
    }

    // Dynamic import pour éviter l'exécution pendant le build
    const PusherClientModule = await import("pusher-js");
    const PusherClientConstructor = PusherClientModule.default;

    pusherClientInstance = new PusherClientConstructor(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      }
    );

    pusherClientInitialized = true;
    return pusherClientInstance;
  } catch (error) {
    pusherClientInitialized = true;
    pusherClientInstance = null;
    return null;
  }
}

// Export pour compatibilité (mais préférer getPusherClient())
export const pusherClient = {
  get: getPusherClient,
};
