'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCheck, Users, DollarSign } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { RecoveredSummary } from '@/components/dashboard/recovered-summary';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function SuspendidosRecuperadosPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const firestore = useFirestore();

  const servicesRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_services'), orderBy('date', 'desc')) : null),
    [firestore]
  );
  const { data: servicesData, isLoading } = useCollection(servicesRef);

  const { dailyTotal, monthlyTotalCount, monthlyTotalAmount } = useMemo(() => {
    if (!servicesData) {
      return { dailyTotal: 0, monthlyTotalCount: 0, monthlyTotalAmount: 0 };
    }

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

    let daily = 0;
    let monthlyCount = 0;
    let monthlyAmount = 0;

    servicesData.forEach(item => {
      const itemDate = parseISO(item.date + 'T00:00:00');
      
      if (item.date === formattedSelectedDate) {
        daily += item.recoveredCount;
      }

      if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
        monthlyCount += item.recoveredCount;
        monthlyAmount += item.recoveredAmount;
      }
    });

    return { 
      dailyTotal: daily, 
      monthlyTotalCount: monthlyCount, 
      monthlyTotalAmount: monthlyAmount,
    };
  }, [servicesData, selectedDate]);
  


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Reporte de Usuarios Recuperados
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recuperados del Día</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : dailyTotal}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios recuperados en el día seleccionado
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recuperados (Mes)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : monthlyTotalCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de usuarios recuperados en {format(selectedDate, 'LLLL', {locale: es})}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total Recuperado (Mes)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(monthlyTotalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Suma total de los montos recuperados en {format(selectedDate, 'LLLL', {locale: es})}
            </p>
          </CardContent>
        </Card>
      </div>

      <RecoveredComparisonChart selectedDate={selectedDate} onDateChange={setSelectedDate}/>
      
      <RecoveredSummary selectedDate={selectedDate} />
    </div>
  );
}
