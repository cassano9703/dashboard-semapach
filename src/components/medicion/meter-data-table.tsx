"use client";

import { useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { eachMonthOfInterval, format, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

const formatPercent = (value?: number) => {
  if (value === undefined || value === null) return '-';
  return `${(value * 100).toFixed(2)}%`;
};

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('es-PE');
};

const descriptions = [
  { key: 'coverage', label: 'COBERTURA', format: formatPercent },
  { key: 'micrometering_tariff_study', label: 'MICROMEDICION % (ESTUDIO TARIFARIO)', format: formatPercent },
  { key: 'micrometering_percentage', label: 'MICROMEDICION %', format: formatPercent },
  { key: 'meter_quantity', label: 'CANTIDAD DE MEDIDORES', format: formatNumber },
];

export function MeterDataTable() {
  const firestore = useFirestore();
  const year = 2025;

  const meterDataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'meter_data'), orderBy('month', 'asc')) : null),
    [firestore]
  );
  const { data: meterData, isLoading } = useCollection(meterDataRef);

  const months = useMemo(() => {
    const yearDate = new Date(year, 0, 1);
    return eachMonthOfInterval({
      start: startOfYear(yearDate),
      end: endOfYear(yearDate),
    });
  }, [year]);

  const dataByMonth = useMemo(() => {
    if (!meterData) return new Map();
    const map = new Map();
    meterData.forEach(item => {
      map.set(item.month, item);
    });
    return map;
  }, [meterData]);

  if (isLoading) {
    return <div className="text-center p-8">Cargando datos...</div>;
  }
  
  const hasData = useMemo(() => meterData && meterData.length > 0, [meterData]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-black hover:bg-black">
                <TableHead className="text-white font-bold sticky left-0 bg-black z-10 w-1/4">DESCRIPCION</TableHead>
                {months.map(month => (
                  <TableHead key={format(month, 'yyyy-MM')} className="text-white font-bold text-center">
                    {format(month, 'MMM-yy', { locale: es }).toUpperCase()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!hasData ? (
                 <TableRow>
                    <TableCell colSpan={months.length + 1} className="text-center py-8 text-muted-foreground">
                        No hay datos de medición para mostrar.
                    </TableCell>
                </TableRow>
              ) : (
                descriptions.map(desc => (
                    <TableRow key={desc.key}>
                    <TableCell className="font-bold sticky left-0 bg-card z-10">{desc.label}</TableCell>
                    {months.map(month => {
                        const monthKey = format(month, 'yyyy-MM');
                        const data = dataByMonth.get(monthKey);
                        const value = data ? data[desc.key] : undefined;
                        return (
                        <TableCell key={monthKey} className="text-center">
                            {desc.format(value)}
                        </TableCell>
                        );
                    })}
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
