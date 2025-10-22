'use client';

import {districtProgressData} from '@/lib/data';
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

const chartConfig = {
  recuperados: {
    label: 'Recuperados',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function DistrictProgress() {
  const dataWithProgress = districtProgressData.map((d) => ({
    ...d,
    progress: (d.recuperados / d.meta) * 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avance de Meta Diaria por Distrito</CardTitle>
        <CardDescription>
          Unidades recuperadas por distrito vs. la meta diaria de 50 unidades.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2">
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
              {dataWithProgress.map((item) => (
                <TableRow key={item.distrito}>
                  <TableCell className="font-medium">{item.distrito}</TableCell>
                  <TableCell className="text-right">
                    {item.recuperados}
                  </TableCell>
                  <TableCell className="text-right">{item.meta}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={item.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(item.progress)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="h-[280px] w-full">
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={dataWithProgress}
              layout="vertical"
              margin={{
                left: 10,
                right: 40,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="distrito"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 12)}
                className="text-xs"
              />
              <XAxis dataKey="recuperados" type="number" hide />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="recuperados" fill="hsl(var(--primary))" radius={5}>
                <LabelList
                  position="right"
                  offset={10}
                  className="fill-foreground text-sm"
                  formatter={(value: number) =>
                    `${value} (${((value / 50) * 100).toFixed(0)}%)`
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
