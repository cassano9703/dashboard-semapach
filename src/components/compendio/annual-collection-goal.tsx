"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return 'S/ 0.00';
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function AnnualCollectionGoal() {
  const firestore = useFirestore();
  const currentYear = 2025;

  const [animatedProgress, setAnimatedProgress] = useState(0);

  const monthlyGoalsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'monthly_goals'), where('month', '>=', `${currentYear}-01`), where('month', '<=', `${currentYear}-12`)) : null),
    [firestore, currentYear]
  );
  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const annualGoalsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'annual_goals'), where('year', '==', currentYear), where('goalType', '==', 'collection')) : null),
    [firestore, currentYear]
  );
  const { data: annualGoalsData, isLoading: isLoadingAnnual } = useCollection(annualGoalsRef);
  
  const annualGoal = useMemo(() => {
      if (!annualGoalsData || annualGoalsData.length === 0) return 0;
      return annualGoalsData[0].amount || 0;
  }, [annualGoalsData]);

  const totalExecuted = useMemo(() => {
    if (!monthlyGoalsData) return 0;
    return monthlyGoalsData
        .filter(goal => goal.goalType === 'collection' && goal.executedAmount)
        .reduce((sum, goal) => sum + (goal.executedAmount || 0), 0);
  }, [monthlyGoalsData]);
  
  const progressPercentage = useMemo(() => {
    if (annualGoal === 0) return 0;
    return (totalExecuted / annualGoal) * 100;
  }, [totalExecuted, annualGoal]);
  
  useEffect(() => {
    if (!isLoadingMonthly && !isLoadingAnnual) {
      const animation = requestAnimationFrame(() => {
        setAnimatedProgress(progressPercentage);
      });
      return () => cancelAnimationFrame(animation);
    }
  }, [progressPercentage, isLoadingMonthly, isLoadingAnnual]);
  
  const isLoading = isLoadingMonthly || isLoadingAnnual;

  const remainingAmount = useMemo(() => {
    const remaining = annualGoal - totalExecuted;
    return remaining > 0 ? remaining : 0;
  }, [annualGoal, totalExecuted]);

  return (
    <Card className="border-2 border-blue-900/20 shadow-lg">
      <CardHeader className='p-4 text-center'>
        <div className="text-lg font-semibold">Avance Total Recaudación Anual</div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Cargando meta anual...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-bold tracking-tighter">
                {animatedProgress.toFixed(2)}%
            </div>
            <div className="w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full cursor-pointer">
                    <Progress value={animatedProgress} className="h-4" variant="striped" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Faltan {formatCurrency(remainingAmount)} para llegar a la meta.</p>
                </TooltipContent>
              </Tooltip>
              <div className="mt-2 flex justify-between items-baseline px-1">
                <span className="text-sm font-semibold text-muted-foreground">{formatCurrency(totalExecuted)}</span>
                <span className="text-lg font-extrabold text-foreground" style={{textShadow: '0 0 8px hsla(var(--primary), 0.7)'}}>{formatCurrency(annualGoal)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
