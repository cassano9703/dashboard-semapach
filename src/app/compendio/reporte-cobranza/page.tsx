import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';

export default function ReporteCobranzaPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Oficina de Cobranza 2025
      </h1>
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
