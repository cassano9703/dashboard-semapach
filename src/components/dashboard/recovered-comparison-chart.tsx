"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';

interface RecoveredComparisonChartProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function RecoveredComparisonChart({ selectedDate, onDateChange }: RecoveredComparisonChartProps) {
  const firestore = useFirestore();
  const firstAvailableDate = new Date(2025, 8, 1); // September 2025

  const servicesRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_services'), orderBy('date', 'asc')) : null),
    [firestore]
  );
  const { data: servicesData, isLoading } = useCollection(servicesRef);
  
  const chartData = useMemo(() => {
    if (!servicesData || selectedDate < firstAvailableDate) {
      return { quantity: [], amount: [] };
    }

    const interval = {
        start: firstAvailableDate,
        end: selectedDate,
    };

    const monthsInInterval = eachMonthOfInterval(interval);

    const monthlyTotals = monthsInInterval.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        let totalQuantity = 0;
        let totalAmount = 0;

        servicesData.forEach(item => {
            const itemDate = parseISO(item.date + 'T00:00:00');
            if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
                totalQuantity += item.recoveredCount;
                totalAmount += item.recoveredAmount;
            }
        });

        return {
            name: format(month, 'MMM', { locale: es }),
            quantity: totalQuantity,
            amount: totalAmount,
        };
    });
    
    const quantityData = monthlyTotals.map(({name, quantity}) => ({name, value: quantity}));
    const amountData = monthlyTotals.map(({name, amount}) => ({name, value: amount}));

    return { quantity: quantityData, amount: amountData };
  }, [servicesData, selectedDate, firstAvailableDate]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Evolución Mensual</CardTitle>
              <CardDescription>
                Cantidad de usuarios y montos recuperados por mes.
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
                  onSelect={(date) => date && onDateChange(date)}
                  disabled={{ before: firstAvailableDate, after: new Date() }}
                  fromMonth={firstAvailableDate}
                  toMonth={new Date()}
                  initialFocus
                  locale={es}
                  defaultMonth={selectedDate}
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[300px] items-center justify-center">
                <div className="text-center text-muted-foreground">Cargando datos del gráfico...</div>
                <div className="text-center text-muted-foreground">Cargando datos del gráfico...</div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-center font-semibold mb-4">Cantidad de Usuarios Recuperados</h3>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.quantity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ fontSize: '12px' }}
                            formatter={(value) => [value, "Cantidad"]}
                        />
                        <Bar dataKey="value" fill="hsl(var(--chart-1))" activeBar={<Rectangle fill="hsl(var(--chart-1) / 0.8)" />} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h3 className="text-center font-semibold mb-4">Monto Recuperado (S/)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.amount}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `S/${Number(value)/1000}k`}
                        />
                        <Tooltip 
                            contentStyle={{ fontSize: '12px' }}
                            formatter={(value) => [formatCurrency(Number(value)), "Monto"]}
                        />
                        <Bar dataKey="value" fill="hsl(var(--chart-4))" activeBar={<Rectangle fill="hsl(var(--chart-4) / 0.8)" />} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
