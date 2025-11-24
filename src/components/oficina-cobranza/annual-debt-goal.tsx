'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format, parseISO, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Separator } from '../ui/separator';

interface AnnualDebtGoalProps {
  selectedDate: Date;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function AnnualDebtGoal({ selectedDate }: AnnualDebtGoalProps) {
  const firestore = useFirestore();

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    const currentYear = format(selectedDate, 'yyyy');
    return query(
      collection(firestore, 'monthly_goals'),
      where('month', '>=', `${currentYear}-01`),
      where('month', '<=', `${currentYear}-12`),
      where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore, selectedDate]);
  
  const { data: monthlyGoalsData, isLoading } = useCollection(monthlyGoalsRef);

  const { initialDebt, currentDebt, progress, targetDebt, chartData } = useMemo(() => {
    const debtTarget = 9300000;
    if (!monthlyGoalsData || monthlyGoalsData.length === 0) {
      return { initialDebt: 0, currentDebt: 0, progress: 0, targetDebt: debtTarget, chartData: [] };
    }

    const sortedGoals = [...monthlyGoalsData].sort((a, b) =>
      a.month.localeCompare(b.month)
    );
    
    const initial = debtTarget; // Using fixed target for now as per image
    const current = debtTarget; // Using fixed target for now as per image

    const totalToReduce = 0; // Placeholder
    const reducedSoFar = 0; // Placeholder
    const progressPercentage = 0; // Placeholder
    
    const chart = sortedGoals.map(goal => ({
        name: format(parseISO(goal.month + '-01'), 'MMM', { locale: es }),
        'Deuda Actual': goal.executedAmount || goal.proposedAmount,
    }));

    return {
      initialDebt: initial,
      currentDebt: current,
      progress: Math.max(0, Math.min(progressPercentage, 100)),
      targetDebt: debtTarget,
      chartData: chart,
    };
  }, [monthlyGoalsData]);


  if (isLoading) {
    return <Card className="h-full flex items-center justify-center"><p>Cargando...</p></Card>;
  }

  if (!monthlyGoalsData || monthlyGoalsData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reducción de Deuda ({format(selectedDate, 'yyyy')})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Inicial: {formatCurrency(initialDebt)}</span>
                <span>Meta: {formatCurrency(targetDebt)}</span>
            </div>
        </div>

        <Separator className="my-4" />

        <div>
            <h3 className="font-semibold">Deuda de 3 a más</h3>
            <p className="text-sm text-muted-foreground">
                Gráfico de la deuda actual por mes.
            </p>
            <div className="h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            cursor={{ fill: 'hsl(var(--accent))' }}
                        />
                        <Bar dataKey="Deuda Actual" fill="hsl(var(--chart-2))" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
