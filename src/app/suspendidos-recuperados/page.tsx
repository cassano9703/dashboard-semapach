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
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { RecoveredComparisonChart } from '@/components/dashboard/recovered-comparison-chart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

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

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const monthStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');

    return query(
      collection(firestore, 'recovered_services'),
      where('date', '>=', monthStart),
      where('date', '<=', monthEnd)
    );
  }, [firestore, selectedDate]);

  const { data: servicesData, isLoading } = useCollection(servicesQuery);

  const { dailyTotal, monthlyTotal, monthlyAmount, districtTotals } = useMemo(() => {
    if (!servicesData) {
      return { dailyTotal: 0, monthlyTotal: 0, monthlyAmount: 0, districtTotals: new Map() };
    }

    const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');
    
    let dailyTotal = 0;
    let monthlyTotal = 0;
    let monthlyAmount = 0;
    const districtTotals = new Map<string, { count: number; amount: number }>();

    districts.forEach(d => districtTotals.set(d, { count: 0, amount: 0 }));

    servicesData.forEach(service => {
      // Daily total
      if (service.date === selectedDayStr) {
        dailyTotal += service.recoveredCount;
      }
      
      // Monthly totals
      monthlyTotal += service.recoveredCount;
      monthlyAmount += service.recoveredAmount;

      // District totals
      if (districtTotals.has(service.district)) {
        const current = districtTotals.get(service.district)!;
        districtTotals.set(service.district, {
          count: current.count + service.recoveredCount,
          amount: current.amount + service.recoveredAmount,
        });
      }
    });

    return { dailyTotal, monthlyTotal, monthlyAmount, districtTotals };
  }, [servicesData, selectedDate]);

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
            <div className="text-2xl font-bold">{isLoading ? '...' : monthlyTotal}</div>
            <p className="text-xs text-muted-foreground">
              Total de usuarios recuperados en el mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total Recuperado (Mes)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(monthlyAmount)}</div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead className="w-[200px] text-right">Recuperados (Cantidad)</TableHead>
                  <TableHead className="w-[200px] text-right">Monto (S/)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">Cargando datos...</TableCell>
                  </TableRow>
                ) : districts.map((district) => (
                  <TableRow key={district}>
                    <TableCell className="font-medium">{district}</TableCell>
                    <TableCell className="text-right">{districtTotals.get(district)?.count || 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(districtTotals.get(district)?.amount || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
