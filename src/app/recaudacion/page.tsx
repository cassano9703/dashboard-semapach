'use client';

import { DailyCollectionChart } from '@/components/dashboard/daily-collection-chart';
import { StatCards } from '@/components/dashboard/stat-cards';
import { useState, useEffect } from 'react';

export default function RecaudacionPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  if (!selectedDate) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Recaudación Diaria
      </h1>
      <StatCards selectedDate={selectedDate} />
      <DailyCollectionChart selectedDate={selectedDate} onDateChange={setSelectedDate} />
    </div>
  );
}
