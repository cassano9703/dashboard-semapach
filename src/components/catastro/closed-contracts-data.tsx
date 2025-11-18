"use client";

import { useState, useMemo } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function ClosedContractsData() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const firestore = useFirestore();

  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'closed_contracts'), orderBy('month', 'asc')) : null),
    [firestore]
  );
  const { data, isLoading } = useCollection(dataRef);

  const tableData = useMemo(() => {
    if (!data) return [];

    const selectedMonthStr = format(selectedDate, 'yyyy-MM');
    
    return data
      .filter(item => item.month === selectedMonthStr && item.quantity > 0)
      .map((item, index) => ({
        ...item,
        item: index + 1,
      }));

  }, [data, selectedDate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Resumen Mensual de Contratos Cerrados</CardTitle>
              <CardDescription>
                Datos de contratos cerrados para el mes seleccionado.
              </CardDescription>
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
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={{ after: new Date() }}
                  initialFocus
                  locale={es}
                  defaultMonth={selectedDate}
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardHeader>
      <CardContent>
         <div className="border rounded-lg overflow-hidden">
              <div className="relative max-h-96 overflow-y-auto">
                  {isLoading ? (
                  <div className="text-center p-8">Cargando datos...</div>
                  ) : tableData.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">No hay contratos cerrados para el mes seleccionado.</div>
                  ) : (
                  <Table>
                      <TableHeader className="sticky top-0 bg-table-header text-table-header-foreground z-10">
                      <TableRow>
                          <TableHead className="w-[80px]">Ítem</TableHead>
                          <TableHead>Distrito</TableHead>
                          <TableHead className="w-[150px] text-right">Cantidad</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {tableData.map((item) => (
                          <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell>{item.district}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          </TableRow>
                      ))}
                      </TableBody>
                  </Table>
                  )}
              </div>
          </div>
      </CardContent>
    </Card>
  );
}
