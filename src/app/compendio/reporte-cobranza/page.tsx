'use client';

import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';

export default function ReporteCobranzaPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
          Compendio General de Gestión Comercial
        </h1>
        <p className="text-muted-foreground mt-2">
          Un resumen de los logros y avances más importantes del año.
        </p>
      </div>
      <AnnualCollectionGoal />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className='lg:col-span-5'>
            <MonthlyAchievementsGallery />
        </div>
        <div className='lg:col-span-7'>
            <MonthlyCollectionGoal />
        </div>
      </div>
    </div>
  );
}
