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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '../ui/chart';

const chartConfig = {
  weeklyCount: {
    label: 'Medidores Semanales',
    color: 'hsl(var(--chart-1))',
  },
  accumulatedCount: {
    label: 'Acumulado Mensual',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-PE').format(value);
};

interface WeeklyMeterProgressChartProps {
  selectedDate: Date;
}

export function WeeklyMeterProgressChart({ selectedDate }: WeeklyMeterProgressChartProps) {
  const firestore = useFirestore();

  const weeklyProgressRef = useMemoFirebase(
    () => {
      if (!firestore) return null;
      const monthStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
      return query(
        collection(firestore, 'weekly_meter_progress'),
        where('weekStartDate', '>=', monthStart),
        where('weekStartDate', '<=', monthEnd),
        orderBy('weekStartDate', 'asc')
      );
    },
    [firestore, selectedDate]
  );
  const { data: weeklyData, isLoading } = useCollection(weeklyProgressRef);

  const chartData = useMemo(() => {
    if (!weeklyData) return [];
    
    let accumulatedTotal = 0;
    
    return weeklyData.map(item => {
      accumulatedTotal += item.meterCount;
      return {
        name: `Sem. ${format(new Date(item.weekStartDate + 'T00:00'), 'dd MMM', { locale: es })}`,
        weeklyCount: item.meterCount,
        accumulatedCount: accumulatedTotal,
      }
    });
  }, [weeklyData]);

  if (isLoading) {
    return (
        <Card>
            <CardContent className="pt-6">
                 <div className="h-[250px] flex items-center justify-center text-muted-foreground">Cargando gráfico...</div>
            </CardContent>
        </Card>
    )
  }

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Evolución Semanal de Medidores</CardTitle>
                <CardDescription>Progreso de instalación por semana en {format(selectedDate, 'MMMM yyyy', {locale: es})}.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-[250px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar en este mes.</div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución Semanal de Medidores</CardTitle>
        <CardDescription>Progreso de instalación por semana en {format(selectedDate, 'MMMM yyyy', {locale: es})}.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => formatNumber(value as number)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={80}
                />
                <Tooltip
                  content={<ChartTooltipContent formatter={(value) => formatNumber(value as number)}/>}
                />
                <Legend />
                <Line
                  dataKey="weeklyCount"
                  type="monotone"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={true}
                  name="Medidores Semanales"
                />
                <Line
                  dataKey="accumulatedCount"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={true}
                  name="Acumulado Mensual"
                />
              </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
