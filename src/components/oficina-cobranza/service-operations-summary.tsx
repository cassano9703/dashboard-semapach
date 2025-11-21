
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
import { CalendarIcon } from 'lucide-react';

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

  const StatCard = ({ title, value }: { title: string; value: number }) => (
    <Card className="flex-1 text-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
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
      <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <StatCard title="Cortes Servis" value={stats.servis.cut} />
        <StatCard title="Reaperturas Servis" value={stats.servis.reconnection} />
        <StatCard title="Cortes Semapach" value={stats.semapach.cut} />
        <StatCard title="Reaperturas Semapach" value={stats.semapach.reconnection} />
      </CardContent>
    </Card>
  );
}
