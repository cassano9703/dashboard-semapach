
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { CalendarIcon, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceOperationsSummaryProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function ServiceOperationsSummary({ selectedDate, onDateChange }: ServiceOperationsSummaryProps) {
  const firestore = useFirestore();

  const operationsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    const currentMonth = format(selectedDate, 'yyyy-MM');
    return query(
      collection(firestore, 'service_operations'),
      where('month', '==', currentMonth)
    );
  }, [firestore, selectedDate]);

  const { data: operationsData, isLoading } = useCollection(operationsRef);

  const stats = useMemo(() => {
    const result = {
      servis: { cut: 0, reconnection: 0 },
      semapach: { cut: 0, reconnection: 0 },
    };

    if (operationsData) {
      operationsData.forEach(op => {
        if (op.entity === 'servis' || op.entity === 'semapach') {
          if (op.operationType === 'cut' || op.operationType === 'reconnection') {
            result[op.entity][op.operationType] = op.quantity;
          }
        }
      });
    }

    return result;
  }, [operationsData]);

  const StatCard = ({ title, value, className }: { title: string; value: number, className?: string }) => (
    <Card className={cn("text-center", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{isLoading ? '...' : value}</p>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Cortes y Reaperturas</CardTitle>
              <CardDescription>Resumen de operaciones del mes seleccionado.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-full sm:w-[240px] justify-start text-left font-normal">
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
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg p-4 border-t-4 border-[hsl(var(--chart-3))]">
          <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--chart-3))] flex items-center gap-2"><Building2 className="h-5 w-5"/> Operaciones Servis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <StatCard 
                title="Cortes" 
                value={stats.servis.cut} 
                className="border-l-4 border-[hsl(var(--chart-3))]"
              />
              <StatCard 
                title="Reaperturas" 
                value={stats.servis.reconnection}
                className="border-l-4 border-[hsl(var(--chart-3))]"
              />
          </div>
        </div>
        <div className="rounded-lg p-4 border-t-4 border-sky-500">
          <h3 className="text-lg font-semibold mb-4 text-sky-900 dark:text-sky-200 flex items-center gap-2"><Building2 className="h-5 w-5"/> Operaciones Semapach</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <StatCard 
                title="Cortes" 
                value={stats.semapach.cut}
                className="border-l-4 border-sky-500"
              />
              <StatCard 
                title="Reaperturas" 
                value={stats.semapach.reconnection}
                className="border-l-4 border-sky-500"
              />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
