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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, runTransaction, serverTimestamp, deleteDoc } from "firebase/firestore";
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dailyCollectionsRef = useMemoFirebase(
    () => (user ? collection(firestore, 'daily_collections') : null),
    [user, firestore]
  );
  const { data: dailyCollectionData, isLoading: isDataLoading } = useCollection(dailyCollectionsRef);

  const [date, setDate] = useState<Date>();
  const [dailyAmount, setDailyAmount] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  
  const sortedData = dailyCollectionData
    ? [...dailyCollectionData].sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const handleAdd = async () => {
    if (!firestore || !date || !dailyAmount || !monthlyGoal) {
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: "Todos los campos son obligatorios para agregar un registro.",
      });
      return;
    }

    const newRecordDate = format(date, "yyyy-MM-dd");
    const newRecordMonth = newRecordDate.substring(0, 7);

    try {
      await runTransaction(firestore, async (transaction) => {
        const collectionsForMonthQuery = dailyCollectionsRef;
        const querySnapshot = await collection(firestore, "daily_collections").get();
        const collectionsForMonth = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.date.startsWith(newRecordMonth));

        const accumulatedTotal = collectionsForMonth.reduce(
            (acc, item) => acc + item.dailyCollectionAmount,
            0
        ) + parseFloat(dailyAmount);
        
        const newDocRef = doc(collection(firestore, "daily_collections"));
        transaction.set(newDocRef, {
            date: newRecordDate,
            dailyCollectionAmount: parseFloat(dailyAmount),
            accumulatedMonthlyTotal: accumulatedTotal,
            monthlyGoal: parseFloat(monthlyGoal),
            updatedAt: serverTimestamp(),
        });
      });
      toast({
        title: "Éxito",
        description: "Registro de recaudación diaria agregado correctamente.",
      });
      // Clear form
      setDate(undefined);
      setDailyAmount('');
      setMonthlyGoal('');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error al agregar",
        description: "No se pudo agregar el registro. Es posible que no tenga los permisos necesarios.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "daily_collections", id));
      toast({
        title: "Éxito",
        description: "Registro eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el registro. Es posible que no tenga los permisos necesarios.",
      });
    }
  };


  const isLoading = isUserLoading || (user && isDataLoading);

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
                    <Button variant="ghost" size="icon" disabled>
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
