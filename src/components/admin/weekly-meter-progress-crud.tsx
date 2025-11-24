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
import { format, parse, isValid, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, deleteDoc, setDoc, Timestamp, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('es-PE');
};

export function WeeklyMeterProgressCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'weekly_meter_progress'), orderBy('weekStartDate', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [date, setDate] = useState<Date>();
  const [meterCount, setMeterCount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedData = data || [];
  
  const clearForm = () => {
    setDate(undefined);
    setMeterCount('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.weekStartDate, 'yyyy-MM-dd', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setMeterCount(item.meterCount.toString());
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !meterCount) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }
  
    // Ensure the selected date is a Monday
    const weekStartDate = startOfWeek(date, { weekStartsOn: 1 });
    const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd');
    
    const dataToSave = {
      weekStartDate: weekStartDateStr,
      meterCount: parseInt(meterCount, 10),
      updatedAt: Timestamp.now(),
    };
    
    if (isNaN(dataToSave.meterCount)) {
        toast({ variant: 'destructive', title: 'Error de validación', description: 'Por favor, ingrese un número válido para la cantidad.'});
        return;
    }

    try {
      // Use weekStartDateStr as document ID for easy lookup and to prevent duplicates
      const docRef = doc(firestore, 'weekly_meter_progress', weekStartDateStr);
      await setDoc(docRef, dataToSave, { merge: true });
      
      toast({ variant: 'success', title: 'Éxito', description: `Los datos para la semana del ${weekStartDateStr} han sido guardados.` });
      
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
    const docRef = doc(firestore, "weekly_meter_progress", id);
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
        <CardTitle>Gestionar Progreso Semanal de Medidores</CardTitle>
        <CardDescription>
            Añada o edite la cantidad de medidores instalados por semana.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 p-4 border rounded-lg">
            <div className="grid gap-2">
                <Label htmlFor="week-start-date">Inicio de Semana (Lunes)</Label>
                <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className="justify-start text-left font-normal" disabled={!!editingId}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd 'de' MMMM, yyyy", { locale: es }) : <span>Seleccione una fecha</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar 
                        mode="single" 
                        selected={date} 
                        onSelect={setDate} 
                        initialFocus 
                        locale={es} 
                        modifiers={{
                           mondays: { dayOfWeek: [1] }
                        }}
                        modifiersClassNames={{
                           mondays: 'bg-accent text-accent-foreground'
                        }}
                    />
                </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="meter-count">Cantidad de Medidores</Label>
                <Input id="meter-count" placeholder="17315" type="number" value={meterCount} onChange={e => setMeterCount(e.target.value)} />
            </div>
            <div className="flex items-end gap-2 col-span-1 md:col-span-2">
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
                  <TableHead>Inicio de Semana</TableHead>
                  <TableHead className="text-right">Cantidad de Medidores</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">Cargando datos...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-red-500">Error: {error.message}</TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">No hay datos para mostrar.</TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(parse(item.weekStartDate, 'yyyy-MM-dd', new Date()), "dd 'de' MMMM, yyyy", {locale: es})}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.meterCount)}</TableCell>
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
