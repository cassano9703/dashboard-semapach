"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, getYear, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { TrendingDown } from 'lucide-react';
import { MonthlyDebtChart } from './monthly-debt-chart';


const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function AnnualDebtGoal() {
  const firestore = useFirestore();
  const currentYear = getYear(new Date());

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    const yearStr = currentYear.toString();
    return query(
        collection(firestore, 'monthly_goals'),
        where('month', '>=', `${yearStr}-01`),
        where('month', '<=', `${yearStr}-12`),
        where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore, currentYear]);

  const annualGoalRef = useMemoFirebase(() => {
      if(!firestore) return null;
      return query(
          collection(firestore, 'annual_goals'),
          where('year', '==', currentYear),
          where('goalType', '==', 'debt_3_plus')
      )
  }, [firestore, currentYear]);

  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);
  const { data: annualGoalData, isLoading: isLoadingAnnual } = useCollection(annualGoalRef);

  const {
    initialDebt,
    currentDebt,
    targetDebt,
    progress,
    amountToReduce,
  } = useMemo(() => {
    // Wait for both data sources to be loaded before calculating
    if (!annualGoalData || !monthlyGoalsData) {
        return { initialDebt: 0, currentDebt: 0, targetDebt: 0, progress: 0, amountToReduce: 0 };
    }

    const target = annualGoalData[0]?.amount || 0;
    
    const yearGoals = monthlyGoalsData
        .filter(goal => goal.month.startsWith(currentYear.toString()))
        .sort((a,b) => a.month.localeCompare(b.month));

    if (yearGoals.length === 0) {
        return { initialDebt: 0, currentDebt: 0, targetDebt: target, progress: 0, amountToReduce: 0 };
    }

    const firstGoal = yearGoals[0];
    const lastGoal = yearGoals[yearGoals.length - 1];

    const initial = firstGoal?.proposedAmount || 0;
    const current = lastGoal?.executedAmount || lastGoal?.proposedAmount || 0;
    
    const totalToReduce = initial - target;
    const reducedSoFar = initial - current;

    const progressPercentage = totalToReduce > 0 ? (reducedSoFar / totalToReduce) * 100 : (current <= target ? 100 : 0);

    return {
        initialDebt: initial,
        currentDebt: current,
        targetDebt: target,
        progress: Math.max(0, Math.min(progressPercentage, 100)),
        amountToReduce: Math.max(0, current - target),
    };
  }, [monthlyGoalsData, annualGoalData, currentYear]);

  const isLoading = isLoadingMonthly || isLoadingAnnual;

  if (isLoading) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="h-64 animate-pulse bg-muted rounded-md" />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6" />
            Reducción de Deuda ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-baseline rounded-lg border p-4">
            <span className="text-muted-foreground">Deuda Actual</span>
            <span className="text-2xl font-bold">{formatCurrency(currentDebt)}</span>
        </div>
        
        <div>
            <Progress value={progress} className="h-3 bg-red-200" />
            <div className="flex justify-between items-baseline text-sm mt-2">
                <span className="text-muted-foreground">Falta Reducir <span className="font-semibold text-red-600">{formatCurrency(amountToReduce)}</span></span>
                <span className="text-muted-foreground">Meta de Deuda <span className="font-semibold">{formatCurrency(targetDebt)}</span></span>
            </div>
        </div>

        <div className="pt-4">
            <h4 className="font-semibold">Deuda de 3 a más</h4>
            <p className="text-sm text-muted-foreground">Gráfico de la deuda actual por mes.</p>
            <div className="mt-2">
                <MonthlyDebtChart />
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
