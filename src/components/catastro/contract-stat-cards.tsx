"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';
import { format, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

interface ContractStatCardsProps {
  selectedDate: Date;
}

export function ContractStatCards({ selectedDate }: ContractStatCardsProps) {
  const firestore = useFirestore();

  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'closed_contracts')) : null),
    [firestore]
  );
  const { data, isLoading } = useCollection(dataRef);

  const stats = useMemo(() => {
    if (!data) {
      return { monthlyTotal: 0, yearlyTotal: 0 };
    }

    const selectedMonthStr = format(selectedDate, 'yyyy-MM');
    const yearStart = startOfYear(selectedDate);
    const yearEnd = endOfYear(selectedDate);

    let monthly = 0;
    let yearly = 0;

    data.forEach(item => {
      // Sum for selected month
      if (item.month === selectedMonthStr) {
        monthly += item.quantity;
      }
      
      // Sum for selected year
      const itemDate = parseISO(`${item.month}-01`);
      if (isWithinInterval(itemDate, { start: yearStart, end: yearEnd })) {
        yearly += item.quantity;
      }
    });

    return { monthlyTotal: monthly, yearlyTotal: yearly };
  }, [data, selectedDate]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-l-4 border-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total del Mes</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthlyTotal}</div>
          <p className="text-xs text-muted-foreground">
            Contratos cerrados en {format(selectedDate, 'LLLL yyyy', { locale: es })}
          </p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Acumulado Anual</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.yearlyTotal}</div>
          <p className="text-xs text-muted-foreground">
            Total de contratos cerrados en el año {format(selectedDate, 'yyyy')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
