"use client";

import { useMemo, useRef } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { CheckCircle, Download } from 'lucide-react';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, PolarAngleAxis, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer } from '../ui/chart';

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

const chartConfig = {
  progress: {
    label: 'Avance',
  },
} satisfies ChartConfig;


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

    return districtsInOrder.map((districtName, index) => {
      const data = dataMap.get(districtName);
      const recovered = data?.recovered || 0;
      const monthlyGoal = data?.monthlyGoal || 0;
      const progress = monthlyGoal > 0 ? Math.min((recovered / monthlyGoal) * 100, 100) : 0;
      const faltante = monthlyGoal - recovered;

      return {
        district: districtName,
        recovered: recovered,
        monthlyGoal: monthlyGoal,
        progress: progress,
        faltante: faltante > 0 ? faltante : 0,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
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
    const elementToCapture = tableRef.current;
    if (!elementToCapture) {
      console.error("El elemento de la tabla no está disponible para capturar.");
      return;
    }

    html2canvas(elementToCapture, {
        scale: 2,
        backgroundColor: null, 
    }).then((canvas) => {
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
        if (pdfHeightPosition + imgHeight > pdf.internal.pageSize.getHeight() - 15) {
            pdf.addPage();
            pdfHeightPosition = 15;
        }

        pdf.addImage(imgData, 'PNG', 10, pdfHeightPosition, pdfWidth - 20, imgHeight);

        const monthYear = format(new Date(), 'yyyy-MM');
        pdf.save(`avance-distritos-${monthYear}.pdf`);
    });
  };
  
  const sortedChartData = [...dataForCurrentMonth].sort((a, b) => b.progress - a.progress);


  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Avance de Meta Mensual por Distrito</h1>
          <p className="text-muted-foreground">
            {lastUpdatedText}
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadPdf}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden" ref={tableRef}>
                <Table>
                  <TableHeader className="bg-table-header text-table-header-foreground">
                    <TableRow>
                      <TableHead className="w-[200px] py-4 uppercase">Distrito</TableHead>
                      <TableHead className="text-center py-4 uppercase">Recuperado</TableHead>
                      <TableHead className="text-center py-4 uppercase">Meta</TableHead>
                      <TableHead className="py-4 uppercase">Avance</TableHead>
                      <TableHead className="text-right py-4 uppercase">Faltante</TableHead>
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
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={item.progress}
                                    className="w-full"
                                  />
                                  <span className="text-sm font-medium w-10 text-right">
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
                  <TableFooter>
                    <TableRow className="bg-table-header hover:bg-table-header">
                        <TableCell colSpan={5} className="py-8"></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Avance por Distrito</CardTitle>
                <CardDescription>Visualización del progreso por distrito.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">Cargando gráfico...</div>
                ) : sortedChartData.length === 0 ? (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">No hay datos para mostrar.</div>
                ) : (
                    <ChartContainer config={chartConfig} className="w-full h-[350px]">
                        <ResponsiveContainer>
                            <RadialBarChart
                                data={sortedChartData}
                                innerRadius="10%"
                                outerRadius="105%"
                                barSize={12}
                                startAngle={90}
                                endAngle={-270}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar
                                    background
                                    dataKey="progress"
                                    angleAxisId={0}
                                />
                                <Tooltip
                                    content={({ payload }: TooltipProps) => {
                                      if (!payload || !payload.length) {
                                        return null;
                                      }
                                      const { district, progress } = payload[0].payload;
                                      return (
                                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                                          <p className="font-bold">{district}</p>
                                          <p>Avance: {progress.toFixed(2)}%</p>
                                        </div>
                                      );
                                    }}
                                />
                                <Legend
                                    iconSize={10}
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ right: -30 }}
                                    formatter={(value, entry) => (
                                        <span className="text-muted-foreground">{entry.payload.district}</span>
                                    )}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
      </div>
    </>
  );
}
