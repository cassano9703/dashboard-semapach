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
  LineChart,
  Line,
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, eachMonthOfInterval, parseISO, isWithinInterval, endOfMonth, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';

export function InspectionsClandestineData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const firestore = useFirestore();

  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'inspections_clandestine'), orderBy('month', 'asc')) : null),
    [firestore]
  );
  const { data, isLoading } = useCollection(dataRef);

  const chartDataForMonth = useMemo(() => {
    if (!data) return [];

    const selectedMonthStr = format(selectedDate, 'yyyy-MM');
    
    return data
      .filter(item => item.month === selectedMonthStr && (item.inspectionsCount > 0 || item.clandestineCount > 0))
      .map(item => ({
        name: item.district,
        Inspecciones: item.inspectionsCount,
        Clandestinos: item.clandestineCount,
      }));

  }, [data, selectedDate]);
  
  const tableData = chartDataForMonth;
  
  const yearlyChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
  
    // Find the first month with data in the current year
    const yearStart = startOfYear(selectedDate);
    const firstRecordOfMonth = data
        .filter(d => d.month.startsWith(format(yearStart, 'yyyy')))
        .map(d => parseISO(`${d.month}-01`))
        .sort((a, b) => a.getTime() - b.getTime())[0] || yearStart;

    const monthsInYear = eachMonthOfInterval({
      start: firstRecordOfMonth,
      end: endOfMonth(new Date()),
    });
  
    let accumulatedInspections = 0;
    let accumulatedClandestines = 0;
  
    return monthsInYear.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const recordsForMonth = data.filter(item => item.month === monthStr);
      
      const monthlyInspections = recordsForMonth.reduce((sum, item) => sum + item.inspectionsCount, 0);
      const monthlyClandestines = recordsForMonth.reduce((sum, item) => sum + item.clandestineCount, 0);
  
      accumulatedInspections += monthlyInspections;
      accumulatedClandestines += monthlyClandestines;
  
      return {
        name: format(month, 'MMM', { locale: es }),
        'Inspecciones Mensuales': monthlyInspections,
        'Clandestinos Mensuales': monthlyClandestines,
        'Acumulado Inspecciones': accumulatedInspections,
        'Acumulado Clandestinos': accumulatedClandestines,
      };
    });
  }, [data, selectedDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Resumen Mensual</CardTitle>
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
                <div className="relative h-[300px] overflow-y-auto">
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
                        {tableData.map((item) => (
                            <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.Inspecciones}</TableCell>
                            <TableCell className="text-right">{item.Clandestinos}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Comparativo por Distrito</CardTitle>
            <CardDescription>
                Comparación de inspecciones y clandestinos del mes.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">Cargando datos del gráfico...</div>
            ) : chartDataForMonth.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar en el gráfico.</div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataForMonth}>
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

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolución Anual de Inspecciones y Clandestinos</CardTitle>
            <CardDescription>
              Muestra el total mensual y el acumulado a lo largo del año seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-[250px]">Cargando datos...</div>
            ) : yearlyChartData.length === 0 ? (
              <div className="flex justify-center items-center h-[250px] text-muted-foreground">
                No hay datos para el año seleccionado.
              </div>
            ) : (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <LineChart data={yearlyChartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line dataKey="Inspecciones Mensuales" type="monotone" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={true} />
                  <Line dataKey="Clandestinos Mensuales" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={true} />
                  <Line dataKey="Acumulado Inspecciones" type="monotone" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line dataKey="Acumulado Clandestinos" type="monotone" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
