"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Gauge, Percent, CircleDot, FileBarChart } from 'lucide-react';

const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '0.00%';
    return `${(value * 100).toFixed(2)}%`;
};

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('es-PE');
};

interface MeterStatCardsProps {
    year: number;
}

export function MeterStatCards({ year }: MeterStatCardsProps) {
  const firestore = useFirestore();

  const meterDataRef = useMemoFirebase(
    () => {
        if (!firestore) return null;
        const yearStr = year.toString();
        return query(
            collection(firestore, 'meter_data'),
            where('month', '>=', `${yearStr}-01`),
            where('month', '<=', `${yearStr}-12`),
            orderBy('month', 'desc')
        );
    },
    [firestore, year]
  );
  const { data: meterData, isLoading } = useCollection(meterDataRef);

  const latestData = useMemo(() => {
    if (!meterData || meterData.length === 0) {
      return {
        month: `Año ${year}`,
        coverage: 0,
        micrometering_tariff_study: 0,
        micrometering_percentage: 0,
        meter_quantity: 0,
      };
    }
    const lastRecord = meterData[0];
    return {
      month: format(new Date(lastRecord.month + '-02'), 'LLLL yyyy', { locale: es }),
      coverage: lastRecord.coverage,
      micrometering_tariff_study: lastRecord.micrometering_tariff_study,
      micrometering_percentage: lastRecord.micrometering_percentage,
      meter_quantity: lastRecord.meter_quantity,
    };
  }, [meterData, year]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cantidad de Medidores</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(latestData.meter_quantity)}</div>
          <p className="text-xs text-muted-foreground">
            Total a {latestData.month}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercent(latestData.coverage)}</div>
           <p className="text-xs text-muted-foreground">
            Porcentaje de cobertura a {latestData.month}
          </p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Micromed. (Estudio Tarifario)</CardTitle>
          <FileBarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercent(latestData.micrometering_tariff_study)}</div>
          <p className="text-xs text-muted-foreground">
            Estudio tarifario a {latestData.month}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Micromedición PMC %</CardTitle>
          <CircleDot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercent(latestData.micrometering_percentage)}</div>
          <p className="text-xs text-muted-foreground">
            Porcentaje de micromed. a {latestData.month}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
