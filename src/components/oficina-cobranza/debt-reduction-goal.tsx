'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format, parseISO, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { TrendingDown } from 'lucide-react';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function DebtReductionGoal() {
  const firestore = useFirestore();
  const currentYear = new Date().getFullYear();
  const yearString = currentYear.toString();

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'monthly_goals'),
        where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore]);

  const annualGoalRef = useMemoFirebase(() => {
      if(!firestore) return null;
      return query(
          collection(firestore, 'annual_goals'),
          where('year', '==', currentYear),
          where('goalType', '==', 'debt_3_plus')
      )
  }, [firestore, currentYear]);

  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);
  const { data: annualGoalData, isLoading: isLoadingAnnual } = useCollection(annualGoalRef);

  const {
    initialDebt,
    currentDebt,
    targetDebt,
    progress,
    amountReduced,
    amountToReduce,
    currentMonthLabel,
  } = useMemo(() => {
    const target = annualGoalData?.[0]?.amount || 9300000;

    if (!monthlyGoalsData) {
        return {
            initialDebt: 0,
            currentDebt: 0,
            targetDebt: target,
            progress: 0,
            amountReduced: 0,
            amountToReduce: 0,
            currentMonthLabel: 'N/A'
        };
    }
    
    const yearGoals = monthlyGoalsData
        .filter(goal => goal.month.startsWith(yearString))
        .sort((a,b) => a.month.localeCompare(b.month));

    if (yearGoals.length === 0) {
        return { initialDebt: 0, currentDebt: 0, targetDebt: target, progress: 0, amountReduced: 0, amountToReduce: 0, currentMonthLabel: 'N/A' };
    }

    const firstGoal = yearGoals[0];
    const lastGoal = yearGoals[yearGoals.length - 1];

    const initial = firstGoal?.proposedAmount || 0;
    const current = lastGoal?.executedAmount || lastGoal?.proposedAmount || 0;
    const monthLabel = format(parseISO(lastGoal.month + '-01'), 'LLLL', { locale: es });

    const totalToReduce = initial - target;
    const reducedSoFar = initial - current;
    const progressPercentage = totalToReduce > 0 ? (reducedSoFar / totalToReduce) * 100 : 0;

    return {
        initialDebt: initial,
        currentDebt: current,
        targetDebt: target,
        progress: Math.max(0, Math.min(progressPercentage, 100)),
        amountReduced: reducedSoFar,
        amountToReduce: totalToReduce - reducedSoFar,
        currentMonthLabel: monthLabel,
    };
  }, [monthlyGoalsData, annualGoalData, yearString]);

  const isLoading = isLoadingMonthly || isLoadingAnnual;

  if (isLoading) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="h-24 animate-pulse bg-muted rounded-md" />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-destructive" />
            Reducción de Deuda (3+ meses)
        </CardTitle>
        <CardDescription>
            Seguimiento de la meta de reducción de deuda para el año {currentYear}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground capitalize">Deuda a {currentMonthLabel}</span>
                <span className="text-2xl font-bold">{formatCurrency(currentDebt)}</span>
            </div>
            <div className="space-y-2">
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Progress value={progress} className="h-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Reducido: {formatCurrency(amountReduced)}</p>
                        <p>Faltan: {formatCurrency(amountToReduce)}</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="flex justify-between items-baseline text-sm">
                    <span className="text-muted-foreground">Meta Final</span>
                    <span className="font-semibold text-destructive">{formatCurrency(targetDebt)}</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
