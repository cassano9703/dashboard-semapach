'use client';

import {
  collection,
} from 'firebase/firestore';
import {
  useCollection,
  useFirestore,
  useMemoFirebase
} from '@/firebase';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {useMemo} from 'react';
import {format, startOfMonth, endOfMonth} from 'date-fns';
import {es} from 'date-fns/locale';

const chartConfig = {
  dailyCollectionAmount: {
    label: 'Recaudación Diaria',
    color: 'hsl(var(--chart-1))',
  },
  accumulatedMonthlyTotal: {
    label: 'Acumulado Mensual',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function DailyCollectionChart() {
  const firestore = useFirestore();
  const dailyCollectionsRef = useMemoFirebase(
    () => collection(firestore, 'daily_collections'),
    [firestore]
  );
  const { data: dailyCollectionData, isLoading } = useCollection(dailyCollectionsRef);

  const { chartData, monthlyGoal } = useMemo(() => {
    if (!dailyCollectionData) {
      return { chartData: [], monthlyGoal: 0 };
    }

    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);

    const dataForMonth = dailyCollectionData
      .filter(item => item.date.startsWith(currentMonth))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (dataForMonth.length === 0) {
      return { chartData: [], monthlyGoal: 0 };
    }

    const goal = dataForMonth[0]?.monthlyGoal || 0;
    
    const processedData = dataForMonth.map(item => ({
      ...item,
      date: format(new Date(item.date + 'T00:00:00'), 'd MMM', { locale: es }),
    }));

    return { chartData: processedData, monthlyGoal: goal };
  }, [dailyCollectionData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Recaudación Mensual</CardTitle>
        <CardDescription>
          Muestra la recaudación diaria y el acumulado mensual frente a la meta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[250px]">Cargando...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(value) => `S/ ${(Number(value) / 1000)}k`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <Tooltip
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))}/>}
              />
              <Legend />
              {monthlyGoal > 0 && (
                <ReferenceLine 
                  y={monthlyGoal} 
                  label={{ value: "Meta", position: 'insideTopLeft' }} 
                  stroke="red" 
                  strokeDasharray="3 3" 
                />
              )}
              <Line
                dataKey="dailyCollectionAmount"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={true}
                name="Recaudación Diaria"
              />
              <Line
                dataKey="accumulatedMonthlyTotal"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={true}
                name="Acumulado Mensual"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
