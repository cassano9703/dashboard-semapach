'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface CollectionDebtGoalsProps {
  selectedDate: Date;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function CollectionDebtGoals({ selectedDate }: CollectionDebtGoalsProps) {
  const firestore = useFirestore();

  const goalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // Simplified query to fetch all goals
    return query(collection(firestore, 'monthly_goals'));
  }, [firestore]);

  const { data: goalsData, isLoading } = useCollection(goalsRef);


  const collectionGoals = useMemo(() => {
    const collGoals: any[] = Array(12).fill(null);
    const currentYear = format(selectedDate, 'yyyy');

    if (goalsData) {
      goalsData
      .filter(goal => goal.month.startsWith(currentYear) && goal.goalType === 'collection')
      .forEach(goal => {
        // Use parseISO because the month string is in yyyy-MM format
        const monthIndex = getMonth(parseISO(goal.month + '-01T12:00:00Z'));
        collGoals[monthIndex] = goal;
      });
    }
    // Filter for August (7), September (8), October (9)
    return collGoals.slice(7, 10);
  }, [goalsData, selectedDate]);

  const renderGoalRow = (title: string, proposed: number | undefined, executed: number | undefined) => {
    const hasData = proposed !== undefined && proposed > 0;
    const hasExecutedData = executed !== undefined && executed > 0;

    let status = 'sin datos';
    let statusColor = 'text-muted-foreground';

    if (hasData) {
      if (!hasExecutedData) {
        status = 'pendiente';
        statusColor = 'text-yellow-600';
      } else if (executed >= proposed) {
        status = 'cumplió';
        statusColor = 'text-green-600';
      } else {
        status = 'no cumplió';
        statusColor = 'text-red-600';
      }
    }

    return (
      <div className="grid grid-cols-4 items-center gap-4 text-sm" key={title}>
        <div className="col-span-1 font-medium capitalize">{title}</div>
        <div className="col-span-1 rounded-md border p-2 text-right bg-gray-50 dark:bg-gray-800">
            {hasData ? formatCurrency(proposed) : '-'}
        </div>
        <div className="col-span-1 rounded-md border p-2 text-right bg-gray-50 dark:bg-gray-800">
            {hasExecutedData ? formatCurrency(executed) : '-'}
        </div>
        <div className={`col-span-1 text-center font-semibold ${statusColor}`}>{status}</div>
      </div>
    );
  };
  
  if (isLoading) {
    return <Card className="h-full flex items-center justify-center"><p>Cargando metas...</p></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta de Recaudación por mes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-4 text-xs font-bold text-muted-foreground">
              <div className="col-span-1">Mes</div>
              <div className="col-span-1 text-right">Meta Propuesta</div>
              <div className="col-span-1 text-right">Meta Ejecutada</div>
              <div className="col-span-1 text-center">Estado</div>
          </div>
        {collectionGoals.map((goal, index) =>
          renderGoalRow(
            format(new Date(2025, index + 7, 1), 'LLLL', { locale: es }),
            goal?.proposedAmount,
            goal?.executedAmount
          )
        )}
      </CardContent>
    </Card>
  );
}
