'use client';

import { DailyCollectionManager } from '@/components/admin/daily-collection-manager';
import { DistrictProgressManager } from '@/components/admin/district-progress-manager';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, claims, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      // If loading is finished, check for user and role
      if (!user) {
        // If no user, redirect to login
        router.push('/login');
      } else if (claims?.claims?.role !== 'admin') {
        // If user is not an admin, redirect to home
        router.push('/');
      }
    }
  }, [user, claims, isUserLoading, router]);

  // Show a loading state while we verify auth and roles
  if (isUserLoading || !user || claims?.claims?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Verificando acceso...</p>
      </div>
    );
  }

  // Render the admin page only if user is an admin
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Panel de Administración
      </h1>
      <DailyCollectionManager />
      <DistrictProgressManager />
    </div>
  );
}
