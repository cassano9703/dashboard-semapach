"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Progress } from '../ui/progress';

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
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-muted-foreground">Cargando meta anual...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="text-muted-foreground">Avance Total</span>
            <Progress
              value={progressPercentage}
              className="h-2"
              indicatorClassName="bg-gray-400"
            />
            <div className="text-sm">
              <span className="text-muted-foreground">
                {progressPercentage.toFixed(2)}% completado
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
