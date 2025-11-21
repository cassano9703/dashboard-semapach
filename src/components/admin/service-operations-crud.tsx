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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Edit, Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, Timestamp, updateDoc, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function ServiceOperationsCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'service_operations'), orderBy('month', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [date, setDate] = useState<Date>();
  const [operationType, setOperationType] = useState('');
  const [entity, setEntity] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  
  const sortedData = data
    ? [...data].sort((a, b) => b.month.localeCompare(a.month) || a.operationType.localeCompare(b.operationType) || a.entity.localeCompare(b.entity))
    : [];
  
  const clearForm = () => {
    setDate(undefined);
    setOperationType('');
    setEntity('');
    setQuantity('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.month, 'yyyy-MM', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setOperationType(item.operationType);
    setEntity(item.entity);
    setQuantity(item.quantity.toString());
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !operationType || !entity || !quantity) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }
  
    const monthStr = format(date, 'yyyy-MM');
    
    const dataToSave: any = {
      month: monthStr,
      operationType,
      entity,
      quantity: parseInt(quantity, 10),
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingId) {
        const docRef = doc(firestore, 'service_operations', editingId);
        await updateDoc(docRef, dataToSave);
        toast({ variant: 'success', title: 'Éxito', description: 'La operación ha sido actualizada.' });
      } else {
        const q = query(
          collection(firestore, 'service_operations'),
          where('month', '==', monthStr),
          where('operationType', '==', operationType),
          where('entity', '==', entity)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(collection(firestore, 'service_operations'), dataToSave);
            toast({ variant: 'success', title: 'Éxito', description: 'La nueva operación ha sido creada.' });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Ya existe un registro para esta operación en ${format(date, "MMMM yyyy", {locale: es})}.`,
            });
            return;
        }
      }
      
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
    const docRef = doc(firestore, "service_operations", id);
    try {
        deleteDoc(docRef);
        toast({
            variant: "success",
            title: "Éxito",
            description: "La operación ha sido eliminada.",
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
        <CardTitle>Gestionar Cortes y Reaperturas</CardTitle>
        <CardDescription>
            Añada, edite o elimine los registros de operaciones de servicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-5 items-end gap-4 p-4 border rounded-lg">
          <div className="grid gap-2">
            <Label htmlFor="month">Mes</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="justify-start text-left font-normal"
                  disabled={!!editingId}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMMM 'de' yyyy", { locale: es }) : <span>Seleccione un mes</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={es}
                  defaultMonth={date}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="operationType">Tipo de Operación</Label>
            <Select value={operationType} onValueChange={setOperationType} disabled={!!editingId}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="cut">Corte</SelectItem>
                    <SelectItem value="reconnection">Reapertura</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="entity">Entidad</Label>
            <Select value={entity} onValueChange={setEntity} disabled={!!editingId}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione entidad" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="servis">Servis</SelectItem>
                    <SelectItem value="semapach">Semapach</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input id="quantity" placeholder="0" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Cargando datos...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-red-500">Error: {error.message}</TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">No hay datos para mostrar.</TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(parse(item.month, 'yyyy-MM', new Date()), 'MMMM yyyy', {locale: es})}</TableCell>
                    <TableCell>{item.operationType === 'cut' ? 'Corte' : 'Reapertura'}</TableCell>
                    <TableCell className="capitalize">{item.entity}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
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
