'use client';

import { MeterDataTable } from '@/components/medicion/meter-data-table';
import { MeterIndicatorsChart } from '@/components/medicion/meter-indicators-chart';
import { WeeklyMeterTracking } from '@/components/medicion/weekly-meter-tracking';
import { WeeklyMeterProgressChart } from '@/components/medicion/weekly-meter-progress-chart';
import { useState } from 'react';

export default function MedidoresPage() {
  const year = 2025;
  const [selectedDate, setSelectedWeekDate] = useState<Date>(new Date());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reporte de Indicadores de Medición ({year})
        </h1>
      </div>
      <MeterDataTable year={year} />
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
            Evolución Anual de Indicadores
        </h2>
        <MeterIndicatorsChart year={year} />
      </div>
      <WeeklyMeterTracking selectedDate={selectedDate} onDateChange={setSelectedWeekDate} />
      <WeeklyMeterProgressChart selectedDate={selectedDate} />
    </div>
  );
}
