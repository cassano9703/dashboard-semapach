"use client";

import {
  Card,
  CardContent,
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
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc, addDoc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "S/ 0.00";
  return `S/ ${num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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


export function DistrictProgressCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const districtProgressRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'district_progress') : null),
    [firestore]
  );
  const { data: districtProgressData, isLoading: isDataLoading, error } = useCollection(districtProgressRef);

  const [date, setDate] = useState<Date>();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [recoveredAmount, setRecoveredAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  
  const sortedData = districtProgressData
    ? [...districtProgressData].sort((a, b) => b.month.localeCompare(a.month) || a.district.localeCompare(b.district))
    : [];
  
  const clearForm = () => {
    setDate(undefined);
    setSelectedDistrict('');
    setMonthlyGoal('');
    setRecoveredAmount('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.month, 'yyyy-MM', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setSelectedDistrict(item.district);
    setMonthlyGoal(item.monthlyGoal.toString());
    setRecoveredAmount(item.recovered.toString());
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !selectedDistrict || !monthlyGoal || !recoveredAmount) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }
  
    const monthStr = format(date, 'yyyy-MM');
    const newMonthlyGoal = parseFloat(monthlyGoal);
    const newRecoveredAmount = parseFloat(recoveredAmount);
  
    try {
      if (editingId) {
        // Update existing document
        const docRef = doc(firestore, 'district_progress', editingId);
        await writeBatch(firestore).update(docRef, {
          month: monthStr,
          district: selectedDistrict,
          monthlyGoal: newMonthlyGoal,
          recovered: newRecoveredAmount,
          updatedAt: Timestamp.now(),
        }).commit();

        toast({
          variant: 'success',
          title: 'Éxito',
          description: 'El registro de avance ha sido actualizado.',
        });
      } else {
        // Check if a record for this district and month already exists before adding
        const q = query(
          collection(firestore, 'district_progress'),
          where('month', '==', monthStr),
          where('district', '==', selectedDistrict)
        );
    
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
          // Add new document
          await addDoc(collection(firestore, 'district_progress'), {
            month: monthStr,
            district: selectedDistrict,
            monthlyGoal: newMonthlyGoal,
            recovered: newRecoveredAmount,
            updatedAt: Timestamp.now(),
          });
          toast({
            variant: 'success',
            title: 'Éxito',
            description: 'El nuevo registro de avance ha sido creado.',
          });
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
  
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "district_progress", id);
    try {
        await deleteDoc(docRef);
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


  const isLoading = isDataLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Avance por Distrito</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Input Form */}
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
            <Label htmlFor="monthly-goal">Meta Mensual</Label>
            <Input id="monthly-goal" placeholder="0" type="number" value={monthlyGoal} onChange={e => setMonthlyGoal(e.target.value)} />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="recovered">Recuperado</Label>
            <Input id="recovered" placeholder="0" type="number" value={recoveredAmount} onChange={e => setRecoveredAmount(e.target.value)} />
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

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="relative max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Meta Mensual</TableHead>
                  <TableHead>Recuperado</TableHead>
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
                    <TableCell>{formatCurrency(item.monthlyGoal)}</TableCell>
                    <TableCell>{formatCurrency(item.recovered)}</TableCell>
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
