'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';

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
    const currentYear = format(selectedDate, 'yyyy');
    return query(
      collection(firestore, 'monthly_goals'),
      where('month', '>=', `${currentYear}-01`),
      where('month', '<=', `${currentYear}-12`),
      where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore, selectedDate]);

  const { data: goalsData, isLoading } = useCollection(goalsRef);

  const debtGoals = useMemo(() => {
    const dbtGoals: any[] = Array(12).fill(null);
    
    if (goalsData) {
      goalsData.forEach(goal => {
        const monthIndex = getMonth(new Date(goal.month + '-02'));
        dbtGoals[monthIndex] = goal;
      });
    }
    // Filter for August (7), September (8), October (9)
    return dbtGoals.slice(7, 10);
  }, [goalsData]);

  const renderGoalRow = (title: string, proposed: number | undefined, executed: number | undefined) => {
    const hasData = proposed !== undefined && executed !== undefined;
    let status = 'sin datos';
    let statusColor = 'text-muted-foreground';

    if (hasData) {
      if (executed <= proposed) {
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
            {hasData ? formatCurrency(executed) : '-'}
        </div>
        <div className={`col-span-1 text-center font-semibold ${statusColor}`}>{status}</div>
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
            format(new Date(2024, index + 7, 1), 'LLLL', { locale: es }),
            goal?.proposedAmount,
            goal?.executedAmount
          )
        )}
      </CardContent>
    </Card>
  );
}
