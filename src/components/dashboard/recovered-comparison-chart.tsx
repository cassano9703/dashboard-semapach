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
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

// Sample data - replace with actual data fetching
const sampleData = {
    '2024-09': [
        { district: 'Chincha Alta', quantity: 15, amount: 1500 },
        { district: 'Grocio Prado', quantity: 10, amount: 1000 },
        { district: 'Pueblo Nuevo', quantity: 8, amount: 800 },
        { district: 'Alto Laran', quantity: 5, amount: 500 },
        { district: 'Sunampe', quantity: 12, amount: 1200 },
        { district: 'Tambo de Mora', quantity: 7, amount: 700 },
        { district: 'Chincha baja', quantity: 9, amount: 900 },
    ],
    '2024-10': [
        { district: 'Chincha Alta', quantity: 18, amount: 1800 },
        { district: 'Grocio Prado', quantity: 12, amount: 1200 },
        { district: 'Pueblo Nuevo', quantity: 10, amount: 1000 },
        { district: 'Alto Laran', quantity: 6, amount: 600 },
        { district: 'Sunampe', quantity: 14, amount: 1400 },
        { district: 'Tambo de Mora', quantity: 8, amount: 800 },
        { district: 'Chincha baja', quantity: 11, amount: 1100 },
    ]
};


interface RecoveredComparisonChartProps {
  selectedDate: Date;
}

export function RecoveredComparisonChart({ selectedDate }: RecoveredComparisonChartProps) {
  
  const { chartData, currentMonthLabel, prevMonthLabel } = useMemo(() => {
    const currentMonthKey = format(selectedDate, 'yyyy-MM');
    const prevMonth = subMonths(selectedDate, 1);
    const prevMonthKey = format(prevMonth, 'yyyy-MM');

    const currentData = (sampleData as any)[currentMonthKey] || [];
    const prevData = (sampleData as any)[prevMonthKey] || [];
    
    const districts = Array.from(new Set([...currentData.map((d: any) => d.district), ...prevData.map((d: any) => d.district)]));

    const data = districts.map(district => {
        const current = currentData.find((d: any) => d.district === district) || { quantity: 0, amount: 0 };
        const previous = prevData.find((d: any) => d.district === district) || { quantity: 0, amount: 0 };
        return {
            district,
            currentQuantity: current.quantity,
            prevQuantity: previous.quantity,
            currentAmount: current.amount,
            prevAmount: previous.amount,
        };
    });

    return {
        chartData: data,
        currentMonthLabel: format(selectedDate, 'MMMM', { locale: es }),
        prevMonthLabel: format(prevMonth, 'MMMM', { locale: es }),
    };
  }, [selectedDate]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa Mensual de Recuperados</CardTitle>
        <CardDescription>
          Comparación de la cantidad de servicios y montos recuperados entre el mes actual y el anterior.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </CardContent>
    </Card>
  );
}
