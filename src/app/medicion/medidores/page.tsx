import { MeterDataTable } from '@/components/medicion/meter-data-table';
import { MeterQuantityChart } from '@/components/medicion/meter-quantity-chart';

export default function MedidoresPage() {
  const year = 2025;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reporte de Indicadores de Medición ({year})
        </h1>
        <MeterDataTable year={year} />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
            Evolución Anual de Medidores
        </h2>
        <MeterQuantityChart year={year} />
      </div>
    </div>
  );
}
