"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartContainer } from '../ui/chart';

const chartConfig = {
  meter_quantity: {
    label: 'Medidores',
    color: 'hsl(var(--chart-5))',
  },
  coverage: {
    label: 'Cobertura',
    color: 'hsl(var(--chart-2))',
  },
  micrometering_tariff_study: {
    label: 'Micromed. (E. T.)',
    color: 'hsl(var(--chart-3))',
  },
  micrometering_percentage: {
    label: 'Micromed. %',
    color: 'hsl(var(--chart-4))',
  }
};

interface MeterIndicatorsChartProps {
  year: number;
}

export function MeterIndicatorsChart({ year }: MeterIndicatorsChartProps) {
  const firestore = useFirestore();

  const meterDataRef = useMemoFirebase(
    () => {
        if (!firestore) return null;
        const yearStr = year.toString();
        return query(
            collection(firestore, 'meter_data'),
            where('month', '>=', `${yearStr}-01`),
            where('month', '<=', `${yearStr}-12`),
            orderBy('month', 'asc')
        );
    },
    [firestore, year]
  );
  const { data: meterData, isLoading } = useCollection(meterDataRef);

  const { chartData, minMeters, maxMeters } = useMemo(() => {
    if (!meterData) return { chartData: [], minMeters: 0, maxMeters: 0 };
  
    const yearDate = new Date(year, 0, 1);
    const months = eachMonthOfInterval({
      start: new Date(year, 7, 1), // Start from August
      end: endOfYear(yearDate),
    });
  
    const dataMap = new Map(meterData.map(item => [item.month, item]));
      
    const processedData = months.map(month => {
        const monthKey = format(month, 'yyyy-MM');
        const data = dataMap.get(monthKey);
        return {
            name: format(month, 'MMM', { locale: es }),
            meter_quantity: data?.meter_quantity ?? null,
            coverage: data ? data.coverage * 100 : null,
            micrometering_tariff_study: data ? data.micrometering_tariff_study * 100 : null,
            micrometering_percentage: data ? data.micrometering_percentage * 100 : null,
        }
    }).filter(d => d.meter_quantity !== null);

    if (processedData.length === 0) {
        return { chartData: [], minMeters: 0, maxMeters: 0 };
    }

    const meterQuantities = processedData.map(d => d.meter_quantity).filter(q => q !== null) as number[];
    const minVal = Math.min(...meterQuantities);
    const maxVal = Math.max(...meterQuantities);

    return { chartData: processedData, minMeters: minVal, maxMeters: maxVal };
  
  }, [meterData, year]);

  if (isLoading) {
    return <div className="text-center p-8">Cargando gráfico...</div>;
  }
  
  if (chartData.length === 0) {
      return (
        <Card>
            <CardContent className="pt-6">
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No hay datos de medidores para mostrar en el gráfico.
                </div>
            </CardContent>
        </Card>
      );
  }
  
  const domainMin = (dataMin: number) => {
    return Math.floor(dataMin * 0.95);
  };
  const domainMax = (dataMax: number) => {
    return Math.ceil(dataMax * 1.05);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores de Medición por Mes</CardTitle>
        <CardDescription>
          Evolución de los indicadores de medición durante el año {year}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="hsl(var(--chart-5))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value / 1000}k`}
                    domain={[domainMin, domainMax]}
                />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background p-2 border rounded-md shadow-lg">
                          <p className="font-bold">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={`item-${index}`} style={{ color: entry.color }}>
                              {`${entry.name}: ${entry.name === 'Cantidad Medidores' ? entry.value : `${Number(entry.value).toFixed(2)}%`}`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="meter_quantity" name="Cantidad Medidores" barSize={20} fill="hsl(var(--chart-5))" yAxisId="left" />
                <Line type="monotone" dataKey="meter_quantity" yAxisId="left" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 8, strokeWidth: 2 }} hide legendType="none" />
                <Line type="monotone" dataKey="coverage" name="Cobertura" yAxisId="right" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 8, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="micrometering_tariff_study" name="Micromed. (E_ T_)" yAxisId="right" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 8, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="micrometering_percentage" name="Micromed. %" yAxisId="right" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 8, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
