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
  BarChart,
  Bar,
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
import {Calendar as CalendarIcon, Download, TrendingUp, TrendingDown} from 'lucide-react';
import {useState, useMemo} from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format, startOfMonth, endOfMonth, subDays, addDays, differenceInDays} from 'date-fns';
import { DateRange } from 'react-day-picker';
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
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });
  
  const firestore = useFirestore();
  const dailyCollectionsRef = useMemoFirebase(
    () => collection(firestore, 'daily_collections'),
    [firestore]
  );
  const { data: dailyCollectionData, isLoading } = useCollection(dailyCollectionsRef);

  const { filteredData, previousPeriodData } = useMemo(() => {
    if (!dailyCollectionData || !dateRange?.from) {
      return { filteredData: [], previousPeriodData: [] };
    }
    const from = dateRange.from;
    const to = dateRange.to ?? from;

    const sortedCollection = [...dailyCollectionData].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const filtered = sortedCollection.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      return itemDate >= from && itemDate <= to;
    });

    const diff = differenceInDays(to, from);
    const prevFrom = subDays(from, diff + 1);
    const prevTo = subDays(to, diff + 1);

    const previousPeriod = sortedCollection.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      return itemDate >= prevFrom && itemDate <= prevTo;
    });
    
    return { filteredData: filtered, previousPeriodData: previousPeriod };
  }, [dailyCollectionData, dateRange]);


  const chartData = useMemo(() => {
      return filteredData.map(item => ({
        ...item,
        date: format(new Date(item.date + 'T00:00:00'), 'd MMM', { locale: es }),
      }))
  }, [filteredData]);

  const totalCollection = useMemo(() => {
    return filteredData.reduce((acc, item) => acc + item.dailyCollectionAmount, 0);
  }, [filteredData]);
  
  const previousTotalCollection = useMemo(() => {
    return previousPeriodData.reduce((acc, item) => acc + item.dailyCollectionAmount, 0);
  }, [previousPeriodData]);

  const percentageChange = useMemo(() => {
    if (previousTotalCollection === 0) {
      return totalCollection > 0 ? 100 : 0;
    }
    return ((totalCollection - previousTotalCollection) / previousTotalCollection) * 100;
  }, [totalCollection, previousTotalCollection]);


  const monthlyGoal = filteredData.length > 0 ? filteredData[0].monthlyGoal : 0;

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const dataToExport = filteredData.map(item => ({
      'Fecha': item.date,
      'Monto Recaudado Diario': formatCurrency(item.dailyCollectionAmount),
      'Acumulado Mensual': formatCurrency(item.accumulatedMonthlyTotal)
    }));
    
    const csv = Papa.unparse(dataToExport);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fromDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : 'inicio';
    const toDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : 'fin';
    link.setAttribute('download', `reporte-recaudacion-${fromDate}-a-${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 md:flex-row md:items-center">
        <div className="grid gap-1 flex-1">
          <CardTitle>Análisis de Recaudación</CardTitle>
          <CardDescription>
            Análisis de la recaudación diaria y acumulada para el periodo seleccionado.
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-[300px] justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y', {locale: es})} -{' '}
                      {format(dateRange.to, 'LLL dd, y', {locale: es})}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y', {locale: es})
                  )
                ) : (
                  <span>Seleccione un rango</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
            {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">Cargando...</div>
            ): (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                />
                <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `S/ ${(Number(value) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                content={<ChartTooltipContent
                    formatter={(value, name) => {
                        return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{formatCurrency(Number(value))}</span>
                            <span className="text-xs text-muted-foreground">{name}</span>
                        </div>
                        )
                    }}
                    />}
                />
                <Bar
                dataKey="dailyCollectionAmount"
                fill="hsl(var(--chart-1))"
                radius={4}
                name="Recaudación Diaria"
                />
            </BarChart>
            </ChartContainer>
            )}
        </div>
        <div className="lg:col-span-1 flex flex-col justify-center">
            <Card className="border-l-4 border-primary">
                <CardHeader className="pb-2">
                    <CardDescription>Total Recaudado (Periodo)</CardDescription>
                    <CardTitle className="text-3xl">{formatCurrency(totalCollection)}</CardTitle>
                </CardHeader>
                <CardContent>
                    {percentageChange !== 0 && (
                        <div className={cn("text-xs text-muted-foreground flex items-center", percentageChange > 0 ? "text-green-600" : "text-red-600")}>
                           {percentageChange > 0 ? <TrendingUp className="mr-1 h-4 w-4"/> : <TrendingDown className="mr-1 h-4 w-4"/>}
                           {percentageChange.toFixed(2)}% vs periodo anterior
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}
