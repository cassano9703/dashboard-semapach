'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  useCollection,
  useFirestore,
  useMemoFirebase,
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
import { format } from 'date-fns';

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
    if (editingId) return true; // Always editable when editing a specific record.
    if (!districtProgress || !currentMonth || !currentDistrict) return true;
    
    const existingRecordForMonthAndDistrict = districtProgress.find(item => item.month === currentMonth && item.district === currentDistrict);

    return !existingRecordForMonthAndDistrict;
  }, [districtProgress, currentMonth, currentDistrict, editingId]);

  useEffect(() => {
    if (!currentMonth || !currentDistrict || editingId) {
      if(monthlyGoalRef.current && !editingId) monthlyGoalRef.current.value = '';
      return;
    };

    const existingRecordForMonthAndDistrict = districtProgress?.find(item => item.month === currentMonth && item.district === currentDistrict);
    
    if (existingRecordForMonthAndDistrict) {
      if (monthlyGoalRef.current) {
        monthlyGoalRef.current.value = existingRecordForMonthAndDistrict.monthlyGoal.toString();
      }
    } else {
      if (monthlyGoalRef.current) {
        monthlyGoalRef.current.value = '';
      }
    }
  }, [currentMonth, currentDistrict, districtProgress, editingId]);


  const clearForm = () => {
    setEditingId(null);
    setCurrentDistrict('');
    if (recoveredRef.current) recoveredRef.current.value = '';
    if (monthlyGoalRef.current) monthlyGoalRef.current.value = '';
  };

  const handleSave = async () => {
    const recoveredAmountToAdd = Number(recoveredRef.current?.value || 0);
    const monthlyGoal = Number(monthlyGoalRef.current?.value || 0);
    
    if (!currentMonth || !currentDistrict) {
        alert('El mes y el distrito son obligatorios.');
        return;
    }

    if (recoveredAmountToAdd <= 0) {
      alert('El monto a recuperar debe ser mayor que cero.');
      return;
    }
    
    if (isMonthlyGoalEditable && monthlyGoal <= 0 && !editingId) {
        alert('Debe establecer una meta para el nuevo mes y distrito.');
        return;
    }

    if (firestore) {
      const q = query(districtProgressRef, where('month', '==', currentMonth), where('district', '==', currentDistrict));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Document exists, update it
        const docToUpdate = querySnapshot.docs[0];
        const docRef = doc(firestore, 'district_progress', docToUpdate.id);
        const updateData: { recovered: any; monthlyGoal?: number } = {
          recovered: increment(recoveredAmountToAdd)
        };
        // Only update the goal if the form allows it (and it's a new goal)
        if(isMonthlyGoalEditable) {
          updateData.monthlyGoal = monthlyGoal;
        }
        updateDocumentNonBlocking(docRef, updateData);
      } else {
        // Document doesn't exist, create it
        const data = {
          month: currentMonth,
          district: currentDistrict,
          monthlyGoal: monthlyGoal,
          recovered: recoveredAmountToAdd
        };
        addDocumentNonBlocking(districtProgressRef, data);
      }
    }

    clearForm();
  };

  const handleEdit = (item: any) => {
    alert("La edición directa ha sido deshabilitada. Para corregir un valor, elimine el registro mensual y créelo de nuevo con los valores correctos.");
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro mensual? Esta acción no se puede deshacer.')) {
      const docRef = doc(firestore, 'district_progress', id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  // Filtered and sorted data for display
  const sortedProgress = useMemo(() => {
    if (!districtProgress) return [];
    return districtProgress.sort((a, b) => {
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
              <Select value={currentDistrict} onValueChange={setCurrentDistrict} disabled={!!editingId}>
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
                readOnly={!isMonthlyGoalEditable}
                className={!isMonthlyGoalEditable ? 'bg-muted/50' : ''}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="recovered">Recuperado (a sumar)</Label>
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
                Agregar Avance
              </Button>
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
                  <TableHead>Recuperado Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProgress.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell>{item.monthlyGoal}</TableCell>
                    <TableCell>{item.recovered}</TableCell>
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
