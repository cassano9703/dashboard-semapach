export type DailyCollection = {
  date: string;
  recaudacion: number;
};

export const dailyCollectionData: DailyCollection[] = Array.from(
  {length: 30},
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('es-PE', {month: 'short', day: 'numeric'}),
      recaudacion: Math.floor(Math.random() * (12000 - 5000 + 1)) + 5000,
    };
  }
);

export type DistrictProgressData = {
  distrito: string;
  meta: number;
  recuperados: number;
};

export const districtProgressData: DistrictProgressData[] = [
  {distrito: 'Chincha Alta', meta: 50, recuperados: 45},
  {distrito: 'Tambo de Mora', meta: 50, recuperados: 38},
  {distrito: 'Sunampe', meta: 50, recuperados: 29},
  {distrito: 'Grocio Prado', meta: 50, recuperados: 48},
  {distrito: 'Pueblo Nuevo', meta: 50, recuperados: 22},
];

export const stats = {
  dailyCollection: 10580.5,
  monthlyAccumulated: 215430.75,
  monthlyGoal: 300000,
  get progress() {
    return (this.monthlyAccumulated / this.monthlyGoal) * 100;
  },
};
