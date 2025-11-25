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
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const districts = [
  "Chincha Alta",
  "Grocio Prado",
  "Pueblo Nuevo",
  "Alto Laran",
  "Sunampe",
  "Tambo de Mora",
  "Chincha Baja",
];

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

  const districtsWithData = useMemo(() => {
    if (!servicesData) {
      return [];
    }

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const totals = new Map<string, { recoveredCount: number; recoveredAmount: number }>();

    servicesData.forEach(item => {
      const itemDate = parseISO(item.date + 'T00:00:00');
      
      if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
        const current = totals.get(item.district) || { recoveredCount: 0, recoveredAmount: 0 };
        current.recoveredCount += item.recoveredCount;
        current.recoveredAmount += item.recoveredAmount;
        totals.set(item.district, current);
      }
    });
    
    return districts
        .map(district => ({
            district,
            ... (totals.get(district) || { recoveredCount: 0, recoveredAmount: 0 })
        }))
        .filter(d => d.recoveredCount > 0 || d.recoveredAmount > 0)
        .sort((a,b) => b.recoveredAmount - a.recoveredAmount);


  }, [servicesData, selectedDate]);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Usuarios Recuperados</CardTitle>
            <CardDescription>
              Datos correspondientes al mes de {format(selectedDate, "LLLL 'de' yyyy", { locale: es })}.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <div className="relative max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center p-8">Cargando datos...</div>
            ) : districtsWithData.length === 0 ? (
                 <div className="text-center p-8 text-muted-foreground">
                    No hay usuarios recuperados para el mes seleccionado.
                </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-table-header text-table-header-foreground z-10">
                  <TableRow>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="w-[200px] text-right">Recuperados (Cantidad)</TableHead>
                    <TableHead className="w-[200px] text-right">Monto (S/)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {districtsWithData.map((data) => {
                    return (
                      <TableRow key={data.district}>
                        <TableCell className="font-medium">{data.district}</TableCell>
                        <TableCell className="text-right">{data.recoveredCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.recoveredAmount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
