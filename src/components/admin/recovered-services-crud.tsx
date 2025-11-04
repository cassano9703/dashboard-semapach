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
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, Timestamp, orderBy, updateDoc } from "firebase/firestore";
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
  "Chincha Alta",
  "Grocio Prado",
  "Pueblo Nuevo",
  "Alto Laran",
  "Sunampe",
  "Tambo de Mora",
  "Chincha Baja",
];

export function RecoveredServicesCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const servicesRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'recovered_services'), orderBy('date', 'desc')) : null),
    [firestore]
  );
  const { data: servicesData, isLoading, error } = useCollection(servicesRef);

  const [date, setDate] = useState<Date>();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [recoveredCount, setRecoveredCount] = useState('');
  const [recoveredAmount, setRecoveredAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedData = servicesData || [];

  const clearForm = () => {
    setDate(undefined);
    setSelectedDistrict('');
    setRecoveredCount('');
    setRecoveredAmount('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.date, 'yyyy-MM-dd', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setSelectedDistrict(item.district);
    setRecoveredCount(item.recoveredCount.toString());
    setRecoveredAmount(item.recoveredAmount.toString());
  };

  const handleAddOrUpdate = () => {
    if (!firestore || !date || !selectedDistrict || !recoveredCount || !recoveredAmount) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }
  
    const formattedDate = format(date, 'yyyy-MM-dd');
    const newRecoveredCount = parseInt(recoveredCount, 10);
    const newRecoveredAmount = parseFloat(recoveredAmount);

    if (isNaN(newRecoveredCount) || isNaN(newRecoveredAmount)) {
       toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'La cantidad y el monto deben ser números válidos.',
      });
      return;
    }
  
    try {
      if (editingId) {
        // Update existing document
        const docRef = doc(firestore, 'recovered_services', editingId);
        updateDoc(docRef, {
          // date field is not updated to prevent moving records between dates, only data is updated
          district: selectedDistrict,
          recoveredCount: newRecoveredCount,
          recoveredAmount: newRecoveredAmount,
          updatedAt: Timestamp.now(),
        });
        toast({ variant: 'success', title: 'Éxito', description: 'El registro ha sido actualizado.' });

      } else {
        // Check if a record for this district and date already exists before adding
        const q = query(
          collection(firestore, 'recovered_services'),
          where('date', '==', formattedDate),
          where('district', '==', selectedDistrict)
        );
    
        getDocs(q).then(querySnapshot => {
            if (querySnapshot.empty) {
              // Add new document
              addDoc(collection(firestore, 'recovered_services'), {
                date: formattedDate,
                district: selectedDistrict,
                recoveredCount: newRecoveredCount,
                recoveredAmount: newRecoveredAmount,
                updatedAt: Timestamp.now(),
              });
              toast({ variant: 'success', title: 'Éxito', description: 'El nuevo registro ha sido creado.' });
            } else {
               toast({
                variant: 'destructive',
                title: 'Error: Registro Duplicado',
                description: `Ya existe un registro para ${selectedDistrict} en la fecha ${format(date, "dd/MM/yyyy")}.`,
              });
            }
        });
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
    const docRef = doc(firestore, "recovered_services", id);
    try {
        deleteDoc(docRef);
        toast({ variant: "success", title: "Éxito", description: "El registro ha sido eliminado." });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error al eliminar", description: e.message });
    }
  };
  
  const fromDate = new Date(2025, 8, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Usuarios Suspendidos Recuperados</CardTitle>
        <CardDescription>
          Añada, edite o elimine los registros diarios de usuarios recuperados por distrito.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 items-end gap-4 p-4 border rounded-lg">
          <div className="grid gap-2">
            <Label htmlFor="date">Fecha</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="justify-start text-left font-normal" disabled={!!editingId}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : <span>Seleccione una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={date} 
                  onSelect={setDate} 
                  initialFocus 
                  locale={es} 
                  disabled={{ before: fromDate, after: new Date() }}
                  fromMonth={fromDate}
                  toMonth={new Date()}
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
            <Label htmlFor="recovered-count">Cantidad</Label>
            <Input id="recovered-count" placeholder="0" type="number" value={recoveredCount} onChange={e => setRecoveredCount(e.target.value)} />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="recovered-amount">Monto (S/)</Label>
            <Input id="recovered-amount" placeholder="0.00" type="number" value={recoveredAmount} onChange={e => setRecoveredAmount(e.target.value)} />
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
          <div className="relative max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-table-header text-table-header-foreground z-10">
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Distrito</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Monto (S/)</TableHead>
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
                    <TableCell>{format(parse(item.date, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy', {locale: es})}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell className="text-right">{item.recoveredCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.recoveredAmount)}</TableCell>
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
