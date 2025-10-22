'use client';
import { useState, useRef } from 'react';
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

  // Use refs for form inputs
  const dateRef = useRef<HTMLInputElement>(null);
  const districtRef = useRef<HTMLInputElement>(null);
  const dailyGoalRef = useRef<HTMLInputElement>(null);
  const recoveredRef = useRef<HTMLInputElement>(null);


  const clearForm = () => {
    setEditingId(null);
    if (dateRef.current) dateRef.current.value = '';
    if (districtRef.current) districtRef.current.value = '';
    if (dailyGoalRef.current) dailyGoalRef.current.value = '';
    if (recoveredRef.current) recoveredRef.current.value = '';
  };

  const handleSave = () => {
    const data = {
      date: dateRef.current?.value || '',
      district: districtRef.current?.value || '',
      dailyGoal: Number(dailyGoalRef.current?.value || 0),
      recovered: Number(recoveredRef.current?.value || 0),
    };

    if (!data.date || !data.district) {
        alert('La fecha y el distrito son obligatorios.');
        return;
    }

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
    setTimeout(() => {
        if (dateRef.current) dateRef.current.value = item.date;
        if (districtRef.current) districtRef.current.value = item.district;
        if (dailyGoalRef.current) dailyGoalRef.current.value = item.dailyGoal.toString();
        if (recoveredRef.current) recoveredRef.current.value = item.recovered.toString();
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              ref={dateRef}
              name="date"
              type="date"
              placeholder="Fecha"
              defaultValue={editingId ? undefined : new Date().toISOString().split('T')[0]}
            />
            <Input
              ref={districtRef}
              name="district"
              type="text"
              placeholder="Distrito"
            />
            <Input
              ref={dailyGoalRef}
              name="dailyGoal"
              type="number"
              placeholder="Meta Diaria"
            />
            <Input
              ref={recoveredRef}
              name="recovered"
              type="number"
              placeholder="Recuperado"
            />
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
                  <TableHead>Meta Diaria</TableHead>
                  <TableHead>Recuperado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districtProgress?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell>{item.dailyGoal}</TableCell>
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
