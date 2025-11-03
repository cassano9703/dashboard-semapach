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
import { Calendar as CalendarIcon, Edit, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, doc, deleteDoc, query, where, getDocs, writeBatch, updateDoc } from "firebase/firestore";
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const districtProgressRef = useMemoFirebase(
    () => (user ? collection(firestore, 'district_progress') : null),
    [user, firestore]
  );
  const { data: districtProgressData, isLoading: isDataLoading } = useCollection(districtProgressRef);

  const [date, setDate] = useState<Date>();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [recoveredAmount, setRecoveredAmount] = useState('');

  
  const sortedData = districtProgressData
    ? [...districtProgressData].sort((a, b) => b.month.localeCompare(a.month) || a.district.localeCompare(b.district))
    : [];

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !selectedDistrict || !monthlyGoal || !recoveredAmount) {
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: "Todos los campos son requeridos.",
      });
      return;
    }

    const monthStr = format(date, 'yyyy-MM');
    const goal = parseFloat(monthlyGoal);
    const recovered = parseFloat(recoveredAmount);

    try {
      const q = query(
        collection(firestore, "district_progress"),
        where("month", "==", monthStr),
        where("district", "==", selectedDistrict)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Add new document
        await addDoc(collection(firestore, "district_progress"), {
          month: monthStr,
          district: selectedDistrict,
          monthlyGoal: goal,
          recovered: recovered,
          updatedAt: new Date(),
        });
        toast({
          title: "Éxito",
          description: "Nuevo progreso de distrito agregado.",
        });
      } else {
        // Update existing document
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(firestore, "district_progress", docId);
        await updateDoc(docRef, {
          monthlyGoal: goal,
          recovered: recovered,
          updatedAt: new Date(),
        });
        toast({
          title: "Éxito",
          description: "Progreso de distrito actualizado.",
        });
      }
      
      // Reset form
      setDate(undefined);
      setSelectedDistrict('');
      setMonthlyGoal('');
      setRecoveredAmount('');

    } catch (error: any) {
        console.error("Error adding/updating document: ", error);
        toast({
            variant: "destructive",
            title: "Error al Guardar",
            description: error.code === 'permission-denied' 
            ? "No tienes permisos para esta acción." 
            : "Ocurrió un error al guardar el registro.",
        });
    }
  };

  const handleDelete = (id: string) => {
     toast({
        variant: "destructive",
        title: "Función Deshabilitada",
        description: "Las acciones de escritura (borrar) están deshabilitadas por falta de permisos.",
    });
  };

  const handleEditClick = () => {
    toast({
        title: "Función no implementada",
        description: "La edición de registros se implementará próximamente.",
    });
  }

  const isLoading = isUserLoading || (user && isDataLoading);

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
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
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
          <Button className="w-full md:w-auto" onClick={handleAddOrUpdate}>
            <Plus className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
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
              ) : sortedData.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No hay datos para mostrar.</TableCell>
                </TableRow>
              ) : (
                sortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.month}</TableCell>
                  <TableCell>{item.district}</TableCell>
                  <TableCell>{formatCurrency(item.monthlyGoal)}</TableCell>
                  <TableCell>{formatCurrency(item.recovered)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={handleEditClick}>
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
