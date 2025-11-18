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
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc, addDoc, Timestamp, updateDoc, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const districts = [
    "Alto Laran",
    "Chavin",
    "Chincha Alta",
    "Chincha Baja",
    "El Carmen",
    "Grocio Prado",
    "Pueblo Nuevo",
    "San Clemente",
    "San Juan de Yanac",
    "San Pedro de Huacarpana",
    "Sunampe",
    "Tambo de Mora",
];


export function InspectionsClandestineCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'inspections_clandestine'), orderBy('month', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [date, setDate] = useState<Date>();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [inspectionsCount, setInspectionsCount] = useState('');
  const [clandestineCount, setClandestineCount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  
  const sortedData = data
    ? [...data].sort((a, b) => b.month.localeCompare(a.month) || a.district.localeCompare(b.district))
    : [];
  
  const clearForm = () => {
    setDate(undefined);
    setSelectedDistrict('');
    setInspectionsCount('');
    setClandestineCount('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.month, 'yyyy-MM', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setSelectedDistrict(item.district);
    setInspectionsCount(item.inspectionsCount.toString());
    setClandestineCount(item.clandestineCount.toString());
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !selectedDistrict || !inspectionsCount || !clandestineCount) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }
  
    const monthStr = format(date, 'yyyy-MM');
    const newInspectionsCount = parseInt(inspectionsCount, 10);
    const newClandestineCount = parseInt(clandestineCount, 10);
  
    if (isNaN(newInspectionsCount) || isNaN(newClandestineCount)) {
        toast({ variant: 'destructive', title: 'Error de validación', description: 'Los conteos deben ser números válidos.'});
        return;
    }

    try {
      if (editingId) {
        const docRef = doc(firestore, 'inspections_clandestine', editingId);
        await updateDoc(docRef, {
          month: monthStr,
          district: selectedDistrict,
          inspectionsCount: newInspectionsCount,
          clandestineCount: newClandestineCount,
          updatedAt: Timestamp.now(),
        });
        toast({ variant: 'success', title: 'Éxito', description: 'El registro ha sido actualizado.' });
      } else {
        const q = query(
          collection(firestore, 'inspections_clandestine'),
          where('month', '==', monthStr),
          where('district', '==', selectedDistrict)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(collection(firestore, 'inspections_clandestine'), {
                month: monthStr,
                district: selectedDistrict,
                inspectionsCount: newInspectionsCount,
                clandestineCount: newClandestineCount,
                updatedAt: Timestamp.now(),
            });
            toast({ variant: 'success', title: 'Éxito', description: 'El nuevo registro ha sido creado.' });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Ya existe un registro para ${selectedDistrict} en ${format(date, "MMMM yyyy", {locale: es})}.`,
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
    const docRef = doc(firestore, "inspections_clandestine", id);
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
        <CardTitle>Gestionar Clandestinos e Inspecciones</CardTitle>
        <CardDescription>
            Añada, edite o elimine los registros mensuales por distrito.
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
            <Label htmlFor="district">Distrito</Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!!editingId}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione un distrito" />
                </SelectTrigger>
                <SelectContent>
                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inspections-count">Nº de Inspecciones</Label>
            <Input id="inspections-count" placeholder="0" type="number" value={inspectionsCount} onChange={e => setInspectionsCount(e.target.value)} />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="clandestine-count">Nº de Clandestinos</Label>
            <Input id="clandestine-count" placeholder="0" type="number" value={clandestineCount} onChange={e => setClandestineCount(e.target.value)} />
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
                  <TableHead>Distrito</TableHead>
                  <TableHead className="text-right">Nº Inspecciones</TableHead>
                  <TableHead className="text-right">Nº Clandestinos</TableHead>
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
                    <TableCell>{item.district}</TableCell>
                    <TableCell className="text-right">{item.inspectionsCount}</TableCell>
                    <TableCell className="text-right">{item.clandestineCount}</TableCell>
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

    