import { InspectionsClandestineData } from '@/components/catastro/inspections-clandestine-data';

export default function ClandestinosInspeccionesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Clandestinos e Inspecciones
      </h1>
      <InspectionsClandestineData />
    </div>
  );
}

    