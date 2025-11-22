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
    totalReductionNeeded,
    reductionAchieved,
    progress
  } = useMemo(() => {
    const target = annualGoalData?.[0]?.amount || 0;

    if (!monthlyGoalsData) {
        return { initialDebt: 0, currentDebt: 0, targetDebt: target, totalReductionNeeded: 0, reductionAchieved: 0, progress: 0 };
    }

    const yearData = monthlyGoalsData
        .filter(mg => mg.month.startsWith(currentYear) && mg.proposedAmount)
        .sort((a, b) => a.month.localeCompare(b.month));
    
    if (yearData.length === 0) {
        return { initialDebt: 0, currentDebt: 0, targetDebt: target, totalReductionNeeded: 0, reductionAchieved: 0, progress: 0 };
    }

    const initial = yearData[0].proposedAmount;
    const current = yearData[yearData.length - 1].executedAmount ?? yearData[yearData.length - 1].proposedAmount;
    
    const needed = initial - target;
    const achieved = initial - current;
    
    const progressPercentage = needed > 0 ? Math.min((achieved / needed) * 100, 100) : 0;

    return {
        initialDebt: initial,
        currentDebt: current,
        targetDebt: target,
        totalReductionNeeded: needed,
        reductionAchieved: achieved,
        progress: progressPercentage
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
  
  if (targetDebt === 0) {
      return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Meta Anual de Reducción de Deuda ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <div className='flex items-center gap-2'>
            <TrendingDown className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-muted-foreground">Deuda Actual</span>
          </div>
          <span className="text-lg font-bold">{formatCurrency(currentDebt)}</span>
        </div>
        
        <div 
          className="relative w-full h-2 bg-muted rounded-full"
          title={`Deuda Inicial: ${formatCurrency(initialDebt)}`}
        >
          <div 
            className="absolute h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Reducción Conseguida</span>
                <span className="font-semibold text-green-600">{formatCurrency(reductionAchieved)}</span>
            </div>
            <div className="flex items-center gap-2">
                 <span className="text-muted-foreground">Meta de Deuda</span>
                 <span className="font-semibold">{formatCurrency(targetDebt)}</span>
            </div>
        </div>

         <div className="text-center text-xs text-muted-foreground pt-2">
            Se necesita reducir la deuda en <span className="font-bold">{formatCurrency(totalReductionNeeded)}</span> para alcanzar la meta de <span className="font-bold">{formatCurrency(targetDebt)}</span>.
        </div>
      </CardContent>
    </Card>
  );
}
