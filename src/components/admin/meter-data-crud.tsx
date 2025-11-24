"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon, Edit, Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, deleteDoc, setDoc, Timestamp, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return `${(value * 100).toFixed(2)}%`;
};

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('es-PE');
};

export function MeterDataCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'meter_data'), orderBy('month', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [date, setDate] = useState<Date>();
  const [coverage, setCoverage] = useState('');
  const [micrometeringTariffStudy, setMicrometeringTariffStudy] = useState('');
  const [micrometeringPercentage, setMicrometeringPercentage] = useState('');
  const [meterQuantity, setMeterQuantity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedData = data || [];
  
  const clearForm = () => {
    setDate(undefined);
    setCoverage('');
    setMicrometeringTariffStudy('');
    setMicrometeringPercentage('');
    setMeterQuantity('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.month, 'yyyy-MM', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setCoverage((item.coverage * 100).toString());
    setMicrometeringTariffStudy((item.micrometering_tariff_study * 100).toString());
    setMicrometeringPercentage((item.micrometering_percentage * 100).toString());
    setMeterQuantity(item.meter_quantity.toString());
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !coverage || !micrometeringTariffStudy || !micrometeringPercentage || !meterQuantity) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }
  
    const monthStr = format(date, 'yyyy-MM');
    
    const dataToSave = {
      month: monthStr,
      coverage: parseFloat(coverage) / 100,
      micrometering_tariff_study: parseFloat(micrometeringTariffStudy) / 100,
      micrometering_percentage: parseFloat(micrometeringPercentage) / 100,
      meter_quantity: parseInt(meterQuantity, 10),
      updatedAt: Timestamp.now(),
    };
    
    if (Object.values(dataToSave).some(v => isNaN(v as number) && typeof v === 'number')) {
        toast({ variant: 'destructive', title: 'Error de validación', description: 'Por favor, ingrese números válidos.'});
        return;
    }

    try {
      const docRef = doc(firestore, 'meter_data', monthStr);
      await setDoc(docRef, dataToSave, { merge: true });
      
      toast({ variant: 'success', title: 'Éxito', description: `Los datos para ${format(date, 'MMMM yyyy', {locale: es})} han sido ${editingId ? 'actualizados' : 'creados'}.` });
      
      clearForm();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: e.message,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "meter_data", id);
    try {
        deleteDoc(docRef);
        toast({
            variant: "success",
            title: "Éxito",
            description: "El registro ha sido eliminado.",
        });
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Error al eliminar",
            description: e.message,
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Datos de Medición</CardTitle>
        <CardDescription>
            Añada o edite los indicadores de medición para cada mes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-end gap-4 p-4 border rounded-lg">
          <div className="grid col-span-1 lg:col-span-3 grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="month">Mes</Label>
                <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className="justify-start text-left font-normal" disabled={!!editingId}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM 'de' yyyy", { locale: es }) : <span>Seleccione un mes</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es} defaultMonth={date}/>
                </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="coverage">Cobertura (%)</Label>
                <Input id="coverage" placeholder="35.94" type="number" value={coverage} onChange={e => setCoverage(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="micrometering_tariff_study">Micromedición (Estudio Tarifario) (%)</Label>
                <Input id="micrometering_tariff_study" placeholder="38.22" type="number" value={micrometeringTariffStudy} onChange={e => setMicrometeringTariffStudy(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="micrometering_percentage">Micromedición (%)</Label>
                <Input id="micrometering_percentage" placeholder="29.18" type="number" value={micrometeringPercentage} onChange={e => setMicrometeringPercentage(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="meter_quantity">Cantidad de Medidores</Label>
                <Input id="meter_quantity" placeholder="17315" type="number" value={meterQuantity} onChange={e => setMeterQuantity(e.target.value)} />
            </div>
          </div>
          <div className="flex items-end gap-2 col-span-1 lg:col-span-3">
            <Button className="w-full" onClick={handleAddOrUpdate}>
                {editingId ? <><Edit className="mr-2 h-4 w-4" /> Actualizar</> : <><Plus className="mr-2 h-4 w-4" /> Agregar</>}
            </Button>
            {editingId && (
                <Button variant="outline" size="icon" onClick={clearForm}>
                    <X className="h-4 w-4" />
                </Button>
            )}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="relative max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-table-header text-table-header-foreground z-10">
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Cobertura</TableHead>
                  <TableHead>Micromed. (Tarifario)</TableHead>
                  <TableHead>Micromed. %</TableHead>
                  <TableHead>Cant. Medidores</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Cargando datos...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-500">Error: {error.message}</TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No hay datos para mostrar.</TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(parse(item.month, 'yyyy-MM', new Date()), 'MMMM yyyy', {locale: es})}</TableCell>
                    <TableCell>{formatPercent(item.coverage)}</TableCell>
                    <TableCell>{formatPercent(item.micrometering_tariff_study)}</TableCell>
                    <TableCell>{formatPercent(item.micrometering_percentage)}</TableCell>
                    <TableCell>{formatNumber(item.meter_quantity)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )))
                }
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}