'use client';
import {
  collection,
} from 'firebase/firestore';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DollarSign, Goal, Percent, TrendingUp} from 'lucide-react';
import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface StatCardsProps {
    selectedDate: Date;
}

export function StatCards({ selectedDate }: StatCardsProps) {
  const firestore = useFirestore();

  const dailyCollectionsRef = useMemoFirebase(
    () => collection(firestore, 'daily_collections'),
    [firestore]
  );
  const { data: dailyCollectionData, isLoading } = useCollection(dailyCollectionsRef);
  
  const stats = useMemo(() => {
    if (!dailyCollectionData) {
      return {
        dailyCollection: 0,
        monthlyAccumulated: 0,
        monthlyGoal: 0,
        lastUpdated: null,
      };
    }
    
    const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedMonthStr = format(selectedDate, 'yyyy-MM');

    const collectionsForMonth = dailyCollectionData.filter(item => item.date.startsWith(selectedMonthStr));
    
    let dailyCollection = 0;
    let lastUpdated = null;

    // "Recaudación del día" solo tiene sentido si el mes seleccionado es el mes actual
    // y el día seleccionado es hoy.
    if (isSameDay(selectedDate, new Date())) {
        const latestCollectionForToday = dailyCollectionData
        .filter(item => item.date === selectedDayStr)
        .sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0))[0];

        dailyCollection = latestCollectionForToday?.dailyCollectionAmount || 0;
        lastUpdated = latestCollectionForToday?.updatedAt || null;
    }

    const monthlyAccumulated = collectionsForMonth.reduce((acc, item) => acc + item.dailyCollectionAmount, 0);

    const latestGoalEntry = [...collectionsForMonth].sort((a,b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0))[0];
    const monthlyGoal = latestGoalEntry?.monthlyGoal || 0;

    return {
      dailyCollection,
      monthlyAccumulated,
      monthlyGoal,
      lastUpdated
    };
  }, [dailyCollectionData, selectedDate]);


  const progress = stats.monthlyGoal > 0 ? (stats.monthlyAccumulated / stats.monthlyGoal) * 100 : 0;
  
  let lastUpdatedText = '';
  if (stats.lastUpdated) {
    lastUpdatedText = `Actualizado 'a las' ${format(stats.lastUpdated.toDate(), "hh:mm a", { locale: es })}`;
  } else if (isSameDay(selectedDate, new Date())) {
    lastUpdatedText = 'Aún no hay datos para hoy';
  } else {
    lastUpdatedText = `Total del ${format(selectedDate, 'd MMM yyyy', {locale: es})}`
  }


  const cardData = [
    {
      title: 'Recaudación del Día',
      value: formatCurrency(stats.dailyCollection),
      description: lastUpdatedText,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Total Acumulado del Mes',
      value: formatCurrency(stats.monthlyAccumulated),
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Meta Mensual',
      value: formatCurrency(stats.monthlyGoal),
      icon: <Goal className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Porcentaje de Avance',
      value: `${progress.toFixed(2)}%`,
      icon: <Percent className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card key={index} className="border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.description && (
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
