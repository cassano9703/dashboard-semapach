'use client';
import { useRef } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
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
import { Check, CheckCircle2, Download } from 'lucide-react';
import { Button } from '../ui/button';

const chartConfig = {
  recovered: {
    label: 'Recuperados',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function DistrictProgress() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const districtProgressRef = useMemoFirebase(
    () => (user ? collection(firestore, 'district_progress') : null),
    [user, firestore]
  );
  const { data: districtProgressData, isLoading: isDataLoading } =
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
      }));
  }, [districtProgressData]);

  const lastUpdated = useMemo(() => {
    if (!dataForCurrentMonth || dataForCurrentMonth.length === 0) return null;
    
    // Find the most recent updatedAt timestamp
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

    // Remove the download button from the capture
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
        const imgY = 15; // Margin top
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        const month = format(new Date(), 'yyyy-MM');
        pdf.save(`reporte-avance-distritos-${month}.pdf`);
        
        // Show the button again
        if (button) {
          (button as HTMLElement).style.display = 'flex';
        }
    });
  };
  
  const lastUpdatedText = lastUpdated
    ? `Última actualización: ${format(lastUpdated, "d 'de' LLLL 'a las' hh:mm a", { locale: es })}`
    : 'Datos para el mes actual.';

  const isLoading = isUserLoading || (user && isDataLoading);


  return (
    <Card ref={pdfRef}>
      <CardHeader>
        <div className="flex justify-between items-start">
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
      <CardContent className="grid gap-8 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-2 flex justify-center items-center h-[280px]">
            Cargando datos...
          </div>
        ) : !user ? (
           <div className="col-span-2 flex justify-center items-center h-[280px]">
            Por favor, inicie sesión para ver los datos.
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="text-right">Recuperados</TableHead>
                    <TableHead className="text-right">Meta</TableHead>
                    <TableHead className="w-[120px]">Avance</TableHead>
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
                          goalReached && 'bg-green-100 dark:bg-green-900/50'
                        )}
                      >
                        <TableCell className="font-medium flex items-center gap-2">
                          {goalReached && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          {item.district}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.recovered.toLocaleString('es-PE')}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.monthlyGoal.toLocaleString('es-PE')}
                        </TableCell>
                        <TableCell>
                          {goalReached ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="text-xs font-semibold">
                                Cumplido
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Progress value={item.progress} className="h-2" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(item.progress)}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="h-[280px] w-full">
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={dataForCurrentMonth}
                  layout="vertical"
                  margin={{
                    left: 10,
                    right: 40,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="district"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 12)}
                    className="text-xs"
                  />
                  <XAxis dataKey="recovered" type="number" hide />
                  <Tooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => Number(value).toLocaleString('es-PE')}
                      />
                    }
                  />
                  <Bar
                    dataKey="recovered"
                    fill="hsl(var(--primary))"
                    radius={5}
                  >
                    <LabelList
                      position="right"
                      offset={10}
                      className="fill-foreground text-sm"
                      formatter={(value: number) => {
                        const item = dataForCurrentMonth.find(
                          (d) => d.recovered === value
                        );
                        return item
                          ? `${(value / 1000).toFixed(1)}k (${
                              item.monthlyGoal > 0
                                ? ((value / item.monthlyGoal) * 100).toFixed(0)
                                : 0
                            }%)`
                          : '';
                      }}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
