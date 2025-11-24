'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Target } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
  const currentYear = format(selectedDate, 'yyyy');

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'monthly_goals'),
        orderBy('month')
    );
  }, [firestore]);

  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const {
    initialDebtForPeriod,
    currentDebt,
    targetDebt,
    progress,
    remainingToReduce,
  } = useMemo(() => {
    const filteredMonthlyGoals = monthlyGoalsData?.filter(
        (d) => d.month.startsWith(currentYear) && d.goalType === 'debt_3_plus'
    ) || [];

    if (filteredMonthlyGoals.length === 0) {
      return { initialDebtForPeriod: 0, currentDebt: 0, targetDebt: 9300000, progress: 0, remainingToReduce: 0 };
    }
    
    const firstData = filteredMonthlyGoals[0];
    const lastData = filteredMonthlyGoals[filteredMonthlyGoals.length - 1];
    
    const initialForProgress = firstData?.proposedAmount ?? 0;
    const current = lastData?.executedAmount ?? lastData?.proposedAmount ?? 0;
    
    const goal = 9300000;
    
    const totalReductionRequired = initialForProgress - goal;
    const reductionAchieved = initialForProgress - current;

    const progressPercentage = totalReductionRequired > 0 
      ? (reductionAchieved / totalReductionRequired) * 100 
      : 0;

    return {
      initialDebtForPeriod: initialForProgress,
      currentDebt: current,
      targetDebt: goal,
      progress: Math.max(0, progressPercentage),
      remainingToReduce: current - goal
    };
  }, [monthlyGoalsData, currentYear]);

  const isLoading = isLoadingMonthly;

  if (isLoading) {
      return (
          <Card className="h-full">
              <CardContent className="pt-6 h-full flex items-center justify-center">
                  <div className="h-24 animate-pulse bg-muted rounded-md w-full" />
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Reducción de Deuda ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Progress value={progress} className="h-3" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Progreso: {progress.toFixed(2)}%</p>
                    {remainingToReduce > 0 && <p>Falta reducir: {formatCurrency(remainingToReduce)}</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <div className="flex justify-between text-xs text-muted-foreground">
            <span>Inicial: {formatCurrency(initialDebtForPeriod)}</span>
            <span>Meta: {formatCurrency(targetDebt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
