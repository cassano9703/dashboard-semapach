'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../ui/chart';

interface MonthlyDebtChartProps {
  selectedDate: Date;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function MonthlyDebtChart({ selectedDate }: MonthlyDebtChartProps) {
  const firestore = useFirestore();
  const currentYear = format(selectedDate, 'yyyy');

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'monthly_goals'),
        orderBy('month')
    );
  }, [firestore]);

  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const chartData = useMemo(() => {
    const debtGoals: any[] = Array(12).fill(null);
    
    if (monthlyGoalsData) {
       monthlyGoalsData
        .filter(goal => goal.month.startsWith(currentYear) && goal.goalType === 'debt_3_plus')
        .forEach(goal => {
            const monthIndex = getMonth(parseISO(goal.month + '-01T12:00:00Z'));
            debtGoals[monthIndex] = goal;
        });
    }

    return debtGoals
        .slice(7, 10) // Aug, Sep, Oct
        .map((goal, index) => ({
            name: format(new Date(2025, index + 7, 1), 'MMM', { locale: es }),
            'Deuda Actual': goal?.executedAmount ?? goal?.proposedAmount ?? 0,
        }))
        .filter(item => item['Deuda Actual'] > 0);
  }, [monthlyGoalsData, currentYear]);

  const isLoading = isLoadingMonthly;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deuda de 3 a más</CardTitle>
        <CardDescription>Gráfico de la deuda actual por mes.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[150px] flex items-center justify-center text-muted-foreground">Cargando gráfico...</div>
        ) : chartData.length === 0 ? (
          <div className="h-[150px] flex items-center justify-center text-muted-foreground">No hay datos para el gráfico.</div>
        ) : (
          <ChartContainer config={{}} className='w-full h-[150px]'>
            <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 5, right: 0, bottom: 5, left: 0 }}
                barCategoryGap="20%"
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={40} />
                <RechartsTooltip
                    cursor={{ fill: 'hsla(var(--background))' }}
                    content={({ active, payload, label }) =>
                        active && payload && payload.length ? (
                        <div className="bg-background border rounded-lg p-2 shadow-lg -mt-12">
                            <p className="font-bold">{label}</p>
                            <p className="text-sm">{formatCurrency(payload[0].value as number)}</p>
                        </div>
                        ) : null
                    }
                    />
                <Bar dataKey="Deuda Actual" radius={4} fill="hsl(var(--chart-2))" />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
