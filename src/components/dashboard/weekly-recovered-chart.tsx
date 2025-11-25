"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '../ui/chart';

const chartConfig = {
  dailyAmount: {
    label: 'Recuperación Diaria',
    color: 'hsl(var(--chart-1))',
  },
  accumulatedAmount: {
    label: 'Acumulado Mensual',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface DailyRecoveredChartProps {
  selectedDate: Date;
}

export function WeeklyRecoveredChart({ selectedDate }: DailyRecoveredChartProps) {
  const firestore = useFirestore();

  const servicesRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_services'), orderBy('date', 'asc')) : null),
    [firestore]
  );
  
  const { data: servicesData, isLoading } = useCollection(servicesRef);
  
  const chartData = useMemo(() => {
    if (!servicesData) {
      return [];
    }

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const dataForMonth = servicesData.filter(item => {
        const itemDate = parseISO(item.date + 'T00:00:00');
        return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
    });

    if (dataForMonth.length === 0) return [];
    
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let accumulated = 0;
    let lastKnownAccumulated = null;

    const dailyData = daysInMonth.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const recordsForDay = dataForMonth.filter(item => item.date === dayStr);
        const hasRecord = recordsForDay.length > 0;
        
        let dailyTotal = null;

        if (hasRecord) {
            dailyTotal = recordsForDay.reduce((sum, item) => sum + item.recoveredAmount, 0);
            accumulated += dailyTotal;
            lastKnownAccumulated = accumulated;
        }

        return {
            date: format(day, 'd MMM', { locale: es }),
            dailyAmount: dailyTotal,
            accumulatedAmount: lastKnownAccumulated,
        }
    });

    // Filter out days at the beginning of the month with no data
    const firstDataIndex = dailyData.findIndex(d => d.accumulatedAmount !== null);
    return firstDataIndex === -1 ? [] : dailyData.slice(firstDataIndex);

  }, [servicesData, selectedDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución Diaria de Montos Recuperados</CardTitle>
        <CardDescription>
          Monto diario y acumulado recuperado para {format(selectedDate, "LLLL 'de' yyyy", { locale: es })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">Cargando datos del gráfico...</div>
        ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar en este mes.</div>
        ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                    />
                    <YAxis
                        tickFormatter={(value) => `S/ ${Number(value) / 1000}k`}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={80}
                    />
                    <Tooltip
                        content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))}/>}
                    />
                    <Legend />
                    <Line
                        dataKey="dailyAmount"
                        type="monotone"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={true}
                        name="Recuperación Diaria"
                        connectNulls
                    />
                    <Line
                        dataKey="accumulatedAmount"
                        type="step"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={true}
                        name="Acumulado Mensual"
                        connectNulls
                    />
                </LineChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
