'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Recovered12PlusStatCards } from '@/components/dashboard/recovered-12-plus-stat-cards';
import { Recovered12PlusChart } from '@/components/dashboard/recovered-12-plus-chart';

export default function Recuperados12MasPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Recuperados 12 a más Meses (No Factibles)
        </h1>
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
  );
}
