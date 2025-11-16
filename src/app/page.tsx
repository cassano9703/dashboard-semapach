'use client';

import { DailyCollectionChart } from '@/components/dashboard/daily-collection-chart';
import { DistrictProgress } from '@/components/dashboard/district-progress';
import { StatCards } from '@/components/dashboard/stat-cards';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { RecoveredSummary } from '@/components/dashboard/recovered-summary';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { RecoveredStatsCards } from '@/components/dashboard/recovered-stats-cards';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const currentMonth = format(selectedDate, "MMMM 'de' yyyy", { locale: es });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <p className="text-lg font-medium capitalize">{currentMonth}</p>
        </div>
      </div>
      <StatCards selectedDate={selectedDate} />
      <DailyCollectionChart selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <hr className="my-4" />

      <DistrictProgress />
      
      <hr className="my-4" />

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight">Análisis de Usuarios Recuperados</h2>
        <RecoveredStatsCards selectedDate={selectedDate} />
        <RecoveredComparisonChart selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <RecoveredSummary selectedDate={selectedDate} />
      </div>

    </div>
  );
}
