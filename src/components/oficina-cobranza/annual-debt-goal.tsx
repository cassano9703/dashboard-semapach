'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { Target, TrendingDown, Flag } from 'lucide-react';

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

  const annualGoalRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'annual_goals'),
        where('year', '==', parseInt(currentYear, 10)),
        where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore, currentYear]);

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'monthly_goals'),
        where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore]);

  const { data: annualGoalData, isLoading: isLoadingAnnual } = useCollection(annualGoalRef);
  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const {
    initialDebt,
    currentDebt,
    targetDebt,
    reductionNeeded,
    reductionAchieved,
    progress
  } = useMemo(() => {
    const target = annualGoalData?.[0]?.amount || 0; // Meta final: 9,300,000

    if (!monthlyGoalsData) {
        return { initialDebt: 0, currentDebt: 0, targetDebt: target, reductionNeeded: 0, reductionAchieved: 0, progress: 0 };
    }

    const yearData = monthlyGoalsData
        .filter(mg => mg.month.startsWith(currentYear))
        .sort((a, b) => a.month.localeCompare(b.month));
    
    if (yearData.length === 0) {
        return { initialDebt: 0, currentDebt: 0, targetDebt: target, reductionNeeded: 0, reductionAchieved: 0, progress: 0 };
    }

    const octoberData = yearData.find(d => d.month === `${currentYear}-10`);
    const initial = octoberData?.proposedAmount || 0; // Deuda de Octubre: 10,541,196

    const latestData = yearData[yearData.length - 1];
    const current = latestData?.executedAmount ?? latestData?.proposedAmount ?? 0;

    const totalToReduce = initial - target;
    const hasBeenReduced = initial - current;
    
    const progressPercentage = totalToReduce > 0 ? Math.min((hasBeenReduced / totalToReduce) * 100, 100) : 0;
    
    const remainingToReduce = current - target;

    return {
        initialDebt: initial,
        currentDebt: current,
        targetDebt: target,
        reductionNeeded: totalToReduce,
        reductionAchieved: remainingToReduce > 0 ? remainingToReduce : 0,
        progress: progressPercentage
    };
  }, [annualGoalData, monthlyGoalsData, currentYear]);

  const isLoading = isLoadingAnnual || isLoadingMonthly;

  if (isLoading) {
      return (
          <Card className="h-full">
              <CardContent className="pt-6 h-full flex items-center justify-center">
                  <div className="h-24 animate-pulse bg-muted rounded-md w-full" />
              </CardContent>
          </Card>
      );
  }
  
  if (targetDebt === 0) {
      return null;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Reducción de Deuda ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <div className='flex items-center gap-2'>
            <TrendingDown className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-muted-foreground">Meta de Deuda</span>
          </div>
          <span className="text-lg font-bold">{formatCurrency(targetDebt)}</span>
        </div>
        
        <div 
          className="relative w-full h-2 bg-muted rounded-full"
          title={`Progreso: ${progress.toFixed(2)}%`}
        >
          <div 
            className="absolute h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Falta Reducir</span>
                <span className="font-semibold text-red-600">{formatCurrency(reductionAchieved)}</span>
            </div>
            <div className="flex items-center gap-2">
                 <span className="text-muted-foreground">Deuda Octubre</span>
                 <span className="font-semibold">{formatCurrency(initialDebt)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
