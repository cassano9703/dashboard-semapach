"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Gauge, TrendingUp, Target, Flag, TrendingDown } from 'lucide-react';

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('es-PE');
};

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

  const StatCard = ({ title, value, icon, description }: { title: string; value: string; icon: React.ReactNode; description?: string }) => (
    <Card>
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
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                />
                <StatCard 
                    title="Evolución a la Fecha" 
                    value={formatNumber(evolucionFecha)} 
                    icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
                    description={weekStart ? `Medidores en la semana del ${format(weekStart, 'dd MMM', { locale: es })}` : 'Seleccione una semana'}
                />
                <StatCard 
                    title="Acumulado" 
                    value={formatNumber(acumulado)} 
                    icon={acumuladoIcon}
                    description="Suma de instalaciones hasta la fecha"
                />
                 <StatCard 
                    title="Monto Final" 
                    value={formatNumber(montoFinal)} 
                    icon={<Target className="h-4 w-4 text-muted-foreground" />}
                    description={isAugust ? "Base inicial - Acumulado" : "Base inicial + Acumulado"}
                />
            </div>
        </CardContent>
    </Card>
  );
}
