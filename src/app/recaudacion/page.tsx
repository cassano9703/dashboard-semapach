import {DailyCollectionChart} from '@/components/dashboard/daily-collection-chart';
import {StatCards} from '@/components/dashboard/stat-cards';

export default function RecaudacionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Recaudación Diaria
      </h1>
      <StatCards />
      <DailyCollectionChart />
    </div>
  );
}
