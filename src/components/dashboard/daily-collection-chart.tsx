'use client';

import {
  collection,
} from 'firebase/firestore';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
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
import {format} from 'date-fns';
import {es} from 'date-fns/locale';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

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
  
interface DailyCollectionChartProps {
  selectedDate: Date;
}

export function DailyCollectionChart({ selectedDate }: DailyCollectionChartProps) {
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

    const monthStr = format(selectedDate, 'yyyy-MM');

    const dataForMonth = dailyCollectionData
      .filter(item => item.date.startsWith(monthStr))
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
  }, [dailyCollectionData, selectedDate]);
  
  const handleDownloadCsv = () => {
    if (chartData.length === 0) return;
    
    const dataForCsv = chartData.map(item => ({
      Fecha: item.date,
      'Recaudación Diaria': item.dailyCollectionAmount,
      'Acumulado Mensual': item.accumulatedMonthlyTotal,
      'Meta Mensual': item.monthlyGoal,
    }));

    const csv = Papa.unparse(dataForCsv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const monthYear = format(selectedDate, 'yyyy-MM');
    link.setAttribute('download', `reporte-recaudacion-${monthYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle>Análisis de Recaudación Mensual</CardTitle>
                <CardDescription>
                  Muestra la recaudación diaria y el acumulado mensual frente a la meta.
                </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar Excel
              </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[250px]">Cargando datos...</div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-[250px] text-muted-foreground">
            No hay datos para el mes seleccionado.
          </div>
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
