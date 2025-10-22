import {stats} from '@/lib/data';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DollarSign, Goal, Percent, TrendingUp} from 'lucide-react';

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function StatCards() {
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
      value: `${stats.progress.toFixed(2)}%`,
      icon: <Percent className="h-4 w-4 text-muted-foreground" />,
    },
  ];

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
