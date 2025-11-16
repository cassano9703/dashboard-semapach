'use client';

import {
  collection,
  query,
  orderBy
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import Papa from 'papaparse';

const chartConfig = {
  dailyAmount: {
    label: 'Recuperación Diaria',
    color: 'hsl(var(--chart-1))',
  },
  accumulatedMonthly: {
    label: 'Acumulado Mensual',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  
interface Recovered2to3ChartProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function Recovered2to3Chart({ selectedDate, onDateChange }: Recovered2to3ChartProps) {
  const firestore = useFirestore();

  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_2_to_3'), orderBy('date')) : null),
    [firestore]
  );
  const { data: recoveredData, isLoading } = useCollection(dataRef);

  const chartData = useMemo(() => {
    if (!recoveredData) {
      return [];
    }

    const monthStr = format(selectedDate, 'yyyy-MM');

    const dataForMonth = recoveredData
      .filter(item => item.date.startsWith(monthStr))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (dataForMonth.length === 0) {
      return [];
    }
    
    const processedData = dataForMonth.map(item => ({
      ...item,
      date: format(new Date(item.date + 'T00:00:00'), 'd MMM', { locale: es }),
    }));

    return processedData;
  }, [recoveredData, selectedDate]);
  
  const handleDownloadCsv = () => {
    if (chartData.length === 0) return;
    
    const dataForCsv = chartData.map(item => ({
      Fecha: item.date,
      'Recuperación Diaria': item.dailyAmount,
      'Acumulado Mensual': item.accumulatedMonthly,
    }));

    const csv = Papa.unparse(dataForCsv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const monthYear = format(selectedDate, 'yyyy-MM');
    link.setAttribute('download', `reporte-recuperados-2-a-3-${monthYear}.csv`);
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
                <CardTitle>Análisis de Recuperación Mensual</CardTitle>
                <CardDescription>
                  Muestra la recuperación diaria y el acumulado del mes.
                </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && onDateChange(date)}
                    initialFocus
                    locale={es}
                    defaultMonth={selectedDate}
                  />
                </PopoverContent>
              </Popover>
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
              <Line
                dataKey="dailyAmount"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={true}
                name="Recuperación Diaria"
              />
              <Line
                dataKey="accumulatedMonthly"
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
