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
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, eachMonthOfInterval, parseISO, isWithinInterval, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function InspectionsClandestineData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const firestore = useFirestore();
  const firstAvailableDate = new Date(2024, 0, 1); // Jan 2024

  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'inspections_clandestine'), orderBy('month', 'asc')) : null),
    [firestore]
  );
  const { data, isLoading } = useCollection(dataRef);

  const { tableData, chartData } = useMemo(() => {
    if (!data) return { tableData: [], chartData: [] };

    const selectedMonthStr = format(selectedDate, 'yyyy-MM');
    
    const tableDataForMonth = data
      .filter(item => item.month === selectedMonthStr && (item.inspectionsCount > 0 || item.clandestineCount > 0))
      .map(item => ({
        district: item.district,
        inspectionsCount: item.inspectionsCount,
        clandestineCount: item.clandestineCount,
      }));

    const interval = {
        start: firstAvailableDate,
        end: new Date(),
    };
    const monthsInInterval = eachMonthOfInterval(interval);
    
    const monthlyTotals = monthsInInterval.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        let totalInspections = 0;
        let totalClandestine = 0;

        data.forEach(item => {
            const itemDate = parseISO(item.month + '-01T00:00:00');
            if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
                totalInspections += item.inspectionsCount;
                totalClandestine += item.clandestineCount;
            }
        });

        return {
            name: format(month, 'MMM', { locale: es }),
            Inspecciones: totalInspections,
            Clandestinos: totalClandestine,
        };
    });

    return { tableData: tableDataForMonth, chartData: monthlyTotals };

  }, [data, selectedDate]);
  
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Resumen Mensual por Distrito</CardTitle>
                  <CardDescription>
                    Datos de inspecciones y clandestinos para el mes seleccionado.
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
                        <div className="text-center p-8 text-muted-foreground">No hay datos con valores para el mes seleccionado.</div>
                      ) : (
                      <Table>
                          <TableHeader className="sticky top-0 bg-table-header text-table-header-foreground z-10">
                          <TableRow>
                              <TableHead>Distrito</TableHead>
                              <TableHead className="w-[150px] text-right">Nº de Inspecciones</TableHead>
                              <TableHead className="w-[120px] text-right">Clandestinos</TableHead>
                          </TableRow>
                          </TableHeader>
                          <TableBody>
                          {tableData.map((item, index) => (
                              <TableRow key={item.district}>
                              <TableCell className="font-medium">{item.district}</TableCell>
                              <TableCell className="text-right">{item.inspectionsCount}</TableCell>
                              <TableCell className="text-right">{item.clandestineCount}</TableCell>
                              </TableRow>
                          ))}
                          </TableBody>
                      </Table>
                      )}
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
              <CardTitle>Comparativo Anual por Mes</CardTitle>
              <CardDescription>
                  Comparación de totales de inspecciones y clandestinos.
              </CardDescription>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Cargando datos del gráfico...</div>
              ) : (
                  <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                          contentStyle={{ fontSize: '12px' }}
                      />
                      <Legend />
                      <Bar dataKey="Inspecciones" fill="hsl(var(--chart-1))" activeBar={<Rectangle fill="hsl(var(--chart-1) / 0.8)" />} />
                      <Bar dataKey="Clandestinos" fill="hsl(var(--chart-2))" activeBar={<Rectangle fill="hsl(var(--chart-2) / 0.8)" />} />
                  </BarChart>
                  </ResponsiveContainer>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
