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
import { format, parseISO } from 'date-fns';
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

  const { initialDebt, currentDebt, progress, targetDebt, chartData, currentMonthLabel } = useMemo(() => {
    const debtTarget = 9300000;
    if (!monthlyGoalsData || monthlyGoalsData.length === 0) {
      return { initialDebt: 0, currentDebt: 0, progress: 0, targetDebt: debtTarget, chartData: [], currentMonthLabel: '' };
    }

    const sortedGoals = [...monthlyGoalsData].sort((a, b) =>
      a.month.localeCompare(b.month)
    );
    
    const firstGoal = sortedGoals.find(g => g.month.endsWith('-08'));
    const lastGoal = sortedGoals[sortedGoals.length - 1];

    const initial = firstGoal?.proposedAmount || 0;
    const current = lastGoal?.executedAmount || lastGoal?.proposedAmount || 0;
    const monthLabel = format(parseISO(lastGoal.month + '-01'), 'LLLL', { locale: es });

    const totalToReduce = initial - debtTarget;
    const reducedSoFar = initial - current;
    const progressPercentage = totalToReduce > 0 ? (reducedSoFar / totalToReduce) * 100 : 0;
    
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
      currentMonthLabel: monthLabel,
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
        <div className="flex justify-between items-baseline">
            <span className="text-muted-foreground capitalize">Deuda a {currentMonthLabel}</span>
            <span className="text-2xl font-bold">{formatCurrency(currentDebt)}</span>
        </div>
        <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
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
