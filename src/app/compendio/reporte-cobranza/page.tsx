'use client';

import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';

export default function ReporteCobranzaPage() {
  return (
    <div className="flex flex-col gap-8">
      <AnnualCollectionGoal />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlyAchievementsGallery />
        <MonthlyCollectionGoal />
      </div>
    </div>
  );
}
