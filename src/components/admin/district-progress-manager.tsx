'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import {
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
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const districts = [
  'Tambo de Mora',
  'Chincha Baja',
  'Alto Laran',
  'Grocio Prado',
  'Sunampe',
  'Chincha Alta'
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

  const existingRecordForMonth = useMemo(() => {
    if (!districtProgress || !currentMonth || !currentDistrict) return null;
    return districtProgress.find(item => item.month === currentMonth && item.district === currentDistrict);
  }, [districtProgress, currentMonth, currentDistrict]);

  useEffect(() => {
    if (editingId) {
      // In editing mode, just fill the fields, don't clear them
      const recordToEdit = districtProgress?.find(item => item.id === editingId);
      if (recordToEdit) {
        if (monthlyGoalRef.current) monthlyGoalRef.current.value = recordToEdit.monthlyGoal.toString();
        if (recoveredRef.current) recoveredRef.current.value = recordToEdit.recovered.toString();
      }
      return;
    }
    
    // In new-entry mode
    if (existingRecordForMonth) {
      if (monthlyGoalRef.current) monthlyGoalRef.current.value = existingRecordForMonth.monthlyGoal.toString();
    } else {
      if (monthlyGoalRef.current) monthlyGoalRef.current.value = '';
    }
    if (recoveredRef.current) recoveredRef.current.value = '';

  }, [existingRecordForMonth, editingId, districtProgress]);


  const clearForm = () => {
    setEditingId(null);
    setCurrentDistrict('');
    setCurrentMonth(format(new Date(), 'yyyy-MM'));
    if (recoveredRef.current) recoveredRef.current.value = '';
    // useEffect will handle the monthly goal field
  };

  const handleSave = async () => {
    const newRecoveredAmount = Number(recoveredRef.current?.value || 0);
    const monthlyGoal = Number(monthlyGoalRef.current?.value || 0);

    if (!currentMonth || !currentDistrict) {
      alert('El mes y el distrito son obligatorios.');
      return;
    }

    if (!existingRecordForMonth && !editingId && monthlyGoal <= 0) {
      alert('Debe establecer una meta mensual para el nuevo registro.');
      return;
    }
    
    const docId = editingId || `${currentMonth}-${currentDistrict.replace(/\s+/g, '-')}`;
    const docRef = doc(firestore, 'district_progress', docId);

    let finalData;

    if (editingId) {
        // When editing, we overwrite the values
        finalData = {
            id: docId,
            month: currentMonth,
            district: currentDistrict,
            monthlyGoal: monthlyGoal,
            recovered: newRecoveredAmount
        };
    } else {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Document exists, sum the recovered amount
            const existingData = docSnap.data();
            finalData = {
                ...existingData,
                recovered: (existingData.recovered || 0) + newRecoveredAmount,
            };
        } else {
            // Document doesn't exist, create a new one
            finalData = {
                id: docId,
                month: currentMonth,
                district: currentDistrict,
                monthlyGoal: monthlyGoal,
                recovered: newRecoveredAmount
            };
        }
    }

    setDocumentNonBlocking(docRef, finalData, { merge: true });
    clearForm();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setCurrentMonth(item.month);
    setCurrentDistrict(item.district);
    
    // Use setTimeout to ensure the fields are enabled before setting the value
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
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setCurrentDistrict(''); // Reset selection to force re-evaluation
    setCurrentMonth(format(new Date(), 'yyyy-MM'));
  }

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
                onChange={(e) => {
                  if (!editingId) {
                    setCurrentMonth(e.target.value)
                  }
                }}
                disabled={!!editingId}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="district">Distrito</Label>
              <Select
                value={currentDistrict}
                onValueChange={(value) => {
                   if (!editingId) {
                    setCurrentDistrict(value)
                   }
                }}
                disabled={!!editingId}
              >
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
                readOnly={!!existingRecordForMonth && !editingId}
                className={(!!existingRecordForMonth && !editingId) ? 'bg-muted/50' : ''}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="recovered">{editingId ? 'Total Recuperado' : 'Añadir Recuperado'}</Label>
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
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
              {editingId && (
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="w-full"
                >
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
                {districtProgress
                  ?.sort((a, b) => b.month.localeCompare(a.month) || a.district.localeCompare(b.district))
                  .map((item) => (
                    <TableRow key={item.id}>
                       <TableCell>{format(new Date(`${item.month}-02`), "LLLL yyyy", { locale: es })}</TableCell>
                      <TableCell>{item.district}</TableCell>
                      <TableCell>{item.monthlyGoal}</TableCell>
                      <TableCell>{item.recovered}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
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
