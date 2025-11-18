import { ClosedContractsData } from '@/components/catastro/closed-contracts-data';

export default function ContratosCerradosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Contratos Cerrados</h1>
      <ClosedContractsData />
    </div>
  );
}
