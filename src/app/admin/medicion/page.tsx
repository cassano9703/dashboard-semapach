import { MeterDataCRUD } from "@/components/admin/meter-data-crud";
import { WeeklyMeterProgressCRUD } from "@/components/admin/weekly-meter-progress-crud";

export default function AdminMedicionPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Administración de Medición
        </h1>
        <p className="text-muted-foreground">
          Gestione los datos de los indicadores de medición.
        </p>
      </div>
      <MeterDataCRUD />
      <WeeklyMeterProgressCRUD />
    </div>
  );
}
