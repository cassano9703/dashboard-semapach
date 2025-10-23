'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  useCollection,
  useFirestore,
  useMemoFirebase,
  deleteDocumentNonBlocking
} from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, getYear, getMonth } from 'date-fns';

const districts = [
  'Tambo de Mora',
  'Chincha Baja',
  'Alto Laran',
  'Grocio Prado',
  'Sunampe',
  'Chincha Alta',
];

export function DistrictProgressManager() {
  const firestore = useFirestore();
  const districtProgressRef = useMemoFirebase(
    () => collection(firestore, 'district_progress'),
    [firestore]
  );
  const {
    data: districtProgress,
    isLoading,
    error,
  } = useCollection(districtProgressRef);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [currentDistrict, setCurrentDistrict] = useState('');
  
  const monthlyGoalRef = useRef<HTMLInputElement>(null);
  const recoveredRef = useRef<HTMLInputElement>(null);

  const isMonthlyGoalEditable = useMemo(() => {
    if (!districtProgress || !currentMonth || !currentDistrict) return true;
    const existingRecordForMonth = districtProgress.find(item => item.month === currentMonth && item.district === currentDistrict);
    return !existingRecordForMonth;
  }, [districtProgress, currentMonth, currentDistrict]);

  useEffect(() => {
    if (!currentMonth || !currentDistrict || !districtProgress) return;
    const existingRecord = districtProgress.find(item => item.month === currentMonth && item.district === currentDistrict);
    if (existingRecord) {
      if (monthlyGoalRef.current) monthlyGoalRef.current.value = existingRecord.monthlyGoal.toString();
      if (recoveredRef.current && !editingId) recoveredRef.current.value = ''; // Clear recovered amount for adding new amounts
    } else {
      if (monthlyGoalRef.current) monthlyGoalRef.current.value = '';
    }
  }, [currentMonth, currentDistrict, districtProgress, editingId]);


  const clearForm = () => {
    setEditingId(null);
    setCurrentMonth(format(new Date(), 'yyyy-MM'));
    setCurrentDistrict('');
    if (monthlyGoalRef.current) monthlyGoalRef.current.value = '';
    if (recoveredRef.current) recoveredRef.current.value = '';
  };

  const handleSave = () => {
    const monthlyGoal = Number(monthlyGoalRef.current?.value || 0);
    const amountToAdd = Number(recoveredRef.current?.value || 0);
    
    if (!currentMonth || !currentDistrict) {
        alert('El mes y el distrito son obligatorios.');
        return;
    }
    
    if (isMonthlyGoalEditable && monthlyGoal <= 0) {
        alert('La meta mensual debe ser mayor a cero.');
        return;
    }

    if (amountToAdd <= 0 && !editingId) {
      alert('El monto a recuperar debe ser mayor a cero.');
      return;
    }

    const existingRecord = districtProgress?.find(item => item.month === currentMonth && item.district === currentDistrict);

    if (editingId) { // Full edit mode
        const recoveredValue = Number(recoveredRef.current?.value || 0);
        const data = {
            monthlyGoal: monthlyGoal,
            recovered: recoveredValue,
        };
        const docRef = doc(firestore, 'district_progress', editingId);
        updateDocumentNonBlocking(docRef, data);

    } else if (existingRecord) { // Add to existing record
      const newRecovered = existingRecord.recovered + amountToAdd;
      const docRef = doc(firestore, 'district_progress', existingRecord.id);
      updateDocumentNonBlocking(docRef, { recovered: newRecovered });
    } else { // Create new record
      const data = {
        month: currentMonth,
        district: currentDistrict,
        monthlyGoal: monthlyGoal,
        recovered: amountToAdd,
      };
      addDocumentNonBlocking(districtProgressRef, data);
    }
    clearForm();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setCurrentMonth(item.month);
    setCurrentDistrict(item.district);
    setTimeout(() => {
        if (monthlyGoalRef.current) monthlyGoalRef.current.value = item.monthlyGoal.toString();
        if (recoveredRef.current) recoveredRef.current.value = item.recovered.toString();
    }, 0);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      const docRef = doc(firestore, 'district_progress', id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  const sortedProgress = useMemo(() => {
    if (!districtProgress) return [];
    return [...districtProgress].sort((a, b) => {
      if (a.month === b.month) {
          return a.district.localeCompare(b.district);
      }
      return b.month.localeCompare(a.month);
    });
  }, [districtProgress]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Avance por Distrito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
             <div className="grid gap-1.5">
              <Label htmlFor="month">Mes</Label>
              <Input
                id="month"
                name="month"
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="district">Distrito</Label>
              <Select value={currentDistrict} onValueChange={setCurrentDistrict} >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Seleccione un distrito" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="monthlyGoal">Meta Mensual</Label>
              <Input
                id="monthlyGoal"
                ref={monthlyGoalRef}
                name="monthlyGoal"
                type="number"
                placeholder="0"
                readOnly={!isMonthlyGoalEditable && !editingId}
                className={!isMonthlyGoalEditable && !editingId ? 'bg-muted/50' : ''}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="recovered">{editingId ? "Total Recuperado" : "Añadir Recuperado"}</Label>
              <Input
                id="recovered"
                ref={recoveredRef}
                name="recovered"
                type="number"
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {editingId ? 'Actualizar' : 'Agregar'}
              </Button>
              {editingId && (
                <Button onClick={clearForm} variant="outline" className="w-full">
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {isLoading && <p>Cargando datos...</p>}
          {error && <p className="text-red-500">{error.message}</p>}

          <div className="overflow-x-auto">
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
                {sortedProgress.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell>S/ {item.monthlyGoal?.toFixed(2)}</TableCell>
                    <TableCell>S/ {item.recovered?.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
