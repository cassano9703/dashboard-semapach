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

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "S/ 0.00";
  return `S/ ${num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


export function MonthlyGoalsCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'monthly_goals'), orderBy('month', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [date, setDate] = useState<Date>();
  const [goalType, setGoalType] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [executedAmount, setExecutedAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  
  const sortedData = data
    ? [...data].sort((a, b) => b.month.localeCompare(a.month) || a.goalType.localeCompare(b.goalType))
    : [];
  
  const clearForm = () => {
    setDate(undefined);
    setGoalType('');
    setProposedAmount('');
    setExecutedAmount('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.month, 'yyyy-MM', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setGoalType(item.goalType);
    setProposedAmount(item.proposedAmount.toString());
    setExecutedAmount(item.executedAmount?.toString() || '');
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !goalType || !proposedAmount) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: `Por favor, complete Mes, Tipo de Meta y ${goalType === 'debt_3_plus' ? 'Monto Inicial' : 'Monto Propuesto'}.`,
      });
      return;
    }
  
    const monthStr = format(date, 'yyyy-MM');
    
    const dataToSave: any = {
      month: monthStr,
      goalType: goalType,
      proposedAmount: parseFloat(proposedAmount),
      updatedAt: Timestamp.now(),
    };

    if (executedAmount) dataToSave.executedAmount = parseFloat(executedAmount);

    try {
      if (editingId) {
        const docRef = doc(firestore, 'monthly_goals', editingId);
        await updateDoc(docRef, dataToSave);
        toast({ variant: 'success', title: 'Éxito', description: 'La meta ha sido actualizada.' });
      } else {
        const q = query(
          collection(firestore, 'monthly_goals'),
          where('month', '==', monthStr),
          where('goalType', '==', goalType)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(collection(firestore, 'monthly_goals'), dataToSave);
            toast({ variant: 'success', title: 'Éxito', description: 'La nueva meta ha sido creada.' });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Ya existe una meta de tipo '${goalType === 'collection' ? 'Recaudación' : 'Deuda 3+'}' para ${format(date, "MMMM yyyy", {locale: es})}.`,
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
    const docRef = doc(firestore, "monthly_goals", id);
    try {
        deleteDoc(docRef);
        toast({
            variant: "success",
            title: "Éxito",
            description: "La meta ha sido eliminada.",
        });
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Error al eliminar",
            description: e.message,
        });
    }
  };

  const labels = {
    proposed: goalType === 'debt_3_plus' ? 'Monto Inicial (Deuda)' : 'Monto Propuesto',
    executed: goalType === 'debt_3_plus' ? 'Monto Actual (Deuda)' : 'Monto Ejecutado',
    proposedPlaceholder: goalType === 'debt_3_plus' ? '1000000.00' : '500000.00',
    executedPlaceholder: goalType === 'debt_3_plus' ? '800000.00' : '550000.00',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Metas Mensuales</CardTitle>
        <CardDescription>
            Añada, edite o elimine las metas de recaudación y deuda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 p-4 border rounded-lg">
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
            <Label htmlFor="goalType">Tipo de Meta</Label>
            <Select value={goalType} onValueChange={setGoalType} disabled={!!editingId}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="collection">Recaudación</SelectItem>
                    <SelectItem value="debt_3_plus">Deuda 3+</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proposedAmount">{labels.proposed}</Label>
            <Input id="proposedAmount" placeholder={labels.proposedPlaceholder} type="number" value={proposedAmount} onChange={e => setProposedAmount(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="executedAmount">{labels.executed}</Label>
            <Input id="executedAmount" placeholder={labels.executedPlaceholder} type="number" value={executedAmount} onChange={e => setExecutedAmount(e.target.value)} />
          </div>
          <div className="flex items-end gap-2 col-span-full">
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
                  <TableHead>Tipo de Meta</TableHead>
                  <TableHead>M. Propuesto/Inicial</TableHead>
                  <TableHead>M. Ejecutado/Actual</TableHead>
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
                    <TableCell>{item.goalType === 'collection' ? 'Recaudación' : 'Deuda 3+'}</TableCell>
                    <TableCell>{formatCurrency(item.proposedAmount)}</TableCell>
                    <TableCell>{item.executedAmount ? formatCurrency(item.executedAmount) : '-'}</TableCell>
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
