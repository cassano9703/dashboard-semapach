"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Gauge, TrendingUp, Target, Flag, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

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
        <path d={`M${cx},${cy} L${cx + 8},${cy - 5} L${cx + 8},${cy + 5} Z`} fill={stroke} transform={`rotate(0 ${cx} ${cy})`} />
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

  const selectedMonthDate = useMemo(() => startOfMonth(selectedDate), [selectedDate]);

  const monthlyBaseDataRef = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'meter_data'), where('month', '==', format(selectedMonthDate, 'yyyy-MM'))) : null,
    [firestore, selectedMonthDate]
  );
  const { data: monthlyBaseData, isLoading: isLoadingBase } = useCollection(monthlyBaseDataRef);
  const baseInicial = useMemo(() => monthlyBaseData?.[0]?.meter_quantity || 0, [monthlyBaseData]);

  const weeklyProgressRef = useMemoFirebase(
    () => {
      if (!firestore) return null;
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      return query(
        collection(firestore, 'weekly_meter_progress'),
        where('weekStartDate', '>=', format(monthStart, 'yyyy-MM-dd')),
        where('weekStartDate', '<=', format(monthEnd, 'yyyy-MM-dd')),
        orderBy('weekStartDate', 'asc')
      );
    },
    [firestore, selectedDate]
  );
  const { data: weeklyData, isLoading: isLoadingWeekly } = useCollection(weeklyProgressRef);
  
  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);

  const evolucionFecha = useMemo(() => {
    if (!weeklyData || !weekStart) return 0;
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekRecord = weeklyData.find(d => d.weekStartDate === weekStartStr);
    return weekRecord?.meterCount || 0;
  }, [weeklyData, weekStart]);
  
  const acumulado = useMemo(() => {
    if (!weeklyData || !weekStart) return 0;
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');

    const relevantData = weeklyData.filter(d => d.weekStartDate <= weekStartStr);
    
    return relevantData.reduce((sum, record) => sum + record.meterCount, 0);
  }, [weeklyData, weekStart]);


  const isAugust = getMonth(selectedMonthDate) === 7;
  
  const montoFinal = useMemo(() => {
    if (isAugust) {
        return baseInicial - acumulado;
    }
    return baseInicial + acumulado;
  }, [baseInicial, acumulado, isAugust]);


  const isLoading = isLoadingBase || isLoadingWeekly;
  
  const acumuladoIcon = acumulado >= 0 ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />;

  const chartData = useMemo(() => {
    if (!weeklyData) return [];
    
    let accumulatedTotal = 0;
    
    return weeklyData.map(item => {
      accumulatedTotal += item.meterCount;
      return {
        name: `Sem. ${format(new Date(item.weekStartDate + 'T00:00'), 'dd MMM', { locale: es })}`,
        weeklyCount: item.meterCount,
        accumulatedCount: accumulatedTotal,
      }
    });
  }, [weeklyData]);

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
                        description={`Medidores al inicio de ${format(selectedMonthDate, 'MMMM yyyy', { locale: es })}`}
                        className="border-l-4 border-chart-3"
                    />
                    <StatCard 
                        title="Evolución a la Fecha" 
                        value={formatNumber(evolucionFecha)} 
                        icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
                        description={weekStart ? `Medidores en la semana del ${format(weekStart, 'dd MMM', { locale: es })}` : 'Seleccione una semana'}
                        className="border-l-4 border-chart-2"
                    />
                    <StatCard 
                        title="Acumulado" 
                        value={formatNumber(acumulado)} 
                        icon={acumuladoIcon}
                        description="Suma de instalaciones hasta la fecha"
                        className="border-l-4 border-chart-1"
                    />
                    <StatCard 
                        title="Monto Final" 
                        value={formatNumber(montoFinal)} 
                        icon={<Target className="h-4 w-4 text-muted-foreground" />}
                        description={isAugust ? "Base inicial - Acumulado (retiro de medidores)" : "Base inicial + Acumulado"}
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
