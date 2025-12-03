import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {BookOpen} from 'lucide-react';

export default function CompendioPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Compendio</h1>
      <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Módulo de Compendio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bienvenido al módulo de compendio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
