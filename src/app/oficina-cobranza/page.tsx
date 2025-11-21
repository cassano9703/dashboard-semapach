
'use client';

import { useState } from 'react';
import { OverallProgress } from '@/components/oficina-cobranza/overall-progress';
import { ServiceOperationsSummary } from '@/components/oficina-cobranza/service-operations-summary';
import { DistrictProgress } from '@/components/dashboard/district-progress';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';

export default function OficinaCobranzaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Oficina de Cobranza</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <OverallProgress selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
        <div className="xl:col-span-1 flex flex-col gap-6">
           <DistrictProgress />
        </div>
      </div>
      
      <ServiceOperationsSummary selectedDate={selectedDate} onDateChange={setSelectedDate} />
      
      <RecoveredComparisonChart selectedDate={selectedDate} onDateChange={setSelectedDate} />
    </div>
  );
}
