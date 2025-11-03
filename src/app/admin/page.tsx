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
    // No esperamos a que la carga termine para redirigir.
    // Si en cualquier punto sabemos que no es admin, redirigimos.
    if (!isUserLoading && claims && claims.claims.role !== 'admin') {
      router.push('/');
    }
    // Si no hay usuario y la carga ha terminado, redirigir a login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, claims, isUserLoading, router]);

  // Mientras se carga, o si el usuario no es admin, mostramos el mensaje.
  // La redirección ocurrirá en el useEffect.
  if (isUserLoading || !claims || claims.claims.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
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
