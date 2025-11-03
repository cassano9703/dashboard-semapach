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
import { DollarSign, Users } from 'lucide-react';

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
        Reporte de Suspendidos Recuperados
      </h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recuperados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Suma total de servicios recuperados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total Recuperado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 0.00</div>
            <p className="text-xs text-muted-foreground">
              Suma total de los montos recuperados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Servicios Recuperados</CardTitle>
          <CardDescription>
            Visualización de la cantidad de servicios recuperados y el monto total por distrito. La gestión de estos datos se realiza en el panel de Administración.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distrito</TableHead>
                  <TableHead className="w-[200px] text-right">Recuperados (Cantidad)</TableHead>
                  <TableHead className="w-[200px] text-right">Monto (S/)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((district) => (
                  <TableRow key={district}>
                    <TableCell className="font-medium">{district}</TableCell>
                    <TableCell className="text-right">0</TableCell>
                    <TableCell className="text-right">0.00</TableCell>
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