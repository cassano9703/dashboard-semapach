'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getYear, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';

const districts = [
  "Chincha Alta",
  "Grocio Prado",
  "Pueblo Nuevo",
  "Alto Laran",
  "Sunampe",
  "Tambo de Mora",
  "Chincha Baja",
];

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface RecoveredSummaryProps {
  selectedDate: Date;
}

export function RecoveredSummary({ selectedDate }: RecoveredSummaryProps) {
  const firestore = useFirestore();

  const servicesRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_services'), orderBy('date', 'desc')) : null),
    [firestore]
  );
  const { data: servicesData, isLoading } = useCollection(servicesRef);

  const chartData = useMemo(() => {
    if (!servicesData) {
      return [];
    }
    
    const year = getYear(selectedDate);
    const totals = new Map<string, { recoveredCount: number; recoveredAmount: number }>();

    servicesData.forEach(item => {
      const itemDate = parseISO(item.date + 'T00:00:00');
      const itemYear = getYear(itemDate);
      const itemMonth = getMonth(itemDate); // 0-indexed (7 is August, 11 is December)

      if (itemYear === year && itemMonth >= 7 && itemMonth <= 11) {
        const current = totals.get(item.district) || { recoveredCount: 0, recoveredAmount: 0 };
        current.recoveredCount += item.recoveredCount;
        current.recoveredAmount += item.recoveredAmount;
        totals.set(item.district, current);
      }
    });
    
    return districts
        .map(district => ({
            name: district,
            'Monto Recuperado': (totals.get(district) || { recoveredAmount: 0 }).recoveredAmount
        }))
        .filter(d => d['Monto Recuperado'] > 0)
        .sort((a,b) => b['Monto Recuperado'] - a['Monto Recuperado']);

  }, [servicesData, selectedDate]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Recuperados por Distrito</CardTitle>
        <CardDescription>
            Monto total recuperado en el periodo Agosto - Diciembre de {getYear(selectedDate)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando gráfico...</div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos para mostrar.</div>
        ) : (
          <ChartContainer config={{}} className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    type="number" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `S/${Number(value)/1000}k`}
                />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={80}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))}/>}
                />
                <Bar dataKey="Monto Recuperado" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
