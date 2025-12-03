'use client';

import { DailyCollectionChart } from '@/components/dashboard/daily-collection-chart';
import { DistrictProgress } from '@/components/dashboard/district-progress';
import { StatCards } from '@/components/dashboard/stat-cards';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RecoveredSummary } from '@/components/dashboard/recovered-summary';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { RecoveredStatsCards } from '@/components/dashboard/recovered-stats-cards';
import { Recovered12PlusStatCards } from '@/components/dashboard/recovered-12-plus-stat-cards';
import { Recovered12PlusChart } from '@/components/dashboard/recovered-12-plus-chart';
import { Recovered2to3StatCards } from '@/components/dashboard/recovered-2-to-3-stat-cards';
import { Recovered2to3Chart } from '@/components/dashboard/recovered-2-to-3-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  if (!selectedDate) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }
  
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
        <h2 className="text-2xl font-bold tracking-tight">Análisis de Usuarios Suspendidos Recuperados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-5">
            <RecoveredStatsCards selectedDate={selectedDate} />
          </div>
        </div>
        <RecoveredComparisonChart selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <RecoveredSummary selectedDate={selectedDate} />
      </div>

      <hr className="my-4" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Análisis de Recuperados 12 a más Meses (No Factibles)</h2>
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                <AlertCircle className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                <AlertTitle>Nota Importante</AlertTitle>
                <AlertDescription>
                    Acá se coloca el dato de Cobranza efectiva de 12 meses a más que NO INCLUYA factibles (dato llenado del 1 al 15 de cada mes).
                </AlertDescription>
            </Alert>
        </div>
        <Recovered12PlusStatCards selectedDate={selectedDate} />
        <Recovered12PlusChart selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <hr className="my-4" />

      <div className="flex flex-col gap-6">
         <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Análisis de Recuperados 2 a 3 Meses (No Factibles)</h2>
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                <AlertCircle className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                <AlertTitle>Nota Importante</AlertTitle>
                <AlertDescription>
                    Acá se coloca el dato de Cobranza efectiva de 2 y 3 meses que NO INCLUYA factibles (dato llenado del 16 al 30 del mes).
                </AlertDescription>
            </Alert>
        </div>
        <Recovered2to3StatCards selectedDate={selectedDate} />
        <Recovered2to3Chart selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

    </div>
  );
}
