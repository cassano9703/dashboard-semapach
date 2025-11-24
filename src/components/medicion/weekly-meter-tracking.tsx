"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Gauge, TrendingUp, CheckCircle, Flag } from 'lucide-react';

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('es-PE');
};

interface WeeklyMeterTrackingProps {
  year: number;
}

export function WeeklyMeterTracking({ year }: WeeklyMeterTrackingProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const firestore = useFirestore();

  // 1. Fetch August base data
  const augustMeterDataRef = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'meter_data'), where('month', '==', `${year}-08`)) : null,
    [firestore, year]
  );
  const { data: augustData, isLoading: isLoadingAugust } = useCollection(augustMeterDataRef);
  const baseInicial = useMemo(() => augustData?.[0]?.meter_quantity || 0, [augustData]);

  // 2. Fetch weekly progress data for the selected week
  const weekStart = useMemo(() => date ? startOfWeek(date, { weekStartsOn: 1 }) : null, [date]);
  
  const weeklyProgressRef = useMemoFirebase(
    () => {
      if (!firestore || !weekStart) return null;
      return query(
        collection(firestore, 'weekly_meter_progress'),
        where('weekStartDate', '==', format(weekStart, 'yyyy-MM-dd'))
      );
    },
    [firestore, weekStart]
  );
  const { data: weeklyData, isLoading: isLoadingWeekly } = useCollection(weeklyProgressRef);
  const evolucionFecha = useMemo(() => weeklyData?.[0]?.meterCount || 0, [weeklyData]);

  // 3. Fetch annual goal
  const annualGoalRef = useMemoFirebase(
    () => firestore ? query(
        collection(firestore, 'annual_goals'),
        where('year', '==', year),
        where('goalType', '==', 'meter_replacement')
    ) : null,
    [firestore, year]
  );
  const { data: annualGoalData, isLoading: isLoadingAnnual } = useCollection(annualGoalRef);
  const metaAnual = useMemo(() => annualGoalData?.[0]?.amount || 0, [annualGoalData]);

  const acumulado = evolucionFecha > 0 ? evolucionFecha - baseInicial : 0;
  
  const isLoading = isLoadingAugust || isLoadingWeekly || isLoadingAnnual;

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
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    locale={es}
                />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard 
                    title="Base Inicial (Agosto)" 
                    value={formatNumber(baseInicial)} 
                    icon={<Flag className="h-4 w-4 text-muted-foreground" />}
                    description={`Medidores al inicio de Agosto ${year}`}
                />
                <StatCard 
                    title="Evolución a la Fecha" 
                    value={formatNumber(evolucionFecha)} 
                    icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
                    description={weekStart ? `Medidores al ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'dd MMM', { locale: es })}` : 'Seleccione una semana'}
                />
                <StatCard 
                    title="Acumulado" 
                    value={formatNumber(acumulado)} 
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                    description="Nuevos medidores instalados"
                />
                 <StatCard 
                    title="Meta Anual" 
                    value={formatNumber(metaAnual)} 
                    icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
                    description={`Meta de reemplazo para ${year}`}
                />
            </div>
        </CardContent>
    </Card>
  );
}
