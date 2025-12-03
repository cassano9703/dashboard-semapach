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
        <CardTitle>Meta Anual de Recaudación 2025</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Cargando meta anual...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl font-bold tracking-tighter">
                {progressPercentage.toFixed(2)}%
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 w-full bg-gray-200"
              indicatorClassName="bg-blue-600"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
