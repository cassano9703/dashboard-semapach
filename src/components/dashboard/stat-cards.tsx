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

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function StatCards() {
  const firestore = useFirestore();
  const dailyCollectionsRef = useMemoFirebase(
    () => collection(firestore, 'daily_collections'),
    [firestore]
  );
  const { data: dailyCollectionData, isLoading } = useCollection(dailyCollectionsRef);

  const stats = (dailyCollectionData || []).reduce(
    (acc, item: any) => {
      const today = new Date().toISOString().split('T')[0];
      if (item.date === today) {
        acc.dailyCollection = item.dailyCollectionAmount;
      }
      acc.monthlyAccumulated += item.dailyCollectionAmount;
      // Assuming monthlyGoal is the same for all entries in a month
      if (item.monthlyGoal) {
        acc.monthlyGoal = item.monthlyGoal;
      }
      return acc;
    },
    {
      dailyCollection: 0,
      monthlyAccumulated: 0,
      monthlyGoal: 300000, // Default goal
    }
  );

  const progress = stats.monthlyGoal > 0 ? (stats.monthlyAccumulated / stats.monthlyGoal) * 100 : 0;

  const cardData = [
    {
      title: 'Recaudación del Día',
      value: formatCurrency(stats.dailyCollection),
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
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
