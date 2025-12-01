"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, startOfWeek, endOfMonth, getMonth, getYear, eachMonthOfInterval, startOfYear, startOfMonth, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { Gauge, TrendingUp, Target, Flag, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { Separator } from '../ui/separator';

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('es-PE');
};

// @ts-ignore
const CustomizedDot = (props) => {
  const { cx, cy, stroke, payload, value, data, dataKey } = props;
  const isLastPoint = payload.name === data[data.length - 1].name;

  if (isLastPoint) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={3} stroke={stroke} fill={stroke} />
        <path d={`M${cx + 4},${cy}L${cx + 9},${cy - 4}L${cx + 9},${cy + 4}Z`} fill={stroke} />
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={3} stroke={stroke} fill={stroke} />;
};

const chartConfig = {
  weeklyCount: {
    label: 'Medidores Semanales',
    color: 'hsl(var(--chart-1))',
  },
  accumulatedCount: {
    label: 'Acumulado Mensual',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;


interface WeeklyMeterTrackingProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeeklyMeterTracking({ selectedDate, onDateChange }: WeeklyMeterTrackingProps) {
  const firestore = useFirestore();
  const currentYear = getYear(selectedDate);

  const weeklyProgressRef = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'weekly_meter_progress'), where('weekStartDate', '>=', `${currentYear}-01-01`), where('weekStartDate', '<=', `${currentYear}-12-31`), orderBy('weekStartDate', 'asc')) : null,
    [firestore, currentYear]
  );

  const { data: weeklyData, isLoading: isLoadingWeekly } = useCollection(weeklyProgressRef);

  const {
    baseInicial,
    evolucionFecha,
    acumulado,
    montoFinal,
    chartData,
    selectedMonthDate,
  } = useMemo(() => {
    const currentSelectedMonthDate = startOfMonth(selectedDate);
    if (!weeklyData) {
      return { baseInicial: 0, evolucionFecha: 0, acumulado: 0, montoFinal: 0, chartData: [], selectedMonthDate: currentSelectedMonthDate };
    }

    const monthlyTotals: { [month: string]: { base: number, acumulado: number, final: number } } = {};
    const yearMonths = eachMonthOfInterval({ start: startOfYear(selectedDate), end: endOfYear(selectedDate) });

    yearMonths.forEach((monthDate) => {
      const monthKey = format(monthDate, 'yyyy-MM');
      const prevMonth = new Date(monthDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevMonthKey = format(prevMonth, 'yyyy-MM');

      const weeklyInMonth = weeklyData.filter(d => getMonth(new Date(d.weekStartDate + 'T00:00:00')) === getMonth(monthDate));
      const monthAcumulado = weeklyInMonth.reduce((sum, record) => sum + record.meterCount, 0);

      let base;
      if (getMonth(monthDate) === 0) { // Enero
        base = 16540; 
      } else {
        base = monthlyTotals[prevMonthKey]?.final || 0;
      }
      
      const final = base + monthAcumulado;
      monthlyTotals[monthKey] = { base, acumulado: monthAcumulado, final };
    });
    
    const selectedMonthKey = format(currentSelectedMonthDate, 'yyyy-MM');
    const selectedMonthTotals = monthlyTotals[selectedMonthKey] || { base: 0, acumulado: 0, final: 0 };
    
    const finalBaseInicial = selectedMonthTotals.base;
    const finalAcumulado = selectedMonthTotals.acumulado;
    const finalMontoFinal = selectedMonthTotals.final;
    
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekRecord = weeklyData.find(d => d.weekStartDate === weekStartStr);
    const finalEvolucionFecha = weekRecord?.meterCount || 0;

    const currentMonthWeeklyData = weeklyData.filter(d => getMonth(new Date(d.weekStartDate + 'T00:00:00')) === getMonth(selectedDate));
    let accumulatedChartTotal = 0;
    const finalChartData = currentMonthWeeklyData.map(item => {
      accumulatedChartTotal += item.meterCount;
      return {
        name: `Sem. ${format(new Date(item.weekStartDate + 'T00:00'), 'dd MMM', { locale: es })}`,
        weeklyCount: item.meterCount,
        accumulatedCount: accumulatedChartTotal,
      };
    });

    return {
      baseInicial: finalBaseInicial,
      evolucionFecha: finalEvolucionFecha,
      acumulado: finalAcumulado,
      montoFinal: finalMontoFinal,
      chartData: finalChartData,
      selectedMonthDate: currentSelectedMonthDate
    };
  }, [weeklyData, selectedDate]);

  const isLoading = isLoadingWeekly;
  const acumuladoIcon = acumulado >= 0 ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />;

  const StatCard = ({ title, value, icon, description, className }: { title: string; value: string; icon: React.ReactNode; description?: string, className?: string }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? <span className="animate-pulse">...</span> : value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <Card>
        <CardHeader>
            <CardTitle>Seguimiento Semanal de Medidores</CardTitle>
            <CardDescription>
                Seleccione una semana en el calendario para ver el progreso de instalación de medidores.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => d && onDateChange(d)}
                        className="rounded-md border"
                        locale={es}
                    />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard 
                        title={`Base Inicial (${format(selectedMonthDate, 'MMMM', { locale: es })})`} 
                        value={formatNumber(baseInicial)} 
                        icon={<Flag className="h-4 w-4 text-muted-foreground" />}
                        description={`Monto final del mes anterior`}
                        className="border-l-4 border-chart-3"
                    />
                    <StatCard 
                        title="Evolución a la Fecha" 
                        value={formatNumber(evolucionFecha)} 
                        icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
                        description={`Medidores en la semana seleccionada`}
                        className="border-l-4 border-chart-1"
                    />
                    <StatCard 
                        title="Acumulado del Mes" 
                        value={formatNumber(acumulado)} 
                        icon={acumuladoIcon}
                        description={`Suma de instalaciones para ${format(selectedMonthDate, 'MMMM', { locale: es })}`}
                        className="border-l-4 border-chart-2"
                    />
                    <StatCard 
                        title="Monto Final" 
                        value={formatNumber(montoFinal)} 
                        icon={<Target className="h-4 w-4 text-muted-foreground" />}
                        description={"Base inicial + Acumulado"}
                        className="border-l-4 border-chart-4"
                    />
                </div>
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-2">Evolución Semanal de Medidores</h3>
                <p className="text-sm text-muted-foreground mb-4">Progreso de instalación por semana en {format(selectedDate, 'MMMM yyyy', {locale: es})}.</p>
                {isLoading ? (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">Cargando gráfico...</div>
                ) : chartData.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar en este mes.</div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                fontSize={12}
                            />
                            <YAxis
                                tickFormatter={(value) => formatNumber(value as number)}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={80}
                            />
                            <Tooltip
                                content={<ChartTooltipContent formatter={(value) => formatNumber(value as number)}/>}
                            />
                            <Legend />
                            <Line
                                dataKey="weeklyCount"
                                type="monotone"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={2}
                                dot={<CustomizedDot data={chartData} />}
                                activeDot={{ r: 8 }}
                                name="Medidores Semanales"
                            />
                            <Line
                                dataKey="accumulatedCount"
                                type="monotone"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                                dot={<CustomizedDot data={chartData} />}
                                activeDot={{ r: 8 }}
                                name="Acumulado Mensual"
                            />
                        </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
