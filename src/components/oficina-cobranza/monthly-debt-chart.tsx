'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
        'Deuda': data?.executedAmount ?? data?.proposedAmount ?? null,
      };
    }).filter(d => d['Deuda'] !== null);
  }, [debtGoalsData, currentYear]);

  if (isLoading) {
      return (
          <div className="h-[150px] flex items-center justify-center text-muted-foreground">
              Cargando gráfico...
          </div>
      );
  }

  if (chartData.length === 0) {
    return (
        <div className="h-[150px] flex items-center justify-center text-muted-foreground">
            No hay datos de deuda para este año.
        </div>
    );
  }

  return (
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData} layout="vertical" margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis 
                type="number" 
                hide 
            />
            <YAxis 
                type="category" 
                dataKey="name" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
            />
            <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{ fontSize: '12px' }}
            formatter={(value: number) => [formatCurrency(value), 'Deuda']}
            />
            <Bar dataKey="Deuda" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
  );
}
