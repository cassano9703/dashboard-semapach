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
import { useMemo, useState } from 'react';
import { format, eachMonthOfInterval, startOfYear, endOfYear, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';


const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
  
const formatMillions = (value: number) => {
    if (value === 0) return 'S/0M';
    return `S/${(value / 1000000).toLocaleString('es-PE', { maximumFractionDigits: 2 })}M`;
};

export function DebtEvolutionChart() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 1)); // Default to Nov 2025
  const firestore = useFirestore();

  const debtGoalsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'monthly_goals'), where('goalType', '==', 'debt_3_plus'), orderBy('month', 'asc')) : null),
    [firestore]
  );

  const { data: debtGoalsData, isLoading } = useCollection(debtGoalsRef);
  
  const chartData = useMemo(() => {
    if (!debtGoalsData) return [];
    
    const yearStart = startOfYear(selectedDate);
    const yearEnd = endOfYear(selectedDate);

    const monthsInInterval = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return monthsInInterval.map(month => {
        const monthStr = format(month, 'yyyy-MM');
        const goal = debtGoalsData.find(g => g.month === monthStr);
        return {
            name: format(month, 'MMM', { locale: es }),
            'Deuda 3 a más (S/)': goal?.executedAmount ?? goal?.proposedAmount ?? 0,
        };
    }).filter(d => d['Deuda 3 a más (S/)'] > 0);
  }, [debtGoalsData, selectedDate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Deuda 3 a más (S/)</CardTitle>
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
        {isLoading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Cargando datos del gráfico...
            </div>
        ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos de deuda para el período seleccionado.
            </div>
        ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => formatMillions(Number(value))}
                    />
                    <Tooltip
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value: number) => [formatCurrency(value), "Deuda 3 a más"]}
                    />
                    <Bar dataKey="Deuda 3 a más (S/)" fill="hsl(var(--chart-2))" activeBar={<Rectangle fill="hsl(var(--chart-2) / 0.8)" />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
