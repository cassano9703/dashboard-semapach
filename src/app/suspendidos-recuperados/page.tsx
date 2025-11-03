'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, DollarSign, UserCheck, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, isEqual } from 'date-fns';
import { es } from 'date-fns/locale';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

const districts = [
  'Chincha Alta',
  'Grocio Prado',
  'Pueblo Nuevo',
  'Alto Laran',
  'Sunampe',
  'Tambo de Mora',
  'Chincha baja',
];

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

  const { dailyTotal, monthlyTotalCount, monthlyTotalAmount, districtTotals } = useMemo(() => {
    if (!servicesData) {
      return { dailyTotal: 0, monthlyTotalCount: 0, monthlyTotalAmount: 0, districtTotals: new Map() };
    }

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

    let daily = 0;
    let monthlyCount = 0;
    let monthlyAmount = 0;
    const totals = new Map<string, { recoveredCount: number; recoveredAmount: number }>();

    servicesData.forEach(item => {
      const itemDate = parseISO(item.date + 'T00:00:00');
      
      // Daily total
      if (item.date === formattedSelectedDate) {
        daily += item.recoveredCount;
      }

      // Monthly totals
      if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
        monthlyCount += item.recoveredCount;
        monthlyAmount += item.recoveredAmount;

        const current = totals.get(item.district) || { recoveredCount: 0, recoveredAmount: 0 };
        current.recoveredCount += item.recoveredCount;
        current.recoveredAmount += item.recoveredAmount;
        totals.set(item.district, current);
      }
    });

    return { 
      dailyTotal: daily, 
      monthlyTotalCount: monthlyCount, 
      monthlyTotalAmount: monthlyAmount,
      districtTotals: totals,
    };
  }, [servicesData, selectedDate]);
  
  const fromDate = new Date(2023, 8, 1);


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Reporte de Suspendidos Recuperados
      </h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recuperados (Mes)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : monthlyTotalCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de usuarios recuperados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total Recuperado (Mes)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(monthlyTotalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Suma total de los montos recuperados en el mes
            </p>
          </CardContent>
        </Card>
      </div>

      <RecoveredComparisonChart selectedDate={selectedDate} />
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Resumen de Servicios Recuperados</CardTitle>
              <CardDescription>
                Visualización de la cantidad de servicios recuperados y el monto total por distrito. La gestión de estos datos se realiza en el panel de Administración.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-full sm:w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={{ before: fromDate }}
                  fromMonth={fromDate}
                  initialFocus
                  locale={es}
                  defaultMonth={selectedDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
             {isLoading ? (
              <div className="text-center p-8">Cargando datos...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="w-[200px] text-right">Recuperados (Cantidad)</TableHead>
                    <TableHead className="w-[200px] text-right">Monto (S/)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {districts.map((district) => {
                    const data = districtTotals.get(district) || { recoveredCount: 0, recoveredAmount: 0 };
                    return (
                      <TableRow key={district}>
                        <TableCell className="font-medium">{district}</TableCell>
                        <TableCell className="text-right">{data.recoveredCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.recoveredAmount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
