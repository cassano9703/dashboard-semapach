import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {MainNav} from '@/components/layout/main-nav';
import { Inter } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Panel Estadístico SEMAPACH',
  description: 'Sistema de monitoreo de recaudación y metas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          <Toaster />
          <SidebarProvider>
            <Sidebar className="border-r">
              <MainNav />
            </Sidebar>
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                  {/* Page Title or Breadcrumbs can go here */}
                </div>
              </header>
              <div className="flex flex-1 flex-col overflow-y-auto">
                <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
                <footer className="py-4 px-8 text-center text-sm text-muted-foreground border-t">
                  © 2025 SEMAPACH - Sistema de monitoreo de recaudación y metas
                </footer>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
