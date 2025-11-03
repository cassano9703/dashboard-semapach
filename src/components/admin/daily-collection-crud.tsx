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
import { Calendar as CalendarIcon, Edit, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, runTransaction, doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
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

  const handleAdd = async () => {
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
    const monthStr = format(date, 'yyyy-MM');

    try {
      await runTransaction(firestore, async (transaction) => {
        // 1. Check if a record for this date already exists
        const dateQuery = query(
          collection(firestore, 'daily_collections'),
          where('date', '==', formattedDate)
        );
        const dateQuerySnapshot = await getDocs(dateQuery);
        if (!dateQuerySnapshot.empty) {
          throw new Error(`Ya existe un registro para la fecha ${formattedDate}.`);
        }

        // 2. Get all collections for the month to calculate the new accumulated total
        const monthQuery = query(
          collection(firestore, 'daily_collections'),
          where('date', '>=', `${monthStr}-01`),
          where('date', '<=', `${monthStr}-31`)
        );
        const monthSnapshot = await getDocs(monthQuery);
        const monthDocs = monthSnapshot.docs.map(doc => ({...doc.data(), id: doc.id, date: doc.data().date as string}));

        // Calculate new accumulated total
        const newAccumulatedTotal = monthDocs.reduce((acc, doc) => acc + doc.dailyCollectionAmount, 0) + newDailyAmount;
        
        // 3. Create the new document
        const newDocRef = doc(collection(firestore, 'daily_collections'));
        transaction.set(newDocRef, {
          date: formattedDate,
          dailyCollectionAmount: newDailyAmount,
          accumulatedMonthlyTotal: newAccumulatedTotal,
          monthlyGoal: newMonthlyGoal,
          updatedAt: new Date(),
        });
        
        // 4. Update the accumulated total for all subsequent days in the month
        const subsequentDays = monthDocs
            .filter(d => parse(d.date, 'yyyy-MM-dd', new Date()) > date)
            .sort((a,b) => a.date.localeCompare(b.date));

        let currentAccumulated = newAccumulatedTotal;
        for (const dayDoc of subsequentDays) {
            currentAccumulated += dayDoc.dailyCollectionAmount;
            const docRef = doc(firestore, 'daily_collections', dayDoc.id);
            transaction.update(docRef, { accumulatedMonthlyTotal: currentAccumulated });
        }
      });

      toast({
        title: 'Éxito',
        description: 'El registro de recaudación diaria ha sido agregado.',
      });
      // Clear form
      setDate(undefined);
      setDailyAmount('');
      setMonthlyGoal('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al agregar registro',
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
          <Button className="w-full md:w-auto" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar
          </Button>
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
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{formatCurrency(item.dailyCollectionAmount)}</TableCell>
                  <TableCell>{formatCurrency(item.accumulatedMonthlyTotal)}</TableCell>
                  <TableCell>{formatCurrency(item.monthlyGoal)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => toast({ title: "Función no implementada" })}>
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
