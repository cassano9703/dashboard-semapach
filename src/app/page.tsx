import {DailyCollectionChart} from '@/components/dashboard/daily-collection-chart';
import {DistrictProgress} from '@/components/dashboard/district-progress';
import {StatCards} from '@/components/dashboard/stat-cards';

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
      <StatCards />
      <DailyCollectionChart />
      <DistrictProgress />
    </div>
  );
}
