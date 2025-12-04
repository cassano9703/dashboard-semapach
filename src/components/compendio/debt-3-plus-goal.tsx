"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '../ui/chart';
import { Target } from 'lucide-react';


const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'S/ 0';
    return `S/ ${value.toLocaleString('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
};

const chartConfig = {
    proposedAmount: {
        label: 'Deuda Inicial',
        color: 'hsl(50 95% 75%)',
    },
    executedAmount: {
        label: 'Deuda Actual',
        color: 'hsl(250 90% 80%)',
    },
} satisfies ChartConfig;

export function Debt3PlusGoal() {
  const firestore = useFirestore();
  const currentYear = new Date().getFullYear();

  const goalsRef = useMemoFirebase(
    () => (firestore ? query(
        collection(firestore, 'monthly_goals'),
        where('month', '>=', `${currentYear}-01`),
        where('month', '<=', `${currentYear}-12`),
        orderBy('month')
    ) : null),
    [firestore, currentYear]
  );
  const { data: goalsData, isLoading: isLoadingMonthly } = useCollection(goalsRef);
  
  const annualGoalRef = useMemoFirebase(
    () => (firestore ? query(
        collection(firestore, 'annual_goals'),
        where('year', '==', currentYear),
        where('goalType', '==', 'debt_3_plus')
    ) : null),
    [firestore, currentYear]
  );
  const { data: annualGoalData, isLoading: isLoadingAnnual } = useCollection(annualGoalRef);

  const annualGoalAmount = useMemo(() => {
    if (!annualGoalData || annualGoalData.length === 0) return 9300000;
    return annualGoalData[0].amount || 9300000;
  }, [annualGoalData]);


  const monthlyGoals = useMemo(() => {
    if (!goalsData) return [];
    
    return goalsData
      .filter(goal => {
        const monthIndex = parseInt(goal.month.split('-')[1]);
        return (
          goal.goalType === 'debt_3_plus' &&
          goal.proposedAmount > 0 &&
          monthIndex >= 8 && // August
          monthIndex <= 10 // October
        );
      })
      .map(goal => ({
          ...goal,
          name: format(parseISO(`${goal.month}-01T00:00:00`), 'LLLL', { locale: es }),
          executedAmount: goal.executedAmount || goal.proposedAmount,
        })
      )
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [goalsData]);

  const isLoading = isLoadingMonthly || isLoadingAnnual;

  return (
    <Card className="rounded-t-none">
      <CardHeader>
        <CardTitle>Deuda de 3 a Más</CardTitle>
        <CardDescription>Muestra la reducción mensual de la deuda de 3 a más meses.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[250px] text-muted-foreground">
            Cargando datos...
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-center gap-4 rounded-lg bg-green-100/70 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800 shadow-lg">
              <Target className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <p className="text-sm text-green-800 dark:text-green-200">Meta Anual de Reducción</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(annualGoalAmount)}</p>
              </div>
            </div>
            {monthlyGoals.length === 0 ? (
              <div className="flex justify-center items-center h-[250px] text-muted-foreground">
                No hay datos de metas de deuda para mostrar.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                  <BarChart
                    data={monthlyGoals}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        type="number" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `S/${Number(value) / 1000}k`}
                    />
                    <YAxis 
                        dataKey="name" 
                        type="category"
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        className="capitalize"
                    />
                    <Tooltip 
                        content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))}/>} 
                    />
                    <Legend />
                    <Bar 
                        dataKey="proposedAmount" 
                        fill="var(--color-proposedAmount)"
                        radius={[0, 4, 4, 0]}
                        name="Deuda Inicial"
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                    <Bar 
                        dataKey="executedAmount" 
                        fill="var(--color-executedAmount)"
                        radius={[0, 4, 4, 0]}
                        name="Deuda Actual"
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
