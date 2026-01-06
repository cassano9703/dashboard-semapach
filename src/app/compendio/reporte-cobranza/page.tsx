'use client';

import { useState, useEffect } from 'react';
import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';
import { DistrictProgressChart } from '@/components/dashboard/district-progress-chart';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { ServiceOperationStats } from '@/components/compendio/service-operation-stats';
import { Debt3PlusGoal } from '@/components/compendio/debt-3-plus-goal';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReporteCobranzaPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  if (!selectedDate) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <div className="flex justify-center items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
            Compendio General de Gestión Comercial
          </h1>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-muted-foreground mt-2">
          Un resumen de los logros y avances más importantes del año.
        </p>
      </div>
      <AnnualCollectionGoal year={selectedYear} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className='lg:col-span-5 flex flex-col'>
          <MonthlyAchievementsGallery year={selectedYear} />
          <ServiceOperationStats year={selectedYear}/>
          <Debt3PlusGoal year={selectedYear} />
        </div>
        <div className='lg:col-span-7 flex flex-col gap-8'>
            <MonthlyCollectionGoal year={selectedYear} />
            <DistrictProgressChart year={selectedYear} />
            <RecoveredComparisonChart selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
      </div>
    </div>
  );
}
