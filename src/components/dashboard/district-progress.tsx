'use client';
import { useRef } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
import { Progress } from '../ui/progress';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CheckCircle2, Download } from 'lucide-react';
import { Button } from '../ui/button';

export function DistrictProgress() {
  const firestore = useFirestore();

  const districtProgressRef = useMemoFirebase(
    () => collection(firestore, 'district_progress'),
    [firestore]
  );
  const { data: districtProgressData, isLoading } =
    useCollection(districtProgressRef);

  const pdfRef = useRef<HTMLDivElement>(null);

  const dataForCurrentMonth = useMemo(() => {
    if (!districtProgressData) return [];

    const currentMonthStr = format(new Date(), 'yyyy-MM');

    return districtProgressData
      .filter((item: any) => item.month === currentMonthStr)
      .map((item: any) => ({
        ...item,
        progress:
          item.monthlyGoal > 0 ? (item.recovered / item.monthlyGoal) * 100 : 0,
        difference: Math.max(0, item.monthlyGoal - item.recovered),
      }));
  }, [districtProgressData]);

  const lastUpdated = useMemo(() => {
    if (!dataForCurrentMonth || dataForCurrentMonth.length === 0) return null;
    
    const latestTimestamp = dataForCurrentMonth.reduce((latest, item) => {
      if (!item.updatedAt) return latest;
      const itemTimestamp = item.updatedAt.toDate();
      return latest === null || itemTimestamp > latest ? itemTimestamp : latest;
    }, null as Date | null);
    
    return latestTimestamp;
  }, [dataForCurrentMonth]);

  const handleDownloadPdf = () => {
    const input = pdfRef.current;
    if (!input) return;

    const button = input.querySelector('#download-pdf-button');
    if (button) {
      (button as HTMLElement).style.display = 'none';
    }
    
    html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4', true);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 15;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        const month = format(new Date(), 'yyyy-MM');
        pdf.save(`reporte-avance-distritos-${month}.pdf`);
        
        if (button) {
          (button as HTMLElement).style.display = 'flex';
        }
    });
  };
  
  const lastUpdatedText = lastUpdated
    ? `Última actualización: ${format(lastUpdated, "d 'de' LLLL 'a las' hh:mm a", { locale: es })}`
    : 'Datos para el mes actual.';

  return (
    <Card ref={pdfRef}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>Avance de Meta Mensual por Distrito</CardTitle>
                <CardDescription>
                  {lastUpdatedText}
                </CardDescription>
            </div>
            <Button id="download-pdf-button" onClick={handleDownloadPdf} size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[280px]">
            Cargando datos...
          </div>
        ) : dataForCurrentMonth.length === 0 ? (
          <div className="flex justify-center items-center h-[280px] text-muted-foreground">
              No hay datos de avance para el mes actual.
          </div>
        ) : (
            <div className="flex flex-col">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="w-[120px] text-right">Recuperado</TableHead>
                    <TableHead className="w-[120px] text-right">Meta</TableHead>
                    <TableHead className="w-[200px]">Avance</TableHead>
                    <TableHead className="w-[150px] text-right">Faltante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataForCurrentMonth.map((item) => {
                    const goalReached =
                      item.recovered >= item.monthlyGoal && item.monthlyGoal > 0;
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          goalReached && 'bg-green-50 dark:bg-green-900/20'
                        )}
                      >
                        <TableCell className="font-medium">
                          {item.district}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.recovered.toLocaleString('es-PE')}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.monthlyGoal.toLocaleString('es-PE')}
                        </TableCell>
                        <TableCell>
                          {goalReached ? (
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                              <CheckCircle2 className="h-5 w-5" />
                              <span>Meta Cumplida</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Progress value={item.progress} className="h-2" />
                              <span className="text-xs font-semibold text-muted-foreground w-10 text-right">
                                {Math.round(item.progress)}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={cn("text-right font-medium", goalReached ? "text-green-600" : "text-amber-600")}>
                          {goalReached ? '¡Superado!' : `${item.difference.toLocaleString('es-PE')}`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
