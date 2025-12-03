'use client';

import { useState, useEffect } from 'react';
import { ClosedContractsData } from '@/components/catastro/closed-contracts-data';
import { ContractStatCards } from '@/components/catastro/contract-stat-cards';

export default function ContratosCerradosPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  if (!selectedDate) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Contratos Cerrados</h1>
      <ContractStatCards selectedDate={selectedDate} />
      <ClosedContractsData
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  );
}
