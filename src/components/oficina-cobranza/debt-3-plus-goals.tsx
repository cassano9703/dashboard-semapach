'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../ui/chart';

interface Debt3PlusGoalsProps {
  selectedDate: Date;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function Debt3PlusGoals({ selectedDate }: Debt3PlusGoalsProps) {
  const firestore = useFirestore();

  const goalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'monthly_goals'));
  }, [firestore]);

  const { data: goalsData, isLoading } = useCollection(goalsRef);

  const debtGoals = useMemo(() => {
    const dbtGoals: any[] = Array(12).fill(null);
    const currentYear = format(selectedDate, 'yyyy');
    
    if (goalsData) {
       goalsData
        .filter(goal => goal.month.startsWith(currentYear) && goal.goalType === 'debt_3_plus')
        .forEach(goal => {
            const monthIndex = getMonth(parseISO(goal.month + '-01T12:00:00Z'));
            dbtGoals[monthIndex] = goal;
        });
    }
    return dbtGoals.slice(7, 11);
  }, [goalsData, selectedDate]);
  
  const chartData = useMemo(() => {
    return debtGoals.map((goal, index) => ({
        name: format(new Date(2025, index + 7, 1), 'MMM', { locale: es }),
        'Deuda Actual': goal?.executedAmount ?? goal?.proposedAmount ?? 0,
    })).filter(item => item['Deuda Actual'] > 0);
  }, [debtGoals]);

  const renderGoalRow = (title: string, currentAmount: number | undefined) => {
    const hasCurrentData = currentAmount !== undefined;

    return (
      <div className="grid grid-cols-2 items-center gap-4 text-sm" key={title}>
        <div className="col-span-1 font-medium capitalize">{title}</div>
        <div className="col-span-1 rounded-md border border-sky-500 p-2 text-right">
            {hasCurrentData ? formatCurrency(currentAmount) : '-'}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return <Card className="h-full flex items-center justify-center"><p>Cargando metas de deuda...</p></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deuda de 3 a mas</CardTitle>
        <CardDescription>Análisis de la deuda actual por mes.</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className='space-y-3'>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-muted-foreground">
                    <div className="col-span-1">Mes</div>
                    <div className="col-span-1 text-right">Deuda Actual</div>
                </div>
                {debtGoals.map((goal, index) =>
                renderGoalRow(
                    format(new Date(2025, index + 7, 1), 'LLLL', { locale: es }),
                    goal?.executedAmount ?? goal?.proposedAmount
                )
                )}
            </div>
            <div className="flex flex-col items-center justify-center">
                 {chartData.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">No hay datos para el gráfico.</div>
                ) : (
                <ChartContainer config={{}} className='w-full h-[200px]'>
                    <BarChart 
                        data={chartData} 
                        layout="vertical"
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
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
                        <Bar dataKey="Deuda Actual" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-2))" />
                    </BarChart>
                </ChartContainer>
                )}
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
