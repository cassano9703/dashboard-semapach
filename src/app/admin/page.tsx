'use client';

import { DailyCollectionManager } from '@/components/admin/daily-collection-manager';
import { DistrictProgressManager } from '@/components/admin/district-progress-manager';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando...</p>
      </div>
    );
  }

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
