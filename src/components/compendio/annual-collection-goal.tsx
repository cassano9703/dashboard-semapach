"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return 'S/ 0';
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function AnnualCollectionGoal() {
  const firestore = useFirestore();
  const annualGoal = 31867690;
  const currentYear = 2025;
  const yearStr = currentYear.toString();

  const goalsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'monthly_goals')) : null),
    [firestore]
  );
  const { data: goalsData, isLoading } = useCollection(goalsRef);

  const totalExecuted = useMemo(() => {
    if (!goalsData) return 0;
    return goalsData
        .filter(goal => goal.month.startsWith(yearStr) && goal.goalType === 'collection')
        .reduce((sum, goal) => sum + (goal.executedAmount || 0), 0);
  }, [goalsData, yearStr]);

  const progressPercentage = useMemo(() => {
    if (annualGoal === 0) return 0;
    return (totalExecuted / annualGoal) * 100;
  }, [totalExecuted, annualGoal]);

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
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="text-lg font-medium text-muted-foreground">Avance Total</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalExecuted)}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-4" />
            <div className="flex justify-between items-baseline">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{progressPercentage.toFixed(2)}%</span> completado
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Meta: <span className="font-bold text-foreground">{formatCurrency(annualGoal)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
