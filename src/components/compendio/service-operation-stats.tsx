"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Repeat, Building, UserCog } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';

const formatNumber = (value: number) => value.toLocaleString('es-PE');

export function ServiceOperationStats() {
  const firestore = useFirestore();
  const currentMonth = format(new Date(), 'yyyy-MM');

  const operationsRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'service_operations'), where('month', '==', currentMonth)) : null),
    [firestore, currentMonth]
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

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cortes SEMAPACH</CardTitle>
          <Scissors className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.semapachCuts)}</div>
          <p className="text-xs text-muted-foreground">Total de cortes en el mes actual.</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cortes SERVIS</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.servisCuts)}</div>
          <p className="text-xs text-muted-foreground">Total de cortes por la entidad.</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reaperturas SEMAPACH</CardTitle>
          <Repeat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.semapachReconnections)}</div>
          <p className="text-xs text-muted-foreground">Total de reconexiones en el mes.</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-sky-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reaperturas SERVIS</CardTitle>
          <UserCog className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.servisReconnections)}</div>
          <p className="text-xs text-muted-foreground">Total de reconexiones por la entidad.</p>
        </CardContent>
      </Card>
    </div>
  );
}
