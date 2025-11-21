import { InspectionsClandestineCRUD } from "@/components/admin/inspections-clandestine-crud";
import { ClosedContractsCRUD } from "@/components/admin/closed-contracts-crud";

export default function AdminCatastroPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Administración de Catastro
        </h1>
        <p className="text-muted-foreground">
          Gestione los datos de contratos, inspecciones y clandestinos.
        </p>
      </div>
      <InspectionsClandestineCRUD />
      <ClosedContractsCRUD />
    </div>
  );
}
