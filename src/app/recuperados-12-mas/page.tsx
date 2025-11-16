import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {History} from 'lucide-react';

export default function Recuperados12MasPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Recuperados (12 a más meses)
      </h1>
      <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Módulo de Recuperados (12 a más)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección está en construcción. Próximamente podrá visualizar
            los datos de recuperados con deuda de 12 meses a más.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
