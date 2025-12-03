import { CutsAndReconnectionsReport } from '@/components/compendio/cuts-reconnections-report';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';

export default function ReporteCobranzaPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Oficina de Cobranza 2025
      </h1>
      <MonthlyAchievementsGallery />
      <CutsAndReconnectionsReport />
    </div>
  );
}
