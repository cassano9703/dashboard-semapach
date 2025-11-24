'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, eachMonthOfInterval, startOfYear, endOfYear, getYear, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function MonthlyDebtChart() {
  const firestore = useFirestore();
  const currentYear = getYear(new Date());

  const goalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    const yearStr = currentYear.toString();
    return query(
      collection(firestore, 'monthly_goals'),
      where('month', '>=', `${yearStr}-01`),
      where('month', '<=', `${yearStr}-12`),
      where('goalType', '==', 'debt_3_plus'),
      orderBy('month', 'asc')
    );
  }, [firestore, currentYear]);

  const { data: debtGoalsData, isLoading } = useCollection(goalsRef);

  const chartData = useMemo(() => {
    if (!debtGoalsData) return [];

    const yearDate = new Date(currentYear, 0, 1);
    const months = eachMonthOfInterval({
      start: startOfYear(yearDate),
      end: endOfYear(yearDate),
    });

    const dataMap = new Map(debtGoalsData.map(item => [item.month, item]));
    
    return months.map(month => {
      const monthKey = format(month, 'yyyy-MM');
      const data = dataMap.get(monthKey);
      return {
        name: format(month, 'MMM', { locale: es }),
        'Deuda 3+ Meses': data?.executedAmount ?? data?.proposedAmount ?? null,
      };
    }).filter(d => d['Deuda 3+ Meses'] !== null);
  }, [debtGoalsData, currentYear]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deuda 3+ Meses (S/)</CardTitle>
        <CardDescription>Evolución de la deuda durante el año {currentYear}.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Cargando gráfico...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No hay datos de deuda para este año.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `S/${Number(value) / 1000000}M`}
              />
              <Tooltip
                contentStyle={{ fontSize: '12px' }}
                formatter={(value: number) => [formatCurrency(value), 'Deuda']}
              />
              <Bar dataKey="Deuda 3+ Meses" fill="hsl(var(--chart-2))" activeBar={<Rectangle fill="hsl(var(--chart-2) / 0.8)" />} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
