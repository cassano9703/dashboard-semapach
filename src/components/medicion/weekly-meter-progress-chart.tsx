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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';

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
    return weeklyData.map(item => ({
      name: `Sem. ${format(new Date(item.weekStartDate + 'T00:00'), 'dd MMM', { locale: es })}`,
      'Medidores Instalados': item.meterCount,
    }));
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
        <ChartContainer config={{}} className="h-[250px] w-full">
            <ResponsiveContainer>
            <BarChart data={chartData}>
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
                    fontSize={12}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent formatter={(value) => formatNumber(value as number)} />}
                />
                <Bar dataKey="Medidores Instalados" fill="hsl(var(--chart-1))" radius={4} activeBar={<Rectangle fill="hsl(var(--chart-1) / 0.8)" />} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
