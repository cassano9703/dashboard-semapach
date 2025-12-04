"use client";

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, PolarAngleAxis, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer } from '../ui/chart';

const districtsInOrder = [
  "Chincha Alta", "Pueblo Nuevo", "Grocio Prado", "Sunampe", "Chincha Baja",
  "Tambo de Mora", "Alto Laran", "El Carmen", "San Juan de Yanac",
  "San Pedro de Huacarpana", "Chavin", "San Clemente",
];

const chartConfig = {
  progress: {
    label: 'Avance',
  },
} satisfies ChartConfig;

export function DistrictProgressChart() {
  const firestore = useFirestore();

  const districtProgressRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'district_progress')) : null),
    [firestore]
  );
  const { data: districtProgressData, isLoading } = useCollection(districtProgressRef);

  const chartData = useMemo(() => {
    if (!districtProgressData) return [];

    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const filteredData = districtProgressData.filter((item: any) => item.month === currentMonthStr);

    const dataMap = new Map(filteredData.map((item: any) => [item.district, item]));

    return districtsInOrder.map((districtName, index) => {
      const data = dataMap.get(districtName);
      const recovered = data?.recovered || 0;
      const monthlyGoal = data?.monthlyGoal || 0;
      const progress = monthlyGoal > 0 ? Math.min((recovered / monthlyGoal) * 100, 100) : 0;

      return {
        district: districtName,
        progress: progress,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    }).filter(item => item.progress > 0);
  }, [districtProgressData]);

  const sortedChartData = [...chartData].sort((a, b) => b.progress - a.progress);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Conexiones Inactivas</CardTitle>
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
                <RadialBar background dataKey="progress" angleAxisId={0} />
                <Tooltip
                  content={({ payload }: TooltipProps) => {
                    if (!payload || !payload.length) return null;
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
  );
}
