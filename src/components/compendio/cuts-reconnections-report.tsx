"use client";

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const formatNumber = (value: number) => value.toLocaleString('es-PE');

export function CutsAndReconnectionsReport() {
  const firestore = useFirestore();
  const [year, setYear] = useState(new Date().getFullYear());

  const dataRef = useMemoFirebase(
    () => {
      if (!firestore) return null;
      const yearStr = year.toString();
      return query(
        collection(firestore, 'service_operations'),
        where => where('month', '>=', `${yearStr}-01`),
        where => where('month', '<=', `${yearStr}-12`),
        orderBy('month', 'asc')
      );
    },
    [firestore, year]
  );
  const { data, isLoading } = useCollection(dataRef);

  const months = useMemo(() => {
    const yearDate = new Date(year, 0, 1);
    return eachMonthOfInterval({
      start: startOfYear(yearDate),
      end: endOfYear(yearDate),
    });
  }, [year]);

  const reportData = useMemo(() => {
    if (!data) return {};

    const monthlyData: Record<string, any> = {};

    data.forEach(item => {
      if (!monthlyData[item.month]) {
        monthlyData[item.month] = {
          semapachCuts: 0,
          semapachReconnections: 0,
          servisCuts: 0,
          servisReconnections: 0,
        };
      }

      if (item.operationType === 'cut') {
        if (item.entity === 'semapach') {
          monthlyData[item.month].semapachCuts += item.quantity;
        } else if (item.entity === 'servis') {
          monthlyData[item.month].servisCuts += item.quantity;
        }
      } else if (item.operationType === 'reconnection') {
        if (item.entity === 'semapach') {
          monthlyData[item.month].semapachReconnections += item.quantity;
        } else if (item.entity === 'servis') {
          monthlyData[item.month].servisReconnections += item.quantity;
        }
      }
    });

    return monthlyData;
  }, [data]);
  
  const handleYearChange = (date: Date | undefined) => {
    if (date) {
      setYear(date.getFullYear());
    }
  };

  const getYearTotals = (field: string) => {
      return Object.values(reportData).reduce((acc, monthData) => acc + (monthData[field] || 0), 0);
  }

  const totals = {
      semapachCuts: getYearTotals('semapachCuts'),
      servisCuts: getYearTotals('servisCuts'),
      semapachReconnections: getYearTotals('semapachReconnections'),
      servisReconnections: getYearTotals('servisReconnections'),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Cortes y Reaperturas de Servicios</CardTitle>
                <CardDescription>
                    Reporte anual de operaciones de corte y reapertura por entidad.
                </CardDescription>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full sm:w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Año {year}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={new Date(year, 0, 1)}
                    onSelect={handleYearChange}
                    initialFocus
                    locale={es}
                    defaultMonth={new Date(year, 0, 1)}
                  />
                </PopoverContent>
              </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-auto">
            <Table>
            <TableHeader className="bg-table-header text-table-header-foreground">
                <TableRow>
                <TableHead rowSpan={2} className="text-center align-middle border-r sticky left-0 bg-table-header z-10">MES</TableHead>
                <TableHead colSpan={2} className="text-center border-r">CORTES</TableHead>
                <TableHead colSpan={2} className="text-center border-r">REAPERTURAS</TableHead>
                <TableHead colSpan={2} className="text-center">TOTAL</TableHead>
                </TableRow>
                <TableRow>
                <TableHead className="text-center border-r">SEMAPACH</TableHead>
                <TableHead className="text-center border-r">SERVIS</TableHead>
                <TableHead className="text-center border-r">SEMAPACH</TableHead>
                <TableHead className="text-center border-r">SERVIS</TableHead>
                <TableHead className="text-center font-bold">CORTES</TableHead>
                <TableHead className="text-center font-bold">REAPERTURAS</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-60 text-center">Cargando datos...</TableCell>
                    </TableRow>
                ) : (
                    <>
                        {months.map(month => {
                            const monthKey = format(month, 'yyyy-MM');
                            const monthData = reportData[monthKey] || {};
                            const totalCuts = (monthData.semapachCuts || 0) + (monthData.servisCuts || 0);
                            const totalReconnections = (monthData.semapachReconnections || 0) + (monthData.servisReconnections || 0);

                            return (
                                <TableRow key={monthKey}>
                                    <TableCell className="font-medium capitalize sticky left-0 bg-background z-10">{format(month, 'LLLL', { locale: es })}</TableCell>
                                    <TableCell className="text-center">{formatNumber(monthData.semapachCuts || 0)}</TableCell>
                                    <TableCell className="text-center">{formatNumber(monthData.servisCuts || 0)}</TableCell>
                                    <TableCell className="text-center">{formatNumber(monthData.semapachReconnections || 0)}</TableCell>
                                    <TableCell className="text-center">{formatNumber(monthData.servisReconnections || 0)}</TableCell>
                                    <TableCell className="text-center font-bold">{formatNumber(totalCuts)}</TableCell>
                                    <TableCell className="text-center font-bold">{formatNumber(totalReconnections)}</TableCell>
                                </TableRow>
                            );
                        })}
                         <TableRow className="font-bold bg-table-header">
                            <TableCell className="sticky left-0 bg-table-header z-10">TOTAL</TableCell>
                            <TableCell className="text-center">{formatNumber(totals.semapachCuts)}</TableCell>
                            <TableCell className="text-center">{formatNumber(totals.servisCuts)}</TableCell>
                            <TableCell className="text-center">{formatNumber(totals.semapachReconnections)}</TableCell>
                            <TableCell className="text-center">{formatNumber(totals.servisReconnections)}</TableCell>
                            <TableCell className="text-center">{formatNumber(totals.semapachCuts + totals.servisCuts)}</TableCell>
                            <TableCell className="text-center">{formatNumber(totals.semapachReconnections + totals.servisReconnections)}</TableCell>
                        </TableRow>
                    </>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
