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
  ReferenceLine
} from 'recharts';

import {Button} from '@/components/ui/button';
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
import {Calendar as CalendarIcon, Download} from 'lucide-react';
import {useState, useMemo} from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format, startOfMonth, endOfMonth} from 'date-fns';
import {es} from 'date-fns/locale';
import {Calendar} from '@/components/ui/calendar';
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

export function DailyCollectionChart() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const firestore = useFirestore();
  const dailyCollectionsRef = useMemoFirebase(
    () => collection(firestore, 'daily_collections'),
    [firestore]
  );
  const { data: dailyCollectionData, isLoading } = useCollection(dailyCollectionsRef);

  const filteredData = useMemo(() => {
    if (!dailyCollectionData || !date) return [];
    
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    return dailyCollectionData
      .filter(item => {
        const itemDate = new Date(item.date + 'T00:00:00'); // Ensure date is parsed as local
        return itemDate >= start && itemDate <= end;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dailyCollectionData, date]);

  const chartData = useMemo(() => {
      return filteredData.map(item => ({
        ...item,
        // Format for display in chart
        date: format(new Date(item.date + 'T00:00:00'), 'd MMM', { locale: es }),
      }))
  }, [filteredData]);


  const monthlyGoal = filteredData.length > 0 ? filteredData[0].monthlyGoal : 0;

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    
    const dataToExport = filteredData.map(item => ({
      'Fecha': item.date,
      'Monto Recaudado Diario': formatCurrency(item.dailyCollectionAmount),
      'Total Recaudado': formatCurrency(item.accumulatedMonthlyTotal),
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const monthName = date ? format(date, "LLLL-yyyy", {locale: es}) : 'recaudacion';
    link.setAttribute('download', `reporte-recaudacion-${monthName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-1">
          <CardTitle>Recaudación Diaria del Mes</CardTitle>
          <CardDescription>
            Análisis de la recaudación diaria y acumulada durante el mes seleccionado.
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "LLLL 'de' yyyy", {locale: es})
                ) : (
                  <span>Seleccione un mes</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">Cargando...</div>
        ): (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 5,
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
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `S/ ${(Number(value) / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<ChartTooltipContent 
                formatter={(value) => `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />}
            />
            <Legend />
            {monthlyGoal > 0 && (
              <ReferenceLine y={monthlyGoal} label={{ value: 'Meta', position: 'insideTopLeft' }} stroke="red" strokeDasharray="3 3" />
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
