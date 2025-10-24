import {DailyCollectionChart} from '@/components/dashboard/daily-collection-chart';
import {DistrictProgress} from '@/components/dashboard/district-progress';
import {StatCards} from '@/components/dashboard/stat-cards';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

export default function Home() {
  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: es });
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <p className="text-lg font-medium capitalize">{currentMonth}</p>
        </div>
      </div>
      <StatCards />
      <DailyCollectionChart />
      <DistrictProgress />
    </div>
  );
}
