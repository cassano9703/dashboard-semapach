'use client';

import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';
import { Separator } from '@/components/ui/separator';

export default function ReporteCobranzaPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MonthlyAchievementsGallery />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8">
          <AnnualCollectionGoal />
        </div>
      </div>
      <Separator />
      <MonthlyCollectionGoal />
    </div>
  );
}
