// This file is kept for fallback purposes but data is now fetched from Firebase.

export type DailyCollection = {
  date: string;
  recaudacion: number;
};

export const dailyCollectionData: DailyCollection[] = [];

export type DistrictProgressData = {
  distrito: string;
  meta: number;
  recuperados: number;
};

export const districtProgressData: DistrictProgressData[] = [];

export const stats = {
  dailyCollection: 0,
  monthlyAccumulated: 0,
  monthlyGoal: 300000,
  get progress() {
    return this.monthlyAccumulated > 0 && this.monthlyGoal > 0
      ? (this.monthlyAccumulated / this.monthlyGoal) * 100
      : 0;
  },
};
