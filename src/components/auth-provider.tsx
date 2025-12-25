'use client';

import { useUser } from '@/firebase/auth/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      // Still checking user auth state
      return;
    }

    const isLoginPage = pathname === '/login';

    if (!user && !isLoginPage) {
      // If not logged in and not on login page, redirect to login
      router.replace('/login');
    } else if (user && isLoginPage) {
      // If logged in and on login page, redirect to home
      router.replace('/');
    }
  }, [user, isUserLoading, router, pathname]);

  // While loading, or if redirecting, you might want to show a loader
  // or nothing to prevent content flash.
  if (isUserLoading || (!user && pathname !== '/login')) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        </div>
    );
  }

  // If the user is logged in, or is on the login page, render the children
  return <>{children}</>;
}
