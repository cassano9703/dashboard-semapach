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
        color: 'hsl(var(--chart-4))',
    },
    executedAmount: {
        label: 'Deuda Actual',
        color: 'hsl(var(--chart-2))',
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
  const { data: goalsData, isLoading } = useCollection(goalsRef);

  const monthlyGoals = useMemo(() => {
    if (!goalsData) return [];
    
    return goalsData
      .filter(goal => 
        goal.goalType === 'debt_3_plus' && 
        goal.proposedAmount > 0 &&
        parseInt(goal.month.split('-')[1]) >= 8
      )
      .map(goal => ({
          ...goal,
          name: format(parseISO(`${goal.month}-01T00:00:00`), 'LLLL', { locale: es }),
          executedAmount: goal.executedAmount || goal.proposedAmount, // If executed is null, show it as not changed
        })
      );
  }, [goalsData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de Deuda (3 a + meses)</CardTitle>
        <CardDescription>Muestra la reducción mensual de la deuda de 3 a más meses.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[250px] text-muted-foreground">
            Cargando datos...
          </div>
        ) : monthlyGoals.length === 0 ? (
          <div className="flex justify-center items-center h-[250px] text-muted-foreground">
            No hay datos de metas de deuda para mostrar.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart
                data={monthlyGoals}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `S/${Number(value) / 1000}k`}
                />
                <Tooltip 
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))}/>} 
                />
                <Legend />
                <Bar 
                    dataKey="proposedAmount" 
                    fill="var(--color-proposedAmount)"
                    radius={[4, 4, 0, 0]}
                    name="Deuda Inicial"
                />
                <Bar 
                    dataKey="executedAmount" 
                    fill="var(--color-executedAmount)"
                    radius={[4, 4, 0, 0]}
                    name="Deuda Actual"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
