'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

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
    return dbtGoals.slice(7, 10);
  }, [goalsData, selectedDate]);

  const renderGoalRow = (title: string, proposed: number | undefined, executed: number | undefined) => {
    const hasData = proposed !== undefined;
    const hasExecutedData = executed !== undefined;
    
    let statusElement: React.ReactNode;

    if (hasData) {
      if (!hasExecutedData) {
        statusElement = <Clock className="h-5 w-5 text-yellow-500" />;
      } else if (executed <= proposed) {
        statusElement = <CheckCircle className="h-5 w-5 text-green-600" />;
      } else {
        statusElement = <XCircle className="h-5 w-5 text-red-600" />;
      }
    } else {
      statusElement = <span>-</span>;
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
        <div className={`col-span-1 flex justify-center items-center`}>{statusElement}</div>
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
              <div className="col-span-1 text-center">Estado</div>
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
