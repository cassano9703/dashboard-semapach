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
import {UserNav} from '@/components/layout/user-nav';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Toaster />
        <SidebarProvider>
          <Sidebar>
            <MainNav />
          </Sidebar>
          <SidebarInset>
            <div className="flex flex-col min-h-screen">
              <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                  {/* Page Title or Breadcrumbs can go here */}
                </div>
                <UserNav />
              </header>
              <div className="flex-1 overflow-y-auto">
                <main className="p-4 md:p-6 lg:p-8">{children}</main>
                <footer className="py-4 px-8 text-center text-sm text-muted-foreground border-t">
                  © 2025 SEMAPACH - Sistema de monitoreo de recaudación y metas
                </footer>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
