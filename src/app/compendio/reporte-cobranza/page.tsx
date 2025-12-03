'use client';

import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';
import { Separator } from '@/components/ui/separator';

export default function ReporteCobranzaPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight text-center uppercase">
        Reporte Anual Cobranza
      </h1>
      <AnnualCollectionGoal />
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <MonthlyAchievementsGallery />
        </div>
        <div className="lg:col-span-7">
          <MonthlyCollectionGoal />
        </div>
      </div>
    </div>
  );
}
