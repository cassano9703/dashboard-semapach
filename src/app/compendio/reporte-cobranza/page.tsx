'use client';

import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';
import { DistrictProgressChart } from '@/components/dashboard/district-progress-chart';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { ServiceOperationStats } from '@/components/compendio/service-operation-stats';

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
        <div className='lg:col-span-5 flex flex-col'>
            <MonthlyAchievementsGallery />
            <ServiceOperationStats />
        </div>
        <div className='lg:col-span-7 flex flex-col gap-8'>
            <MonthlyCollectionGoal />
            <DistrictProgressChart />
        </div>
      </div>
    </div>
  );
}
