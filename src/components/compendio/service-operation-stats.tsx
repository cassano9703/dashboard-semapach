"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Repeat, Building, UserCog, CalendarIcon } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';


const formatNumber = (value: number) => value.toLocaleString('es-PE');

export function ServiceOperationStats() {
  const firestore = useFirestore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedMonth = format(selectedDate, 'yyyy-MM');

  const operationsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'service_operations'), where('month', '==', selectedMonth)) : null),
    [firestore, selectedMonth]
  );
  const { data: operationsData, isLoading } = useCollection(operationsRef);

  const stats = useMemo(() => {
    if (!operationsData) {
      return {
        semapachCuts: 0,
        servisCuts: 0,
        semapachReconnections: 0,
        servisReconnections: 0,
      };
    }

    const semapachCuts = operationsData
      .filter(op => op.entity === 'semapach' && op.operationType === 'cut')
      .reduce((sum, op) => sum + op.quantity, 0);

    const servisCuts = operationsData
      .filter(op => op.entity === 'servis' && op.operationType === 'cut')
      .reduce((sum, op) => sum + op.quantity, 0);

    const semapachReconnections = operationsData
      .filter(op => op.entity === 'semapach' && op.operationType === 'reconnection')
      .reduce((sum, op) => sum + op.quantity, 0);

    const servisReconnections = operationsData
      .filter(op => op.entity === 'servis' && op.operationType === 'reconnection')
      .reduce((sum, op) => sum + op.quantity, 0);

    return { semapachCuts, servisCuts, semapachReconnections, servisReconnections };
  }, [operationsData]);

  const StatCard = ({ title, value, description, icon, isLoading, borderColor }: { title: string, value: number, description: string, icon: React.ReactNode, isLoading: boolean, borderColor: string }) => (
    <Card className={`border-l-4 ${borderColor}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : formatNumber(value)}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-4">
        <div className="flex justify-end">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className="w-full sm:w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={es}
                    defaultMonth={selectedDate}
                    />
                </PopoverContent>
            </Popover>
        </div>
        <div className="grid gap-4 grid-cols-2">
            <StatCard 
                title="Cortes SEMAPACH" 
                value={stats.semapachCuts} 
                description={`Total en ${format(selectedDate, 'LLLL', { locale: es })}`}
                icon={<Scissors className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
                borderColor="border-red-500"
            />
            <StatCard 
                title="Cortes SERVIS" 
                value={stats.servisCuts} 
                description="Total por la entidad"
                icon={<Building className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
                borderColor="border-amber-500"
            />
            <StatCard 
                title="Reaperturas SEMAPACH" 
                value={stats.semapachReconnections} 
                description="Total de reconexiones"
                icon={<Repeat className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
                borderColor="border-green-500"
            />
            <StatCard 
                title="Reaperturas SERVIS" 
                value={stats.servisReconnections} 
                description="Total por la entidad"
                icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
                borderColor="border-sky-500"
            />
        </div>
    </div>
  );
}