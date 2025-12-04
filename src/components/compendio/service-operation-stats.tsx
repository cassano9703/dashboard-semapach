"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Repeat, Building, UserCog } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatNumber = (value: number) => value.toLocaleString('es-PE');

interface ServiceOperationStatsProps {
    selectedDate: Date;
}

export function ServiceOperationStats({ selectedDate }: ServiceOperationStatsProps) {
  const firestore = useFirestore();
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
  );
}
