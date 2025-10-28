import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import WhoToFollow from "@/components/WhoToFollow";
import MobileNavWrapper from "@/components/MobileNavWrapper";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { Toaster } from "react-hot-toast";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/user.action";
import { getUnreadMessagesCount } from "@/actions/message.action";
import { getUnreadNotificationCount } from "@/actions/notification.action";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HolbiHub",
  description: "Plateforme collaborative pour Holberton School",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    // Récupérer l'utilisateur Clerk
    const clerkUser = await currentUser();
    
    logger.info({
      context: "RootLayout",
      action: "Initializing layout",
      details: { userId: clerkUser?.id },
    });

    // Fetch badge counts et sync user en parallèle
    let unreadMessages = 0;
    let unreadNotifications = 0;
    
    if (clerkUser) {
      try {
        [unreadMessages, unreadNotifications] = await Promise.all([
          getUnreadMessagesCount(),
          getUnreadNotificationCount(),
          syncUser(),
        ]);

        logger.debug({
          context: "RootLayout",
          action: "User data fetched",
          details: {
            unreadMessages,
            unreadNotifications,
          },
        });
      } catch (error) {
        logger.error({
          context: "RootLayout",
          action: "Failed to fetch user data",
          error,
        });
        // Continue sans les badges
      }
    }

    // Sérialiser les données du user pour les Client Components
    const user = clerkUser
      ? {
          id: clerkUser.id,
          username: clerkUser.username,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          fullName: clerkUser.fullName,
          imageUrl: clerkUser.imageUrl,
          emailAddresses: clerkUser.emailAddresses.map((email) => ({
            emailAddress: email.emailAddress,
          })),
        }
      : null;

    return (
      <ClerkProvider>
        <html lang="fr" suppressHydrationWarning>
          <body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* Global Error Boundary */}
              <GlobalErrorBoundary>
                {/* Dégradé moderne avec animation */}
                <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 dark:from-gray-950 dark:via-red-950/30 dark:to-black relative overflow-hidden">
                  {/* Cercles décoratifs en arrière-plan */}
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200/20 dark:bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/20 dark:bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    {/* Navbar avec badges */}
                    <Navbar
                      user={user}
                      unreadMessages={unreadMessages}
                      unreadNotifications={unreadNotifications}
                    />

                    {/* Main Content */}
                    <main className="py-6 md:py-8 mb-16 md:mb-0">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                          {/* Sidebar - Desktop only */}
                          <div className="hidden lg:block lg:col-span-3">
                            <Sidebar />
                          </div>

                          {/* Main Feed */}
                          <div className="lg:col-span-6">
                            {children}
                          </div>

                          {/* Who to Follow - Desktop only */}
                          <div className="hidden lg:block lg:col-span-3">
                            <WhoToFollow />
                          </div>
                        </div>
                      </div>
                    </main>
                  </div>
                </div>

                {/* Mobile Navbar - Bottom Navigation */}
                <MobileNavWrapper initialUser={user} />

                {/* Toaster pour les notifications */}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: "var(--background)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                    },
                  }}
                />
              </GlobalErrorBoundary>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    );
  } catch (error) {
    logger.error({
      context: "RootLayout",
      action: "Critical layout error",
      error,
    });

    // Fallback layout en cas d'erreur critique
    return (
      <html lang="fr">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Erreur</h1>
              <p className="text-red-700 mb-4">
                Une erreur critique s'est produite au démarrage de l'application.
              </p>
              <a
                href="/"
                className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }
}