'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
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
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentDistrict, setCurrentDistrict] = useState('');
  
  const monthlyGoalRef = useRef<HTMLInputElement>(null);
  const recoveredRef = useRef<HTMLInputElement>(null);

  const isMonthlyGoalEditable = useMemo(() => {
    if (!districtProgress || !currentDate || !currentDistrict) return true;
    
    const currentMonth = currentDate.substring(0, 7);
    const existingRecordForMonthAndDistrict = districtProgress.find(item => item.month === currentMonth && item.district === currentDistrict);

    return !existingRecordForMonthAndDistrict;
  }, [districtProgress, currentDate, currentDistrict]);

  useEffect(() => {
    if (!currentDate || !currentDistrict) {
      if(monthlyGoalRef.current) monthlyGoalRef.current.value = '';
      return;
    };

    const currentMonth = currentDate.substring(0, 7);
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
  }, [currentDate, currentDistrict, districtProgress]);


  const clearForm = () => {
    setEditingId(null);
    setCurrentDate(new Date().toISOString().split('T')[0]);
    setCurrentDistrict('');
    if (recoveredRef.current) recoveredRef.current.value = '';
    if (monthlyGoalRef.current) monthlyGoalRef.current.value = '';
  };

  const handleSave = () => {
    const recovered = Number(recoveredRef.current?.value || 0);
    const monthlyGoal = Number(monthlyGoalRef.current?.value || 0);
    
    if (!currentDate || !currentDistrict) {
        alert('La fecha y el distrito son obligatorios.');
        return;
    }
    if (isMonthlyGoalEditable && monthlyGoal <= 0) {
        alert('Debe establecer una meta para el nuevo mes y distrito.');
        return;
    }

    const data = {
      date: currentDate,
      month: currentDate.substring(0, 7),
      district: currentDistrict,
      monthlyGoal: monthlyGoal,
      recovered: recovered
    };

    if (editingId) {
      const docRef = doc(firestore, 'district_progress', editingId);
      updateDocumentNonBlocking(docRef, data);
    } else {
      addDocumentNonBlocking(districtProgressRef, data);
    }
    clearForm();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setCurrentDate(item.date);
    setCurrentDistrict(item.district);
    setTimeout(() => {
        if (recoveredRef.current) recoveredRef.current.value = item.recovered.toString();
        if (monthlyGoalRef.current) monthlyGoalRef.current.value = item.monthlyGoal.toString();
    }, 0);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      const docRef = doc(firestore, 'district_progress', id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Avance por Distrito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
             <div className="grid gap-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="district">Distrito</Label>
              <Select value={currentDistrict} onValueChange={setCurrentDistrict}>
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
                className={(!isMonthlyGoalEditable && !editingId) ? 'bg-muted/50' : ''}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="recovered">Recuperado</Label>
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Meta Mensual</TableHead>
                  <TableHead>Recuperado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districtProgress?.sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
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
