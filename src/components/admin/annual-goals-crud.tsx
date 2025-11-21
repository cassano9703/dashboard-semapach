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
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
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

const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

export function AnnualGoalsCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'annual_goals'), orderBy('year', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [year, setYear] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedData = data || [];
  
  const clearForm = () => {
    setYear('');
    setAmount('');
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setYear(item.year.toString());
    setAmount(item.amount.toString());
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !year || !amount) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }
  
    const dataToSave = {
      year: parseInt(year, 10),
      goalType: 'collection',
      amount: parseFloat(amount),
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingId) {
        const docRef = doc(firestore, 'annual_goals', editingId);
        await updateDoc(docRef, dataToSave);
        toast({ variant: 'success', title: 'Éxito', description: 'La meta anual ha sido actualizada.' });
      } else {
        const q = query(
          collection(firestore, 'annual_goals'),
          where('year', '==', dataToSave.year),
          where('goalType', '==', 'collection')
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(collection(firestore, 'annual_goals'), dataToSave);
            toast({ variant: 'success', title: 'Éxito', description: 'La nueva meta anual ha sido creada.' });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Ya existe una meta de recaudación para el año ${year}.`,
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
    const docRef = doc(firestore, "annual_goals", id);
    try {
        deleteDoc(docRef);
        toast({
            variant: "success",
            title: "Éxito",
            description: "La meta anual ha sido eliminada.",
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
        <CardTitle>Gestionar Metas Anuales de Recaudación</CardTitle>
        <CardDescription>
            Añada, edite o elimine las metas anuales de recaudación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-4 p-4 border rounded-lg">
          <div className="grid gap-2">
            <Label htmlFor="year">Año</Label>
            <Select value={year} onValueChange={setYear} disabled={!!editingId}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione un año" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Monto de la Meta</Label>
            <Input id="amount" placeholder="0.00" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
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
                  <TableHead>Año</TableHead>
                  <TableHead>Tipo de Meta</TableHead>
                  <TableHead>Monto Meta Anual</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Cargando datos...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-red-500">Error: {error.message}</TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">No hay metas anuales para mostrar.</TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>Recaudación</TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
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

    