'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Target } from 'lucide-react';

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

  const annualGoalRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'annual_goals'),
        where('year', '==', parseInt(currentYear, 10)),
        where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore, currentYear]);

  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'monthly_goals'),
        where('goalType', '==', 'debt_3_plus')
    );
  }, [firestore]);

  const { data: annualGoalData, isLoading: isLoadingAnnual } = useCollection(annualGoalRef);
  const { data: monthlyGoalsData, isLoading: isLoadingMonthly } = useCollection(monthlyGoalsRef);

  const { annualGoal, debtRemaining, progress, initialDebt } = useMemo(() => {
    const goal = annualGoalData?.[0]?.amount || 0;

    const yearData = monthlyGoalsData
        ? monthlyGoalsData.filter(mg => mg.month.startsWith(currentYear) && mg.proposedAmount)
        : [];
    
    const totalInitialDebt = yearData.reduce((sum, mg) => sum + mg.proposedAmount, 0);
    const totalCurrentDebt = yearData.reduce((sum, mg) => sum + (mg.executedAmount || mg.proposedAmount), 0);
    
    const reduction = totalInitialDebt > 0 ? totalInitialDebt - totalCurrentDebt : 0;
    const progressPercentage = goal > 0 ? Math.min((reduction / goal) * 100, 100) : 0;

    return {
        annualGoal: goal,
        debtRemaining: totalCurrentDebt,
        progress: progressPercentage,
        initialDebt: totalInitialDebt
    };
  }, [annualGoalData, monthlyGoalsData, currentYear]);

  const isLoading = isLoadingAnnual || isLoadingMonthly;

  if (isLoading) {
      return (
          <Card>
              <CardContent className="pt-6">
                  <div className="h-24 animate-pulse bg-muted rounded-md" />
              </CardContent>
          </Card>
      );
  }
  
  if (annualGoal === 0) {
      return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Meta Anual de Reducción de Deuda ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-muted-foreground">Reducción Total</span>
            <span className="font-semibold">{formatCurrency(initialDebt - debtRemaining)}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                  <Progress value={progress} className="h-3" />
              </TooltipTrigger>
              <TooltipContent>
                  <p className="text-muted-foreground">Faltan {formatCurrency(annualGoal - (initialDebt - debtRemaining))} por reducir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-muted-foreground">Meta de Reducción Anual</span>
            <span className="font-semibold">{formatCurrency(annualGoal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
