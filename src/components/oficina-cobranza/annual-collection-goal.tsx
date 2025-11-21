'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AnnualCollectionGoalProps {
  selectedDate: Date;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function AnnualCollectionGoal({ selectedDate }: AnnualCollectionGoalProps) {
  const firestore = useFirestore();
  const currentYear = format(selectedDate, 'yyyy');

  const annualGoalRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'annual_goals'),
        where('year', '==', parseInt(currentYear, 10)),
        where('goalType', '==', 'collection')
    );
  }, [firestore, currentYear]);

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'monthly_goals'),
        where('goalType', '==', 'collection')
    );
  }, [firestore]);

  const { data: annualGoalData, isLoading: isLoadingAnnual } = useCollection(annualGoalRef);
  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const { annualGoal, accumulated, progress, missingAmount } = useMemo(() => {
    const goal = annualGoalData?.[0]?.amount || 0;

    const totalAccumulated = monthlyGoalsData
        ? monthlyGoalsData
            .filter(mg => mg.month.startsWith(currentYear) && mg.executedAmount)
            .reduce((sum, mg) => sum + mg.executedAmount, 0)
        : 0;
    
    const progressPercentage = goal > 0 ? Math.min((totalAccumulated / goal) * 100, 100) : 0;
    const amountMissing = goal - totalAccumulated;

    return {
        annualGoal: goal,
        accumulated: totalAccumulated,
        progress: progressPercentage,
        missingAmount: amountMissing,
    };
  }, [annualGoalData, monthlyGoalsData, currentYear]);

  const isLoading = isLoadingAnnual || isLoadingMonthly;

  if (isLoading) {
      return (
          <Card>
              <CardContent className="pt-6">
                  <div className="h-24 animate-pulse bg-muted rounded-md" />
              </CardContent>
          </Card>
      );
  }
  
  if (annualGoal === 0) {
      return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta Anual de Recaudación ({currentYear})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-muted-foreground">Avance Total</span>
            <span className="font-bold">{formatCurrency(accumulated)}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
                <Progress value={progress} className="h-3" />
            </TooltipTrigger>
            <TooltipContent>
                <p>Faltan {formatCurrency(missingAmount)} para la meta anual</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Meta Anual</span>
            <span className="font-semibold">{formatCurrency(annualGoal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
