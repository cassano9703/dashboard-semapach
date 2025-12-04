"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return 'S/ 0';
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export function MonthlyCollectionGoal() {
  const firestore = useFirestore();
  const currentYear = new Date().getFullYear();

  const goalsRef = useMemoFirebase(
    () => (firestore ? query(
        collection(firestore, 'monthly_goals'),
        where('month', '>=', `${currentYear}-01`),
        where('month', '<=', `${currentYear}-12`),
        orderBy('month')
    ) : null),
    [firestore, currentYear]
  );
  const { data: goalsData, isLoading } = useCollection(goalsRef);

  const monthlyGoals = useMemo(() => {
    if (!goalsData) return [];
    
    return goalsData
      .filter(goal => 
        goal.goalType === 'collection' && 
        parseInt(goal.month.split('-')[1]) >= 8
      )
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(goal => {
        const progress = goal.proposedAmount > 0 && goal.executedAmount
          ? (goal.executedAmount / goal.proposedAmount) * 100
          : 0;

        return {
          ...goal,
          monthName: format(parseISO(`${goal.month}-01T00:00:00`), 'LLLL', { locale: es }),
          progress: Math.min(progress, 100),
        };
    });
  }, [goalsData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta de Recaudación por mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="hidden md:grid grid-cols-4 gap-4 px-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">Mes</div>
            <div className="col-span-1 text-center">Meta Propuesta</div>
            <div className="col-span-1 text-center">Meta Ejecutada</div>
            <div className="col-span-1">Avance</div>
          </div>
          
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Cargando datos...</div>
          ) : monthlyGoals.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No hay metas de recaudación para mostrar.</div>
          ) : (
            monthlyGoals.map(goal => (
              <div key={goal.id} className="grid grid-cols-2 md:grid-cols-4 items-center gap-4 border-t md:border-none pt-4 md:pt-0">
                <div className="col-span-2 md:col-span-1 font-medium capitalize">{goal.monthName}</div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between col-span-1">
                    <span className="text-sm md:hidden text-muted-foreground">Meta Propuesta:</span>
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md px-3 py-1 text-sm font-semibold w-full text-center">
                        {formatCurrency(goal.proposedAmount)}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between col-span-1">
                    <span className="text-sm md:hidden text-muted-foreground">Meta Ejecutada:</span>
                    <div className="border border-blue-400 dark:border-blue-600 rounded-md px-3 py-1 text-sm font-semibold w-full text-center">
                        {formatCurrency(goal.executedAmount)}
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                  <Progress
                    value={goal.progress}
                    indicatorClassName="bg-gradient-to-r from-cyan-400 to-blue-500"
                    className="h-2"
                  />
                  <span className="text-sm font-semibold w-10 text-right">{goal.progress.toFixed(0)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
