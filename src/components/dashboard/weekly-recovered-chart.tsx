"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { format, startOfWeek, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface WeeklyRecoveredChartProps {
  selectedDate: Date;
}

export function WeeklyRecoveredChart({ selectedDate }: WeeklyRecoveredChartProps) {
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

    const weeklyTotals = servicesData.reduce((acc, item) => {
        const itemDate = parseISO(item.date + 'T00:00:00');
        
        if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
            const weekStart = startOfWeek(itemDate, { weekStartsOn: 1 });
            const weekKey = format(weekStart, 'yyyy-MM-dd');

            if (!acc[weekKey]) {
                acc[weekKey] = {
                    name: `Sem. ${format(weekStart, 'dd MMM', { locale: es })}`,
                    value: 0,
                };
            }
            acc[weekKey].value += item.recoveredAmount;
        }
        return acc;
    }, {} as Record<string, {name: string, value: number}>);
    
    return Object.values(weeklyTotals);
  }, [servicesData, selectedDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución Semanal de Montos Recuperados</CardTitle>
        <CardDescription>
          Monto total recuperado por semana para {format(selectedDate, "LLLL 'de' yyyy", { locale: es })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">Cargando datos del gráfico...</div>
        ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar en este mes.</div>
        ) : (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `S/${Number(value)/1000}k`}
                />
                <Tooltip 
                    contentStyle={{ fontSize: '12px' }}
                    formatter={(value) => [formatCurrency(Number(value)), "Monto Recuperado"]}
                />
                <Bar dataKey="value" name="Monto Recuperado" fill="hsl(var(--chart-2))" activeBar={<Rectangle fill="hsl(var(--chart-2) / 0.8)" />} />
            </BarChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
