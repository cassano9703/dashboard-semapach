'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { RecoveredSummary } from '@/components/dashboard/recovered-summary';
import { RecoveredStatsCards } from '@/components/dashboard/recovered-stats-cards';
import { WeeklyRecoveredChart } from '@/components/dashboard/weekly-recovered-chart';


export default function SuspendidosRecuperadosPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Reporte de Usuarios Recuperados
      </h1>

      <RecoveredStatsCards selectedDate={selectedDate} />

      <RecoveredComparisonChart selectedDate={selectedDate} onDateChange={setSelectedDate}/>
      
      <RecoveredSummary selectedDate={selectedDate} />

      <WeeklyRecoveredChart selectedDate={selectedDate} />
    </div>
  );
}
