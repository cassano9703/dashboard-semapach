'use client';

import { useMemo } from 'react';
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
import { getMonth, getYear, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  
const formatNumber = (value: number) =>
  value.toLocaleString('es-PE');

interface RecoveredSummaryProps {
  selectedDate: Date;
}

export function RecoveredSummary({ selectedDate }: RecoveredSummaryProps) {
  const firestore = useFirestore();

  const servicesRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_services'), orderBy('date', 'desc')) : null),
    [firestore]
  );
  const { data: servicesData, isLoading } = useCollection(servicesRef);

  const tableData = useMemo(() => {
    if (!servicesData) {
      return [];
    }
    
    const selectedMonthStr = format(selectedDate, 'yyyy-MM');
    const totals = new Map<string, { recoveredCount: number; recoveredAmount: number }>();

    servicesData.forEach(item => {
      if (item.date.startsWith(selectedMonthStr)) {
        const current = totals.get(item.district) || { recoveredCount: 0, recoveredAmount: 0 };
        current.recoveredCount += item.recoveredCount;
        current.recoveredAmount += item.recoveredAmount;
        totals.set(item.district, current);
      }
    });
    
    return Array.from(totals.entries())
        .map(([district, data]) => ({
            name: district,
            'Recuperados (Cantidad)': data.recoveredCount,
            'Monto (S/)': data.recoveredAmount
        }))
        .filter(d => d['Recuperados (Cantidad)'] > 0 || d['Monto (S/)'] > 0)
        .sort((a,b) => b['Monto (S/)'] - a['Monto (S/)']);

  }, [servicesData, selectedDate]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Recuperados</CardTitle>
        <CardDescription>
            Datos correspondientes al mes de {format(selectedDate, 'LLLL', { locale: es })} de {getYear(selectedDate)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando datos...</div>
        ) : tableData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos para mostrar en este mes.</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-table-header text-table-header-foreground">
                    <TableRow>
                        <TableHead>Distrito</TableHead>
                        <TableHead className="text-right">Recuperados (Cantidad)</TableHead>
                        <TableHead className="text-right">Monto (S/)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableData.map(item => (
                        <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{formatNumber(item['Recuperados (Cantidad)'])}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item['Monto (S/)'])}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
