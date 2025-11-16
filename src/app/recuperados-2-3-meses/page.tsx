import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Clock3} from 'lucide-react';

export default function Recuperados23MesesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Recuperados (2 a 3 meses)
      </h1>
      <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <Clock3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Módulo de Recuperados (2 a 3 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección está en construcción. Próximamente podrá visualizar
            los datos de recuperados con deuda de 2 a 3 meses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
