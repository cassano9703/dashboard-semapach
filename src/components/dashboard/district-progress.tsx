
'use client';
import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const districtsInOrder = [
  "Chincha Alta",
  "Pueblo Nuevo",
  "Grocio Prado",
  "Sunampe",
  "Chincha Baja",
  "Tambo de Mora",
  "Alto Laran",
  "El Carmen",
  "San Juan de Yanac",
  "San Pedro de Huacarpana",
  "Chavin",
  "San Clemente",
];

export function DistrictProgress() {
  const firestore = useFirestore();

  const districtProgressRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'district_progress')) : null),
    [firestore]
  );
  const { data: districtProgressData, isLoading } =
    useCollection(districtProgressRef);

  const dataForCurrentMonth = useMemo(() => {
    if (!districtProgressData) return [];

    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const filteredData = districtProgressData.filter(
      (item: any) => item.month === currentMonthStr
    );

    const dataMap = new Map(
      filteredData.map((item: any) => [item.district, item])
    );

    return districtsInOrder.map((districtName) => {
      const data = dataMap.get(districtName);
      return {
        district: districtName,
        recovered: data?.recovered || 0,
        monthlyGoal: data?.monthlyGoal || 0,
        progress:
          data && data.monthlyGoal > 0
            ? (data.recovered / data.monthlyGoal) * 100
            : 0,
      };
    });
  }, [districtProgressData]);

  const lastUpdated = useMemo(() => {
    if (!districtProgressData || districtProgressData.length === 0) return null;
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const dataForMonth = districtProgressData.filter((item: any) => item.month === currentMonthStr);
    
    const latestTimestamp = dataForMonth.reduce((latest, item) => {
      if (!item.updatedAt) return latest;
      const itemTimestamp = item.updatedAt.toDate();
      return latest === null || itemTimestamp > latest ? itemTimestamp : latest;
    }, null as Date | null);
    
    return latestTimestamp;
  }, [districtProgressData]);

  const lastUpdatedText = lastUpdated
    ? `Última actualización: ${format(lastUpdated, "d 'de' LLLL 'a las' hh:mm a", { locale: es })}`
    : 'Datos para el mes actual.';


  return (
    <>
      <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Avance de Meta Mensual por Distrito</h1>
          <p className="text-muted-foreground">
            {lastUpdatedText}
          </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Distritos</CardTitle>
          <CardDescription>
            Resumen del avance de recaudación por distrito para el mes en curso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-table-header text-table-header-foreground">
                <TableRow>
                  <TableHead className="w-[200px]">Distrito</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="text-right">Recuperado</TableHead>
                  <TableHead className="text-right">Meta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Cargando datos...
                    </TableCell>
                  </TableRow>
                ) : dataForCurrentMonth.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No hay datos de avance para el mes actual.
                    </TableCell>
                  </TableRow>
                ) : (
                  dataForCurrentMonth.map((item) => (
                    <TableRow
                      key={item.district}
                      className={item.progress >= 100 ? 'bg-green-100 dark:bg-green-900/30' : ''}
                    >
                      <TableCell className="font-medium">{item.district}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Progress value={item.progress} className="w-full" />
                          <span className="text-sm font-medium w-16 text-right">
                            {item.progress.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.recovered)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.monthlyGoal)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
