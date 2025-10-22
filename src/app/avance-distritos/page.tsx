import {DistrictProgress} from '@/components/dashboard/district-progress';

export default function AvanceDistritosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Avance por Distritos
      </h1>
      <DistrictProgress />
    </div>
  );
}
