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

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

    let currentMonthTotalQuantity = 0;
    let currentMonthTotalAmount = 0;
    let prevMonthTotalQuantity = 0;
    let prevMonthTotalAmount = 0;

    servicesData.forEach(item => {
      const itemDate = parseISO(item.date + 'T00:00:00');
      
      if (isWithinInterval(itemDate, { start: currentMonthStart, end: currentMonthEnd })) {
        currentMonthTotalQuantity += item.recoveredCount;
        currentMonthTotalAmount += item.recoveredAmount;
      } else if (isWithinInterval(itemDate, { start: prevMonthStart, end: prevMonthEnd })) {
        prevMonthTotalQuantity += item.recoveredCount;
        prevMonthTotalAmount += item.recoveredAmount;
      }
    });

    const data = [
      {
        name: 'Cantidad',
        [prevMonthLabel]: prevMonthTotalQuantity,
        [currentMonthLabel]: currentMonthTotalQuantity,
      },
      {
        name: 'Monto',
        [prevMonthLabel]: prevMonthTotalAmount,
        [currentMonthLabel]: currentMonthTotalAmount,
      }
    ];

    const quantityData = [
      { name: prevMonthLabel, value: prevMonthTotalQuantity },
      { name: currentMonthLabel, value: currentMonthTotalQuantity },
    ];
    
    const amountData = [
      { name: prevMonthLabel, value: prevMonthTotalAmount },
      { name: currentMonthLabel, value: currentMonthTotalAmount },
    ];


    return { chartData: { quantity: quantityData, amount: amountData }, currentMonthLabel, prevMonthLabel };
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
