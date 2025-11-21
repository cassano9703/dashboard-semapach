"use client";

import { useMemo, useRef } from 'react';
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
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Download } from 'lucide-react';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatCurrency = (value: number) =>
  `${value.toLocaleString('es-PE', {
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
  const tableRef = useRef(null);

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
      const recovered = data?.recovered || 0;
      const monthlyGoal = data?.monthlyGoal || 0;
      const progress = monthlyGoal > 0 ? (recovered / monthlyGoal) * 100 : 0;
      const faltante = monthlyGoal - recovered;

      return {
        district: districtName,
        recovered: recovered,
        monthlyGoal: monthlyGoal,
        progress: progress,
        faltante: faltante > 0 ? faltante : 0,
      };
    }).filter(item => item.recovered > 0 || item.monthlyGoal > 0);
  }, [districtProgressData]);

  const lastUpdated = useMemo(() => {
    if (!districtProgressData || districtProgressData.length === 0) return null;
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const dataForMonth = districtProgressData.filter((item: any) => item.month === currentMonthStr);
    
    if (dataForMonth.length === 0) return null;

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
    
  const handleDownloadPdf = () => {
    if (!tableRef.current) return;

    // Temporarily remove hover effects for capture
    const tableRows = (tableRef.current as HTMLElement).querySelectorAll('tr');
    tableRows.forEach(row => row.classList.add('no-hover'));

    html2canvas(tableRef.current, {
        scale: 2, // Increase scale for better quality
        backgroundColor: null, // Use transparent background for canvas
    }).then((canvas) => {
        // Restore hover effects
        tableRows.forEach(row => row.classList.remove('no-hover'));

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        const headerText = "AVANCE DE META MENSUAL POR DISTRITO";
        
        pdf.setFontSize(16);
        pdf.text(headerText, pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(lastUpdatedText, pdf.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
        
        let pdfHeightPosition = 35;
        // Check if there is enough space, if not, add a new page
        if (pdfHeightPosition + imgHeight > pdf.internal.pageSize.getHeight() - 15) {
            pdf.addPage();
            pdfHeightPosition = 15;
        }

        pdf.addImage(imgData, 'PNG', 10, pdfHeightPosition, pdfWidth - 20, imgHeight);

        const monthYear = format(new Date(), 'yyyy-MM');
        pdf.save(`avance-distritos-${monthYear}.pdf`);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        .no-hover:hover {
          background-color: inherit !important;
        }
      `}</style>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Avance de Meta Mensual por Distrito</h1>
          <p className="text-muted-foreground">
            {lastUpdatedText}
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadPdf}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden" ref={tableRef}>
              <Table>
                <TableHeader className="bg-table-header text-table-header-foreground">
                  <TableRow className="no-hover">
                    <TableHead className="w-[200px]">Distrito</TableHead>
                    <TableHead className="text-center">Recuperado</TableHead>
                    <TableHead className="text-center">Meta</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead className="text-right">Faltante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Cargando datos...
                      </TableCell>
                    </TableRow>
                  ) : dataForCurrentMonth.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No hay datos de avance para el mes actual.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataForCurrentMonth.map((item) => (
                      <TableRow
                        key={item.district}
                        className={item.progress >= 100 ? 'bg-green-100/70 dark:bg-green-900/20' : ''}
                      >
                        <TableCell className="font-medium">{item.district}</TableCell>
                        <TableCell className="text-center font-bold">{formatCurrency(item.recovered)}</TableCell>
                        <TableCell className="text-center">{formatCurrency(item.monthlyGoal)}</TableCell>
                        <TableCell>
                          {item.progress >= 100 ? (
                              <div className="flex items-center gap-2 text-green-600 font-semibold">
                                  <CheckCircle className="h-5 w-5" />
                                  <span>Meta Cumplida</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-4">
                                <Progress value={item.progress} className="w-full h-2" />
                                <span className="text-sm font-medium w-16 text-right">
                                  {item.progress.toFixed(0)}%
                                </span>
                              </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {item.progress >= 100 ? (
                            <span className="text-green-600">¡Superado!</span>
                          ) : (
                            <span className="text-orange-500">{formatCurrency(item.faltante)}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
