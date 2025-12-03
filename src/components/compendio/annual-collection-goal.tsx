"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  if (value === undefined) return 'S/ 0';
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function AnnualCollectionGoal() {
  const firestore = useFirestore();
  const currentYear = 2025;
  const yearStr = currentYear.toString();

  const monthlyGoalsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'monthly_goals'), where('goalType', '==', 'collection')) : null),
    [firestore]
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
        .filter(goal => goal.month.startsWith(yearStr))
        .reduce((sum, goal) => sum + (goal.executedAmount || 0), 0);
  }, [monthlyGoalsData, yearStr]);
  
  const remainingAmount = useMemo(() => {
    return annualGoal > totalExecuted ? annualGoal - totalExecuted : 0;
  }, [annualGoal, totalExecuted]);

  const progressPercentage = useMemo(() => {
    if (annualGoal === 0) return 0;
    return (totalExecuted / annualGoal) * 100;
  }, [totalExecuted, annualGoal]);

  const getProgressColor = (percentage: number) => {
    if (percentage < 40) {
      return "from-red-500 to-yellow-500";
    } else if (percentage < 80) {
      return "from-yellow-500 to-green-500";
    } else {
      return "from-green-500 to-cyan-500";
    }
  };
  
  const isLoading = isLoadingMonthly || isLoadingAnnual;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta Anual de Recaudación {currentYear}</CardTitle>
        <CardDescription>
          Seguimiento del progreso hacia la meta de recaudación anual.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  <div className="w-full bg-secondary rounded-full h-2.5 cursor-pointer">
                    <div
                      className={cn("bg-gradient-to-r h-2.5 rounded-full", getProgressColor(progressPercentage))}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Falta {formatCurrency(remainingAmount)} para la meta.</p>
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
