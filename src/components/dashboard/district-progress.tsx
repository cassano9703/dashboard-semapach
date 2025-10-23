'use client';
import {
  collection,
} from 'firebase/firestore';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';

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
import {Progress} from '../ui/progress';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, CheckCircle2 } from 'lucide-react';

const chartConfig = {
  recovered: {
    label: 'Recuperados',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function DistrictProgress() {
  const firestore = useFirestore();
  const districtProgressRef = useMemoFirebase(
    () => collection(firestore, 'district_progress'),
    [firestore]
  );
  const { data: districtProgressData, isLoading } = useCollection(districtProgressRef);

  const dataForCurrentMonth = useMemo(() => {
    if (!districtProgressData) return [];
    
    const currentMonthStr = format(new Date(), 'yyyy-MM');

    return districtProgressData
      .filter((item: any) => item.month === currentMonthStr)
      .map((item: any) => ({
        ...item,
        progress: item.monthlyGoal > 0 ? (item.recovered / item.monthlyGoal) * 100 : 0,
    }));
  }, [districtProgressData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Avance de Meta Mensual por Distrito</CardTitle>
        <CardDescription>
          Unidades recuperadas por distrito vs. la meta mensual para el mes actual.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-2 flex justify-center items-center h-[280px]">Cargando...</div>
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
                    const goalReached = item.recovered >= item.monthlyGoal && item.monthlyGoal > 0;
                    return (
                      <TableRow key={item.id} className={cn(goalReached && "bg-green-100 dark:bg-green-900/50")}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {goalReached && <Check className="h-4 w-4 text-green-600" />}
                          {item.district}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.recovered.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{item.monthlyGoal.toFixed(2)}</TableCell>
                        <TableCell>
                          {goalReached ? (
                             <div className="flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-xs font-semibold">Cumplido</span>
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
                  <Tooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(2)}`}/>} />
                  <Bar dataKey="recovered" fill="hsl(var(--primary))" radius={5}>
                    <LabelList
                      position="right"
                      offset={10}
                      className="fill-foreground text-sm"
                      formatter={(value: number) => {
                        const item = dataForCurrentMonth.find(d => d.recovered === value);
                        return item ? `${(value / 1000).toFixed(1)}k (${item.monthlyGoal > 0 ? ((value / item.monthlyGoal) * 100).toFixed(0) : 0}%)` : '';
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
