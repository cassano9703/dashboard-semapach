'use client';

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

interface RecoveredComparisonChartProps {
  selectedDate: Date;
}

export function RecoveredComparisonChart({ selectedDate }: RecoveredComparisonChartProps) {
  const firestore = useFirestore();

  const servicesRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_services'), orderBy('date', 'desc')) : null),
    [firestore]
  );
  const { data: servicesData, isLoading } = useCollection(servicesRef);
  
  const { chartData, currentMonthLabel, prevMonthLabel } = useMemo(() => {
    const prevMonth = subMonths(selectedDate, 1);
    const currentMonthStart = startOfMonth(selectedDate);
    const currentMonthEnd = endOfMonth(selectedDate);
    const prevMonthStart = startOfMonth(prevMonth);
    const prevMonthEnd = endOfMonth(prevMonth);

    const currentMonthLabel = format(selectedDate, 'MMMM', { locale: es });
    const prevMonthLabel = format(prevMonth, 'MMMM', { locale: es });

    if (!servicesData) {
      return { chartData: [], currentMonthLabel, prevMonthLabel };
    }

    const currentTotals = new Map<string, { quantity: number; amount: number }>();
    const prevTotals = new Map<string, { quantity: number; amount: number }>();
    const allDistricts = new Set<string>();

    servicesData.forEach(item => {
      allDistricts.add(item.district);
      const itemDate = parseISO(item.date + 'T00:00:00');
      
      if (isWithinInterval(itemDate, { start: currentMonthStart, end: currentMonthEnd })) {
        const current = currentTotals.get(item.district) || { quantity: 0, amount: 0 };
        current.quantity += item.recoveredCount;
        current.amount += item.recoveredAmount;
        currentTotals.set(item.district, current);
      } else if (isWithinInterval(itemDate, { start: prevMonthStart, end: prevMonthEnd })) {
        const prev = prevTotals.get(item.district) || { quantity: 0, amount: 0 };
        prev.quantity += item.recoveredCount;
        prev.amount += item.recoveredAmount;
        prevTotals.set(item.district, prev);
      }
    });

    const data = Array.from(allDistricts).map(district => {
        const current = currentTotals.get(district) || { quantity: 0, amount: 0 };
        const previous = prevTotals.get(district) || { quantity: 0, amount: 0 };
        return {
            district,
            currentQuantity: current.quantity,
            prevQuantity: previous.quantity,
            currentAmount: current.amount,
            prevAmount: previous.amount,
        };
    });

    return { chartData: data, currentMonthLabel, prevMonthLabel };
  }, [servicesData, selectedDate]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa Mensual de Recuperados</CardTitle>
        <CardDescription>
          Comparación de la cantidad de servicios y montos recuperados entre el mes actual y el anterior.
        </CardDescription>
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
                    <h3 className="text-center font-semibold mb-4">Cantidad de Servicios Recuperados</h3>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="district" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ fontSize: '12px' }}
                            formatter={(value, name) => [value, name === 'prevQuantity' ? `Cant. ${prevMonthLabel}` : `Cant. ${currentMonthLabel}`]}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} formatter={(value) => value === 'prevQuantity' ? `Cant. ${prevMonthLabel}` : `Cant. ${currentMonthLabel}`} />
                        <Bar dataKey="prevQuantity" fill="hsl(var(--chart-2))" activeBar={<Rectangle fill="hsl(var(--chart-2) / 0.8)" />} />
                        <Bar dataKey="currentQuantity" fill="hsl(var(--chart-1))" activeBar={<Rectangle fill="hsl(var(--chart-1) / 0.8)" />} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h3 className="text-center font-semibold mb-4">Monto Recuperado (S/)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="district" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `S/${Number(value)/1000}k`}
                        />
                        <Tooltip 
                            contentStyle={{ fontSize: '12px' }}
                            formatter={(value, name) => [`S/ ${Number(value).toFixed(2)}`, name === 'prevAmount' ? `Monto ${prevMonthLabel}` : `Monto ${currentMonthLabel}`]}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} formatter={(value) => value === 'prevAmount' ? `Monto ${prevMonthLabel}` : `Monto ${currentMonthLabel}`} />
                        <Bar dataKey="prevAmount" fill="hsl(var(--chart-4))" activeBar={<Rectangle fill="hsl(var(--chart-4) / 0.8)" />} />
                        <Bar dataKey="currentAmount" fill="hsl(var(--chart-5))" activeBar={<Rectangle fill="hsl(var(--chart-5) / 0.8)" />} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
