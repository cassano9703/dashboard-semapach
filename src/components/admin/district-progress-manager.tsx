'use client';
import { useState } from 'react';
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
  const [formState, setFormState] = useState({
    date: '',
    district: '',
    dailyGoal: '',
    recovered: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setEditingId(null);
    setFormState({
      date: '',
      district: '',
      dailyGoal: '',
      recovered: '',
    });
  };

  const handleSave = () => {
    const data = {
      date: formState.date,
      district: formState.district,
      dailyGoal: Number(formState.dailyGoal),
      recovered: Number(formState.recovered),
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
    setFormState({
      date: item.date,
      district: item.district,
      dailyGoal: item.dailyGoal.toString(),
      recovered: item.recovered.toString(),
    });
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
              name="date"
              type="date"
              value={formState.date}
              onChange={handleInputChange}
              placeholder="Fecha"
            />
            <Input
              name="district"
              type="text"
              value={formState.district}
              onChange={handleInputChange}
              placeholder="Distrito"
            />
            <Input
              name="dailyGoal"
              type="number"
              value={formState.dailyGoal}
              onChange={handleInputChange}
              placeholder="Meta Diaria"
            />
            <Input
              name="recovered"
              type="number"
              value={formState.recovered}
              onChange={handleInputChange}
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
