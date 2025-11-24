'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { format, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Target, Flag } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../ui/chart';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


interface AnnualDebtGoalProps {
  selectedDate: Date;
}

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function AnnualDebtGoal({ selectedDate }: AnnualDebtGoalProps) {
  const firestore = useFirestore();
  const currentYear = format(selectedDate, 'yyyy');

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'monthly_goals'),
        where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore]);

  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const {
    initialDebtInPeriod,
    currentDebt,
    targetDebt,
    progress,
    remainingToReduce,
  } = useMemo(() => {
    const filteredMonthlyGoals = monthlyGoalsData?.filter(
        (d) => d.month.startsWith(currentYear)
    ) || [];

    if (filteredMonthlyGoals.length === 0) {
      return { initialDebtInPeriod: 0, currentDebt: 0, targetDebt: 9300000, progress: 0, remainingToReduce: 0 };
    }
    
    // Sort to find initial debt of the period (August)
    const periodGoals = filteredMonthlyGoals.filter(d => getMonth(parseISO(d.month + '-01')) >= 7); // August (index 7) onwards
    periodGoals.sort((a,b) => a.month.localeCompare(b.month));
    const initialDebt = periodGoals[0]?.proposedAmount ?? 0;

    // Sort to find the latest debt value
    filteredMonthlyGoals.sort((a,b) => b.month.localeCompare(a.month));
    const latestData = filteredMonthlyGoals[0];
    const current = latestData?.executedAmount ?? latestData?.proposedAmount ?? 0;
    
    const goal = 9300000;
    
    const totalReductionRequired = initialDebt - goal;
    const reductionAchieved = initialDebt - current;
    
    const progressPercentage = totalReductionRequired > 0 
      ? (reductionAchieved / totalReductionRequired) * 100 
      : 0;

    return {
      initialDebtInPeriod: initialDebt,
      currentDebt: current,
      targetDebt: goal,
      progress: Math.max(0, progressPercentage),
      remainingToReduce: current - goal
    };
  }, [monthlyGoalsData, currentYear]);
  
  const debtGoals = useMemo(() => {
    const dbtGoals: any[] = Array(12).fill(null);
    
    if (monthlyGoalsData) {
       monthlyGoalsData
        .filter(goal => goal.month.startsWith(currentYear) && goal.goalType === 'debt_3_plus')
        .forEach(goal => {
            const monthIndex = getMonth(parseISO(goal.month + '-01T12:00:00Z'));
            dbtGoals[monthIndex] = goal;
        });
    }
    // Aug, Sep, Oct
    return dbtGoals.slice(7, 10);
  }, [monthlyGoalsData, currentYear]);

  const chartData = useMemo(() => {
    return debtGoals.map((goal, index) => ({
        name: format(new Date(2025, index + 7, 1), 'MMM', { locale: es }),
        'Deuda Actual': goal?.executedAmount ?? goal?.proposedAmount ?? 0,
    })).filter(item => item['Deuda Actual'] > 0);
  }, [debtGoals]);

  const isLoading = isLoadingMonthly;

  if (isLoading) {
      return (
          <Card className="h-full">
              <CardContent className="pt-6 h-full flex items-center justify-center">
                  <div className="h-24 animate-pulse bg-muted rounded-md w-full" />
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Reducción de Deuda ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <div className='flex items-center gap-2'>
            <Target className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Meta de Deuda</span>
          </div>
          <span className="text-lg font-bold">{formatCurrency(targetDebt)}</span>
        </div>
        <div className="space-y-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Progress value={progress} className="h-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Progreso: {progress.toFixed(2)}%</p>
                        <p>Falta reducir: {formatCurrency(remainingToReduce)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(initialDebtInPeriod)} (Inicial)</span>
                <span>{formatCurrency(targetDebt)} (Meta)</span>
            </div>
        </div>
        
        <Separator className="my-4" />

        <div>
            <h3 className="text-md font-semibold">Deuda de 3 a más</h3>
            <p className="text-sm text-muted-foreground mb-4">Gráfico de la deuda actual por mes.</p>
            {chartData.length === 0 ? (
                <div className="h-[150px] flex items-center justify-center text-muted-foreground">No hay datos para el gráfico.</div>
            ) : (
                <ChartContainer config={{}} className='w-full h-[150px]'>
                    <BarChart 
                        data={chartData} 
                        layout="vertical"
                        margin={{ top: 5, right: 0, bottom: 5, left: 0 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={40} />
                        <RechartsTooltip
                            cursor={{ fill: 'hsla(var(--background))' }}
                            content={({ active, payload, label }) =>
                                active && payload && payload.length ? (
                                <div className="bg-background border rounded-lg p-2 shadow-lg -mt-12">
                                    <p className="font-bold">{label}</p>
                                    <p className="text-sm">{formatCurrency(payload[0].value as number)}</p>
                                </div>
                                ) : null
                            }
                            />
                        <Bar dataKey="Deuda Actual" radius={4} fill="hsl(var(--chart-2))" />
                    </BarChart>
                </ChartContainer>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
