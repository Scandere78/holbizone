import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import  Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import WhoToFollow from "@/components/WhoToFollow";
import MobileNavbar from "@/components/MobileNavbar";
import { Toaster } from "react-hot-toast";
import { currentUser } from "@clerk/nextjs/server";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkUser = await currentUser();

  // Sérialiser les données du user pour les Client Components
  const user = clerkUser ? {
    id: clerkUser.id,
    username: clerkUser.username,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    fullName: clerkUser.fullName,
    imageUrl: clerkUser.imageUrl,
    emailAddresses: clerkUser.emailAddresses.map(email => ({
      emailAddress: email.emailAddress
    }))
  } : null;

  return (
  <ClerkProvider>
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Dégradé moderne avec animation */}
          <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 dark:from-gray-950 dark:via-red-950/30 dark:to-black relative overflow-hidden">
            {/* Cercles décoratifs en arrière-plan */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200/20 dark:bg-red-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/20 dark:bg-pink-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <Navbar/>

              <main className="py-6 md:py-8 mb-16 md:mb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    <div className="hidden lg:block lg:col-span-3">
                      <Sidebar/>
                    </div>
                    <div className="lg:col-span-6">
                      {children}
                    </div>
                    <div className="hidden lg:block lg:col-span-3">
                      <WhoToFollow />
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>

          {/* Mobile Navbar en bas uniquement */}
          {user && <MobileNavbar user={user} />}

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  </ClerkProvider>
  );
}