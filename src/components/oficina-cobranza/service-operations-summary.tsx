
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
import { CalendarIcon, Scissors, Wrench, Building2 } from 'lucide-react';

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

  const StatCard = ({ title, value, icon, className }: { title: string; value: number, icon: React.ReactNode, className?: string }) => (
    <Card className={cn("text-center", className)}>
      <CardHeader className="pb-2">
        <div className="mx-auto bg-white/50 dark:bg-black/20 p-3 rounded-full mb-2">
          {icon}
        </div>
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
        <div className="rounded-lg p-4 bg-blue-100 dark:bg-blue-900/30">
          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-200 flex items-center gap-2"><Building2 className="h-5 w-5"/> Operaciones Servis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <StatCard 
                title="Cortes" 
                value={stats.servis.cut} 
                icon={<Scissors className="text-blue-700 dark:text-blue-300"/>} 
                className="bg-white/60 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800"
              />
              <StatCard 
                title="Reaperturas" 
                value={stats.servis.reconnection} 
                icon={<Wrench className="text-blue-700 dark:text-blue-300"/>} 
                className="bg-white/60 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800"
              />
          </div>
        </div>
        <div className="rounded-lg p-4 bg-green-100 dark:bg-green-900/30">
          <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-200 flex items-center gap-2"><Building2 className="h-5 w-5"/> Operaciones Semapach</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <StatCard 
                title="Cortes" 
                value={stats.semapach.cut} 
                icon={<Scissors className="text-green-700 dark:text-green-300"/>} 
                className="bg-white/60 dark:bg-green-950/50 border-green-200 dark:border-green-800"
              />
              <StatCard 
                title="Reaperturas" 
                value={stats.semapach.reconnection} 
                icon={<Wrench className="text-green-700 dark:text-green-300"/>}
                className="bg-white/60 dark:bg-green-950/50 border-green-200 dark:border-green-800"
              />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
