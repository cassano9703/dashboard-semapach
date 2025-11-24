import { MeterDataTable } from '@/components/medicion/meter-data-table';

export default function MedidoresPage() {
  const year = 2025;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Reporte de Indicadores de Medición ({year})
      </h1>
      <MeterDataTable year={year} />
    </div>
  );
}
