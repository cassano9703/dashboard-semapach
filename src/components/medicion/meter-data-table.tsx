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
import { cn } from '@/lib/utils';

const formatPercent = (value?: number) => {
  if (value === undefined || value === null) return '-';
  return `${(value * 100).toFixed(2)}%`;
};

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('es-PE');
};

const descriptions = [
  { key: 'coverage', label: 'COBERTURA', format: formatPercent },
  { key: 'micrometering_tariff_study', label: 'MICROMED. % (E. T.)', format: formatPercent },
  { key: 'micrometering_percentage', label: 'MICROMED. %', format: formatPercent },
  { key: 'meter_quantity', label: 'MEDIDORES', format: formatNumber },
];

interface MeterDataTableProps {
    year: number;
}

export function MeterDataTable({ year }: MeterDataTableProps) {
  const firestore = useFirestore();

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
  
  const hasData = useMemo(() => {
      if (!meterData) return false;
      const yearStr = year.toString();
      return meterData.some(item => item.month.startsWith(yearStr));
  }, [meterData, year]);


  if (isLoading) {
    return <div className="text-center p-8">Cargando datos...</div>;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto relative max-h-[350px]">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-table-header hover:bg-table-header">
                <TableHead className="font-bold sticky left-0 z-20 bg-table-header w-1/4 text-table-header-foreground">DESCRIPCION</TableHead>
                {months.map(month => {
                  const isAugust = format(month, 'MMM', { locale: es }).toUpperCase() === 'AGO';
                  return (
                    <TableHead 
                        key={format(month, 'yyyy-MM')} 
                        className={cn(
                            "font-bold text-center text-table-header-foreground",
                            isAugust && "bg-black text-white"
                        )}
                    >
                      {format(month, 'MMM', { locale: es }).toUpperCase()}
                    </TableHead>
                  );
                })}
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
                    <TableCell className="font-bold sticky left-0 bg-table-header text-table-header-foreground z-10">{desc.label}</TableCell>
                    {months.map(month => {
                        const monthKey = format(month, 'yyyy-MM');
                        const data = dataByMonth.get(monthKey);
                        const value = data ? data[desc.key] : undefined;
                        const isAugust = format(month, 'MMM', { locale: es }).toUpperCase() === 'AGO';
                        return (
                        <TableCell 
                            key={monthKey} 
                            className={cn(
                                "text-center",
                                isAugust && "font-bold bg-muted"
                            )}
                        >
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
