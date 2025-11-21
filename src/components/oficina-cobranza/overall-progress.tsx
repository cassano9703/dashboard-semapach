
'use client';
import { CollectionDebtGoals } from './collection-debt-goals';

interface OverallProgressProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function OverallProgress({ selectedDate, onDateChange }: OverallProgressProps) {
  return (
    <div className="flex flex-col gap-6">
      <CollectionDebtGoals selectedDate={selectedDate} />
    </div>
  );
}
