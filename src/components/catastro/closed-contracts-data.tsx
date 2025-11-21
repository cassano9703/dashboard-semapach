"use client";

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
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function ClosedContractsData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const firestore = useFirestore();

  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'closed_contracts'), orderBy('month', 'asc')) : null),
    [firestore]
  );
  const { data, isLoading } = useCollection(dataRef);

  const tableData = useMemo(() => {
    if (!data) return [];

    const selectedMonthStr = format(selectedDate, 'yyyy-MM');
    
    return data
      .filter(item => item.month === selectedMonthStr && item.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .map((item, index) => ({
        ...item,
        item: index + 1,
        name: item.district,
        Cantidad: item.quantity,
      }));

  }, [data, selectedDate]);
  
  const yearlyChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
  
    const yearStart = startOfYear(selectedDate);
    const monthsInYear = eachMonthOfInterval({
      start: yearStart,
      end: new Date(), 
    });
  
    let accumulatedQuantity = 0;
  
    return monthsInYear.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const recordsForMonth = data.filter(item => item.month === monthStr);
      const monthlyQuantity = recordsForMonth.reduce((sum, item) => sum + item.quantity, 0);
  
      accumulatedQuantity += monthlyQuantity;
  
      return {
        name: format(month, 'MMM', { locale: es }),
        'Cantidad Mensual': monthlyQuantity,
        'Acumulado Anual': accumulatedQuantity,
      };
    }).filter(item => item['Cantidad Mensual'] > 0 || item['Acumulado Anual'] > 0);
  }, [data, selectedDate]);


  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full sm:w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={{ after: new Date() }}
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
                <div className="relative max-h-96 overflow-y-auto">
                    {isLoading ? (
                    <div className="text-center p-8">Cargando datos...</div>
                    ) : tableData.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground">No hay contratos cerrados para el mes seleccionado.</div>
                    ) : (
                    <Table>
                        <TableHeader className="sticky top-0 bg-table-header text-table-header-foreground z-10">
                        <TableRow>
                            <TableHead className="w-[80px]">Ítem</TableHead>
                            <TableHead>Distrito</TableHead>
                            <TableHead className="w-[150px] text-right">Cantidad</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {tableData.map((item) => (
                            <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.item}</TableCell>
                            <TableCell>{item.district}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-8">
          <CardHeader>
              <CardTitle>Evolución Anual de Contratos Cerrados</CardTitle>
              <CardDescription>
                  Comparativo mensual y acumulado del año.
              </CardDescription>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">Cargando datos del gráfico...</div>
              ) : yearlyChartData.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar en el gráfico.</div>
              ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={yearlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ fontSize: '12px' }} />
                        <Legend />
                        <Bar dataKey="Cantidad Mensual" barSize={20} fill="hsl(var(--chart-1))" />
                        <Line type="monotone" dataKey="Acumulado Anual" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
              )}
          </CardContent>
        </Card>
    </div>
  );
}
