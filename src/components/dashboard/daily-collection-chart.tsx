'use client';

import {dailyCollectionData} from '@/lib/data';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
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
import {useState} from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {es} from 'date-fns/locale';
import {Calendar} from '@/components/ui/calendar';

const chartConfig = {
  recaudacion: {
    label: 'Recaudación',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function DailyCollectionChart() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-1">
          <CardTitle>Recaudación Diaria del Mes</CardTitle>
          <CardDescription>
            Análisis de la recaudación diaria durante el mes actual.
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
                  format(date, 'MMMM yyyy', {locale: es})
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
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={dailyCollectionData}
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
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="recaudacion"
              type="monotone"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
