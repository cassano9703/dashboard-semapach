'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Recovered2to3StatCards } from '@/components/dashboard/recovered-2-to-3-stat-cards';
import { Recovered2to3Chart } from '@/components/dashboard/recovered-2-to-3-chart';

export default function Recuperados23MesesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Recuperados 2 a 3 Meses (No Factibles)
        </h1>
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
  );
}
