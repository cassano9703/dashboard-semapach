import { CutsAndReconnectionsReport } from '@/components/compendio/cuts-reconnections-report';

export default function ReporteCobranzaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Reporte de Oficina de Cobranza
      </h1>
      <CutsAndReconnectionsReport />
    </div>
  );
}
