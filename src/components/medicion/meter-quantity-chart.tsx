"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';

const chartConfig = {
  meter_quantity: {
    label: 'Cantidad de Medidores',
    color: 'hsl(var(--chart-1))',
  },
};

const formatNumber = (value: number) =>
  `${value.toLocaleString('es-PE')}`;

interface MeterQuantityChartProps {
  year: number;
}

export function MeterQuantityChart({ year }: MeterQuantityChartProps) {
  const firestore = useFirestore();

  const meterDataRef = useMemoFirebase(
    () => {
        if (!firestore) return null;
        const yearStr = year.toString();
        return query(
            collection(firestore, 'meter_data'),
            where('month', '>=', `${yearStr}-01`),
            where('month', '<=', `${yearStr}-12`),
            orderBy('month', 'asc')
        );
    },
    [firestore, year]
  );
  const { data: meterData, isLoading } = useCollection(meterDataRef);

  const chartData = useMemo(() => {
    if (!meterData) return [];
  
    const yearDate = new Date(year, 0, 1);
    const months = eachMonthOfInterval({
      start: new Date(year, 7, 1), // Start from August
      end: endOfYear(yearDate),
    });
  
    const dataMap = new Map(meterData.map(item => [item.month, item]));
      
    return months.map(month => {
        const monthKey = format(month, 'yyyy-MM');
        const data = dataMap.get(monthKey);
        return {
            name: format(month, 'MMM', { locale: es }),
            meter_quantity: data ? data.meter_quantity : null,
        }
    }).filter(d => d.meter_quantity !== null);
  
  }, [meterData, year]);

  if (isLoading) {
    return <div className="text-center p-8">Cargando gráfico...</div>;
  }
  
  if (chartData.length === 0) {
      return (
        <Card>
            <CardContent className="pt-6">
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No hay datos de medidores para mostrar en el gráfico.
                </div>
            </CardContent>
        </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cantidad de Medidores por Mes</CardTitle>
        <CardDescription>
          Evolución de la cantidad total de medidores instalados durante el año {year}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                left: 12,
                right: 12,
                }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
              />
              <YAxis
                  tickFormatter={(value) => `${Number(value) / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={50}
              />
               <Tooltip
                cursor={{
                  stroke: 'hsl(var(--border))',
                  strokeWidth: 1,
                  strokeDasharray: '3 3',
                }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatNumber(Number(value))}
                    indicator="dot"
                  />
                }
              />
              <defs>
                <linearGradient id="fillMeterQuantity" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="meter_quantity"
                type="monotone"
                fill="url(#fillMeterQuantity)"
                fillOpacity={0.4}
                stroke="hsl(var(--chart-1))"
                stackId="a"
              />
              <Line
                  dataKey="meter_quantity"
                  type="monotone"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: 'hsl(var(--background))',
                    stroke: 'hsl(var(--chart-1))',
                  }}
                  name="Cantidad de Medidores"
              />
            </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
