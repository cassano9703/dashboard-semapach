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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
  LineChart,
  Line,
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, eachMonthOfInterval, startOfYear, endOfYear, parseISO, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';

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
      .map((item, index) => ({
        ...item,
        item: index + 1,
        name: item.district,
        Cantidad: item.quantity,
      }));

  }, [data, selectedDate]);
  
  const chartData = useMemo(() => {
    if (!data) return [];

    const yearStart = startOfYear(selectedDate);
    const yearEnd = endOfYear(selectedDate);
    const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return monthsInYear.map(month => {
        const monthStr = format(month, 'yyyy-MM');
        const recordsForMonth = data.filter(item => item.month === monthStr);
        const totalQuantity = recordsForMonth.reduce((sum, item) => sum + item.quantity, 0);

        return {
            name: format(month, 'MMM', { locale: es }),
            Cantidad: totalQuantity,
        };
    }).filter(item => item.Cantidad > 0);
  }, [data, selectedDate]);

  const yearlyChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
  
    const yearStart = startOfYear(selectedDate);
    const firstRecordOfMonth = data
        .filter(d => d.month.startsWith(format(yearStart, 'yyyy')))
        .map(d => parseISO(`${d.month}-01`))
        .sort((a, b) => a.getTime() - b.getTime())[0] || yearStart;

    const monthsInYear = eachMonthOfInterval({
      start: firstRecordOfMonth,
      end: endOfMonth(new Date()),
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
    });
  }, [data, selectedDate]);


  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Resumen Mensual de Contratos Cerrados</CardTitle>
                <CardDescription>
                  Datos de contratos cerrados para el mes seleccionado.
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
      <Card>
          <CardHeader>
              <CardTitle>Comparativo Mensual</CardTitle>
              <CardDescription>
                  Gráfico de contratos cerrados en el año.
              </CardDescription>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">Cargando datos del gráfico...</div>
              ) : chartData.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar en el gráfico.</div>
              ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ fontSize: '12px' }}
                        />
                        <Legend />
                        <Bar dataKey="Cantidad" fill="hsl(var(--chart-1))" activeBar={<Rectangle fill="hsl(var(--chart-1) / 0.8)" />} />
                    </BarChart>
                  </ResponsiveContainer>
              )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle>Evolución Anual de Contratos Cerrados</CardTitle>
                <CardDescription>
                Muestra la cantidad mensual y el acumulado a lo largo del año.
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
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Cantidad Mensual" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" dataKey="Acumulado Anual" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={true} />
                    </LineChart>
                </ChartContainer>
                )}
            </CardContent>
            </Card>
      </div>
    </div>
  );
}
