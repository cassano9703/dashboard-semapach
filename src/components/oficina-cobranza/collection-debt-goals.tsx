'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';


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
        const monthIndex = getMonth(parseISO(goal.month + '-01T12:00:00Z'));
        collGoals[monthIndex] = goal;
      });
    }
    return collGoals.slice(7, 10);
  }, [goalsData, selectedDate]);

  const renderGoalRow = (title: string, proposed: number | undefined, executed: number | undefined) => {
    const hasData = proposed !== undefined && proposed > 0;
    const hasExecutedData = executed !== undefined;
    
    let progress = 0;
    let missingAmount = 0;
    if (hasData && hasExecutedData) {
        progress = Math.min((executed / proposed) * 100, 100);
        missingAmount = proposed - executed;
    }

    const goalMet = hasData && hasExecutedData && executed >= proposed;

    return (
      <div className="grid grid-cols-4 items-center gap-4 text-sm" key={title}>
        <div className="col-span-1 font-medium capitalize">{title}</div>
        <div className="col-span-1 rounded-md border bg-sky-100 border-sky-200 p-2 text-right text-sky-900">
            {hasData ? formatCurrency(proposed) : '-'}
        </div>
        <div className="col-span-1 rounded-md border border-sky-500 p-2 text-right">
            {hasExecutedData ? formatCurrency(executed) : '-'}
        </div>
        <div className="col-span-1 flex items-center gap-2">
            {hasData && hasExecutedData ? (
                goalMet ? (
                     <div className="flex items-center gap-2 w-full text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Cumplido</span>
                    </div>
                ) : (
                  <div className="flex items-center w-full gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative w-full">
                            <Progress value={progress} className="h-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Faltan {formatCurrency(missingAmount)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="font-semibold text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                  </div>
                )
            ) : (
                <span className="w-full text-center">-</span>
            )}
        </div>
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
              <div className="col-span-1 text-center">Avance</div>
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
