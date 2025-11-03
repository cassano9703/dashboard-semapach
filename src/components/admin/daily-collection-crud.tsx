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
import { Calendar as CalendarIcon, Edit, Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, runTransaction, doc, deleteDoc, query, where, getDocs, writeBatch, Timestamp, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "S/ 0.00";
  return `S/ ${num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function DailyCollectionCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dailyCollectionsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'daily_collections') : null),
    [firestore]
  );
  const { data: dailyCollectionData, isLoading: isDataLoading, error } = useCollection(dailyCollectionsRef);

  const [date, setDate] = useState<Date>();
  const [dailyAmount, setDailyAmount] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const sortedData = dailyCollectionData
    ? [...dailyCollectionData].sort((a, b) => b.date.localeCompare(a.date))
    : [];
  
  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "daily_collections", id);
    try {
      await deleteDoc(docRef);
      toast({
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

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const itemDate = parse(item.date, 'yyyy-MM-dd', new Date());
    if(isValid(itemDate)) {
        setDate(itemDate);
    }
    setDailyAmount(item.dailyCollectionAmount.toString());
    setMonthlyGoal(item.monthlyGoal.toString());
  };

  const clearForm = () => {
    setEditingId(null);
    setDate(undefined);
    setDailyAmount('');
    setMonthlyGoal('');
  }

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !dailyAmount || !monthlyGoal) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    const newDailyAmount = parseFloat(dailyAmount);
    const newMonthlyGoal = parseFloat(monthlyGoal);

    try {
      // If we are editing, we update the document
      if (editingId) {
        const docRef = doc(firestore, 'daily_collections', editingId);
        await runTransaction(firestore, async (transaction) => {
          transaction.update(docRef, {
            date: formattedDate,
            dailyCollectionAmount: newDailyAmount,
            monthlyGoal: newMonthlyGoal,
            updatedAt: Timestamp.now(),
          });
        });
         toast({
          title: 'Éxito',
          description: 'El registro ha sido actualizado.',
        });
      } else { // If not editing, we add a new document
        const q = query(collection(firestore, 'daily_collections'), where('date', '==', formattedDate));
        const existingDocs = await getDocs(q);
        if (!existingDocs.empty) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: `Ya existe un registro para la fecha ${formattedDate}.`,
          });
          return;
        }

        const newDocRef = doc(collection(firestore, 'daily_collections'));
        await runTransaction(firestore, async (transaction) => {
           const monthStr = format(date, 'yyyy-MM');
           // Query for all documents in the same month, up to (but not including) the current date
           const monthQuery = query(
              collection(firestore, 'daily_collections'),
              where('date', '>=', `${monthStr}-01`),
              where('date', '<', formattedDate),
              orderBy('date', 'desc')
            );
            const monthSnapshot = await getDocs(monthQuery);
            
            // The accumulated amount is the sum of previous days + the new amount
            const previousDaysTotal = monthSnapshot.docs.reduce((acc, doc) => acc + doc.data().dailyCollectionAmount, 0);
            const accumulated = previousDaysTotal + newDailyAmount;

            transaction.set(newDocRef, {
                date: formattedDate,
                dailyCollectionAmount: newDailyAmount,
                accumulatedMonthlyTotal: accumulated, 
                monthlyGoal: newMonthlyGoal,
                updatedAt: Timestamp.now(),
            });
        });
        toast({
          title: 'Éxito',
          description: 'El nuevo registro ha sido agregado.',
        });
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


  const isLoading = isDataLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Recaudación Diaria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 p-4 border rounded-lg">
          <div className="grid gap-2">
            <Label htmlFor="date">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="justify-start text-left font-normal"
                >
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
                  disabled={!!editingId}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="daily-collection">Recaudación Diaria</Label>
            <Input id="daily-collection" placeholder="S/ 0.00" type="number" value={dailyAmount} onChange={(e) => setDailyAmount(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="monthly-goal">Meta Mensual</Label>
            <Input id="monthly-goal" placeholder="2850000" type="number" value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)} />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Recaudación Diaria</TableHead>
                <TableHead>Acumulado Mensual</TableHead>
                <TableHead>Meta Mensual</TableHead>
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
                  <TableCell>{formatCurrency(item.dailyCollectionAmount)}</TableCell>
                  <TableCell>{formatCurrency(item.accumulatedMonthlyTotal)}</TableCell>
                  <TableCell>{formatCurrency(item.monthlyGoal)}</TableCell>
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
      </CardContent>
    </Card>
  );
}
