"use client";

import {
  Bar,
  BarChart,
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
import { format, startOfMonth, endOfMonth, parseISO, startOfWeek, addWeeks, getMonth, endOfWeek } from 'date-fns';
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
    
    const weeklyTotals: { [week: number]: { amount: number, weekLabel: string } } = {};

    let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    let weekCounter = 1;

    while (currentWeekStart <= monthEnd) {
      const weekLabel = `Semana ${weekCounter}`;
      weeklyTotals[weekCounter] = { amount: 0, weekLabel };

      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

      servicesData.forEach(item => {
        const itemDate = parseISO(item.date + 'T00:00:00');
        if (getMonth(itemDate) === getMonth(selectedDate) && itemDate >= currentWeekStart && itemDate <= weekEnd) {
          weeklyTotals[weekCounter].amount += item.recoveredAmount;
        }
      });
      
      currentWeekStart = addWeeks(currentWeekStart, 1);
      weekCounter++;
    }

    return Object.values(weeklyTotals)
        .map(week => ({ name: week.weekLabel, 'Monto Recuperado': week.amount }))
        .filter(week => week['Monto Recuperado'] > 0);

  }, [servicesData, selectedDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monto Recuperado por Semana</CardTitle>
        <CardDescription>
          Total recuperado semanalmente para {format(selectedDate, "LLLL 'de' yyyy", { locale: es })}.
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
                    formatter={(value: number) => [formatCurrency(value), "Monto Recuperado"]}
                />
                <Legend />
                <Bar dataKey="Monto Recuperado" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
