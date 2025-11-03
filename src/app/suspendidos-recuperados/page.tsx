import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const districts = [
  'Chincha Alta',
  'Grocio Prado',
  'Pueblo Nuevo',
  'Alto Laran',
  'Sunampe',
  'Tambo de Mora',
  'Chincha baja',
];

export default function SuspendidosRecuperadosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Suspendidos Recuperados
      </h1>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle>Registro de Servicios Recuperados</CardTitle>
              <CardDescription>
                Ingrese la cantidad de servicios recuperados y el monto total por distrito.
              </CardDescription>
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
          </div>

        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead className="w-[200px]">Recuperados (Cantidad)</TableHead>
                  <TableHead className="w-[200px]">Monto (S/)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((district) => (
                  <TableRow key={district}>
                    <TableCell className="font-medium">{district}</TableCell>
                    <TableCell>
                      <Input type="number" placeholder="0" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" placeholder="0.00" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
