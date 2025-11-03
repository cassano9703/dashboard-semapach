import { DailyCollectionCRUD } from "@/components/admin/daily-collection-crud";
import { DistrictProgressCRUD } from "@/components/admin/district-progress-crud";
import { RecoveredServicesCRUD } from "@/components/admin/recovered-services-crud";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Gestione los datos de recaudación diaria y el avance por distritos.
        </p>
      </div>
      <DailyCollectionCRUD />
      <DistrictProgressCRUD />
      <RecoveredServicesCRUD />
    </div>
  );
}
