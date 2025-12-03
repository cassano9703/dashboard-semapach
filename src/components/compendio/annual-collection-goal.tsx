"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';

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
      return annualGoalsData?.[0]?.amount || 0;
  }, [annualGoalsData]);

  const totalExecuted = useMemo(() => {
    if (!monthlyGoalsData) return 0;
    return monthlyGoalsData
        .filter(goal => goal.goalType === 'collection')
        .reduce((sum, goal) => sum + (goal.executedAmount || 0), 0);
  }, [monthlyGoalsData]);
  
  const progressPercentage = useMemo(() => {
    if (annualGoal === 0) return 0;
    return (totalExecuted / annualGoal) * 100;
  }, [totalExecuted, annualGoal]);
  
  const missingAmount = useMemo(() => {
    const missing = annualGoal - totalExecuted;
    return missing > 0 ? missing : 0;
  }, [annualGoal, totalExecuted]);

  const isLoading = isLoadingMonthly || isLoadingAnnual;
  const progressColorClass = 'from-cyan-400 to-blue-500';

  return (
    <Card className="border-2 border-blue-900/20 shadow-lg">
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Cargando meta anual...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Avance Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(totalExecuted)}
              </span>
            </div>
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={cn("h-2.5 rounded-full bg-gradient-to-r", progressColorClass)}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Faltan {formatCurrency(missingAmount)} para la meta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {progressPercentage.toFixed(2)}% completado
              </span>
              <span className="text-muted-foreground">
                Meta: <span className="font-semibold text-foreground">{formatCurrency(annualGoal)}</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
