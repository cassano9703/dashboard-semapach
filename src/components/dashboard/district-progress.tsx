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
  CardFooter
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
import { CheckCircle2, Download, Goal, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

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
      }))
      .sort((a, b) => b.progress - a.progress);
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
        const pdf = new jsPDF('p', 'mm', 'a4', true);
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
    <div ref={pdfRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Avance de Meta Mensual por Distrito</h1>
              <p className="text-muted-foreground">
                {lastUpdatedText}
              </p>
          </div>
          <Button id="download-pdf-button" onClick={handleDownloadPdf} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
          </Button>
      </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[280px]">
            Cargando datos...
          </div>
        ) : dataForCurrentMonth.length === 0 ? (
          <Card>
            <CardContent className="flex justify-center items-center h-[280px]">
                <p className="text-muted-foreground">
                    No hay datos de avance para el mes actual.
                </p>
            </CardContent>
          </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dataForCurrentMonth.map((item) => {
                const goalReached =
                  item.recovered >= item.monthlyGoal && item.monthlyGoal > 0;
                return (
                  <Card key={item.id} className={cn("flex flex-col", goalReached && 'border-green-600 bg-green-50 dark:bg-green-950/30')}>
                      <CardHeader className="pb-4">
                          <CardTitle className="text-lg">{item.district}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                          <div className="flex justify-between items-baseline">
                              <span className="text-sm text-muted-foreground">Recuperado</span>
                              <span className="text-2xl font-bold">{formatCurrency(item.recovered)}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                              <span className="text-sm text-muted-foreground">Meta</span>
                              <span className="text-lg font-semibold text-muted-foreground">{formatCurrency(item.monthlyGoal)}</span>
                          </div>
                          {goalReached ? (
                              <div className="flex items-center gap-2 text-green-600 font-semibold pt-2">
                                  <CheckCircle2 className="h-5 w-5" />
                                  <span>Meta Cumplida y Superada</span>
                              </div>
                          ) : (
                              <div className="space-y-1 pt-2">
                                  <div className="flex justify-between items-center text-sm">
                                      <span>Avance</span>
                                      <span className="font-semibold">{Math.round(item.progress)}%</span>
                                  </div>
                                  <Progress value={item.progress} className="h-2" />
                              </div>
                          )}
                      </CardContent>
                      <CardFooter>
                          <p className={cn("text-sm font-medium w-full text-center", goalReached ? "text-green-700 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
                            {goalReached ? `¡Superado por ${formatCurrency(item.recovered - item.monthlyGoal)}!` : `Faltan ${formatCurrency(item.difference)}`}
                          </p>
                      </CardFooter>
                  </Card>
                );
              })}
            </div>
        )}
    </div>
  );
}
