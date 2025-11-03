import { DailyCollectionManager } from "@/components/admin/daily-collection-manager";
import { DistrictProgressManager } from "@/components/admin/district-progress-manager";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Administración de Datos
        </h1>
        <p className="text-muted-foreground">
          Carga de datos de recaudación y avance de metas por distrito mediante archivos CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyCollectionManager />
        <DistrictProgressManager />
      </div>
    </div>
  );
}
