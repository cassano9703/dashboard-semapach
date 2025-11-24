'use client';

import { useState } from 'react';
import { CollectionDebtGoals } from '@/components/oficina-cobranza/collection-debt-goals';
import { DistrictProgressChart } from '@/components/dashboard/district-progress-chart';
import { ServiceOperationsSummary } from '@/components/oficina-cobranza/service-operations-summary';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { AnnualCollectionGoal } from '@/components/oficina-cobranza/annual-collection-goal';
import { MonthlyDebtChart } from '@/components/oficina-cobranza/monthly-debt-chart';


export default function ReportesCobranzaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 7, 1));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Reporte de Oficina de Cobranza</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <AnnualCollectionGoal selectedDate={selectedDate} />
            <CollectionDebtGoals selectedDate={selectedDate} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
           <MonthlyDebtChart />
        </div>
      </div>
      
      <ServiceOperationsSummary selectedDate={selectedDate} onDateChange={setSelectedDate} />
      
      <div className="flex flex-col gap-6">
        <RecoveredComparisonChart selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

    </div>
  );
}
