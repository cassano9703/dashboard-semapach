'use client';

import { DailyCollectionManager } from '@/components/admin/daily-collection-manager';
import { DistrictProgressManager } from '@/components/admin/district-progress-manager';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const SUPER_ADMIN_EMAIL = 'cassano9703@gmail.com';

export default function AdminPage() {
  const { user, claims, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // No hacer nada mientras se carga
    }

    const isAdmin = claims?.claims?.role === 'admin';
    const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

    // Si la carga ha terminado y el usuario no es admin ni super admin,
    // o si no hay usuario, redirigir.
    if (!isAdmin && !isSuperAdmin) {
      if (user) {
        router.push('/'); // Si hay un usuario logueado pero no es admin
      } else {
        router.push('/login'); // Si no hay ningún usuario logueado
      }
    }
  }, [user, claims, isUserLoading, router]);
  
  const isAdmin = claims?.claims?.role === 'admin';
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;


  // Mientras se carga, o si el usuario no tiene los permisos necesarios
  if (isUserLoading || (!isAdmin && !isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
        <p>Verificando acceso...</p>
      </div>
    );
  }

  // Render the admin page only if user is an admin or super admin
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
