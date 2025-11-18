import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ClipboardList} from 'lucide-react';

export default function ClandestinosInspeccionesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Clandestinos e Inspecciones</h1>
      <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Módulo de Clandestinos e Inspecciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección está en construcción. Próximamente podrá gestionar
            los datos de clandestinos e inspecciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
