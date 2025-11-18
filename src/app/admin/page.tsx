import { DailyCollectionCRUD } from "@/components/admin/daily-collection-crud";
import { DistrictProgressCRUD } from "@/components/admin/district-progress-crud";
import { InspectionsClandestineCRUD } from "@/components/admin/inspections-clandestine-crud";
import { Recovered12PlusCRUD } from "@/components/admin/recovered-12-plus-crud";
import { Recovered2to3CRUD } from "@/components/admin/recovered-2-to-3-crud";
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
      <Recovered12PlusCRUD />
      <Recovered2to3CRUD />
      <InspectionsClandestineCRUD />
    </div>
  );
}

