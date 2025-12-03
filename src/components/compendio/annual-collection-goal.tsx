"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Progress } from '../ui/progress';

const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'S/ 0';
    return `S/ ${value.toLocaleString('es-PE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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
  
  const isLoading = isLoadingMonthly || isLoadingAnnual;

  return (
    <Card className="border-2 border-blue-900/20 shadow-lg">
      <CardHeader>
        <CardTitle>Avance Total</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Cargando meta anual...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Progress
              value={progressPercentage}
              variant="striped"
              className="h-4"
              indicatorClassName="bg-gradient-to-r from-blue-400 to-cyan-400"
            />
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">
                {progressPercentage.toFixed(2)}% Completado
              </span>
              <span className="font-bold">
                 {formatCurrency(totalExecuted)} / <span className="text-muted-foreground">{formatCurrency(annualGoal)}</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
