import { DailyCollectionCRUD } from "@/components/admin/daily-collection-crud";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Panel de Administración
        </h1>
      </div>
      <DailyCollectionCRUD />
    </div>
  );
}
