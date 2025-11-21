'use client';

import { useState } from 'react';
import { ClosedContractsData } from '@/components/catastro/closed-contracts-data';
import { ContractStatCards } from '@/components/catastro/contract-stat-cards';

export default function ContratosCerradosPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

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
