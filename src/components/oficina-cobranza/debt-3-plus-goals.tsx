'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';

interface Debt3PlusGoalsProps {
  selectedDate: Date;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function Debt3PlusGoals({ selectedDate }: Debt3PlusGoalsProps) {
  const firestore = useFirestore();

  const goalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'monthly_goals'));
  }, [firestore]);

  const { data: goalsData, isLoading } = useCollection(goalsRef);

  const debtGoals = useMemo(() => {
    const dbtGoals: any[] = Array(12).fill(null);
    const currentYear = format(selectedDate, 'yyyy');
    
    if (goalsData) {
       goalsData
        .filter(goal => goal.month.startsWith(currentYear) && goal.goalType === 'debt_3_plus')
        .forEach(goal => {
            const monthIndex = getMonth(parseISO(goal.month + '-01T12:00:00Z'));
            dbtGoals[monthIndex] = goal;
        });
    }
    return dbtGoals.slice(7, 11);
  }, [goalsData, selectedDate]);

  const renderGoalRow = (title: string, initialAmount: number | undefined, currentAmount: number | undefined) => {
    const hasData = initialAmount !== undefined && initialAmount > 0;
    const hasCurrentData = currentAmount !== undefined;
    const goalMet = hasData && hasCurrentData && currentAmount <= 0;

    let progress = 0;
    let reductionAmount = 0;
    if(hasData && hasCurrentData){
        const reduction = initialAmount - currentAmount;
        reductionAmount = reduction;
        if(reduction > 0) {
            progress = Math.min((reduction / initialAmount) * 100, 100);
        }
    }


    return (
      <div className="grid grid-cols-4 items-center gap-4 text-sm" key={title}>
        <div className="col-span-1 font-medium capitalize">{title}</div>
        <div className="col-span-1 rounded-md border bg-teal-100 border-teal-200 p-2 text-right text-teal-900">
            {hasData ? formatCurrency(initialAmount) : '-'}
        </div>
        <div className="col-span-1 rounded-md border bg-amber-100 border-amber-200 p-2 text-right text-amber-900">
            {hasCurrentData ? formatCurrency(currentAmount) : '-'}
        </div>
        <div className="col-span-1 flex items-center gap-2">
           {hasData && hasCurrentData ? (
                goalMet ? (
                     <div className="flex items-center gap-2 w-full text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Saldado</span>
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
                          <p>Reducido en {formatCurrency(reductionAmount)} ({progress.toFixed(0)}%)</p>
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
    return <Card className="h-full flex items-center justify-center"><p>Cargando metas de deuda...</p></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deuda de 3 a mas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
           <div className="grid grid-cols-4 gap-4 text-xs font-bold text-muted-foreground">
              <div className="col-span-1">Mes</div>
              <div className="col-span-1 text-right">Monto Inicial</div>
              <div className="col-span-1 text-right">Monto Actual</div>
              <div className="col-span-1 text-center">Reducción</div>
          </div>
        {debtGoals.map((goal, index) =>
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
