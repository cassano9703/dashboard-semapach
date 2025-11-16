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
import {DollarSign, TrendingUp} from 'lucide-react';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface Recovered2to3StatCardsProps {
    selectedDate: Date;
}

export function Recovered2to3StatCards({ selectedDate }: Recovered2to3StatCardsProps) {
  const firestore = useFirestore();

  const dataRef = useMemoFirebase(
    () => collection(firestore, 'recovered_2_to_3'),
    [firestore]
  );
  const { data: recoveredData, isLoading } = useCollection(dataRef);
  
  const stats = useMemo(() => {
    if (!recoveredData) {
      return {
        dailyAmount: 0,
        monthlyAccumulated: 0,
        lastUpdated: null,
      };
    }
    
    const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedMonthStr = format(selectedDate, 'yyyy-MM');

    const dataForMonth = recoveredData.filter(item => item.date.startsWith(selectedMonthStr));
    
    const dataForSelectedDay = recoveredData.find(item => item.date === selectedDayStr);
    const dailyAmount = dataForSelectedDay?.dailyAmount || 0;
    const lastUpdated = dataForSelectedDay?.updatedAt || null;

    const monthlyAccumulated = dataForMonth.reduce((acc, item) => acc + item.dailyAmount, 0);

    return {
      dailyAmount,
      monthlyAccumulated,
      lastUpdated
    };
  }, [recoveredData, selectedDate]);


  const dailyDescription = stats.lastUpdated
    ? `Actualizado el ${format(stats.lastUpdated.toDate(), "d MMM 'a las' HH:mm", { locale: es })}`
    : `Total del ${format(selectedDate, 'd MMM yyyy', { locale: es })}`;


  const cardData = [
    {
      title: 'Recaudación del Día',
      value: formatCurrency(stats.dailyAmount),
      description: dailyDescription,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Total Acumulado del Mes',
      value: formatCurrency(stats.monthlyAccumulated),
      description: `Total para ${format(selectedDate, 'MMMM', {locale: es})}`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
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
    <div className="grid gap-4 md:grid-cols-2">
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
