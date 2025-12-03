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
import { collection, query, where } from 'firebase/firestore';

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
    () => (firestore ? query(collection(firestore, 'monthly_goals')) : null),
    [firestore]
  );
  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const annualGoalsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'annual_goals'), where('year', '==', currentYear), where('goalType', '==', 'collection')) : null),
    [firestore, currentYear]
  );
  const { data: annualGoalsData, isLoading: isLoadingAnnual } = useCollection(annualGoalsRef);
  
  const annualGoal = useMemo(() => {
      return annualGoalsData?.[0]?.amount || 31867690;
  }, [annualGoalsData]);

  const totalExecuted = useMemo(() => {
    if (!monthlyGoalsData) return 0;
    return monthlyGoalsData
        .filter(goal => goal.month.startsWith(yearStr) && goal.goalType === 'collection')
        .reduce((sum, goal) => sum + (goal.executedAmount || 0), 0);
  }, [monthlyGoalsData, yearStr]);

  const progressPercentage = useMemo(() => {
    if (annualGoal === 0) return 0;
    return (totalExecuted / annualGoal) * 100;
  }, [totalExecuted, annualGoal]);
  
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
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
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
