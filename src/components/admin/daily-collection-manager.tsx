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

export function DailyCollectionManager() {
  const firestore = useFirestore();
  const dailyCollectionsRef = useMemoFirebase(
    () => collection(firestore, 'daily_collections'),
    [firestore]
  );
  const {
    data: dailyCollections,
    isLoading,
    error,
  } = useCollection(dailyCollectionsRef);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    date: '',
    dailyCollectionAmount: '',
    accumulatedMonthlyTotal: '',
    monthlyGoal: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setEditingId(null);
    setFormState({
      date: '',
      dailyCollectionAmount: '',
      accumulatedMonthlyTotal: '',
      monthlyGoal: '',
    });
  };

  const handleSave = () => {
    const data = {
      date: formState.date,
      dailyCollectionAmount: Number(formState.dailyCollectionAmount),
      accumulatedMonthlyTotal: Number(formState.accumulatedMonthlyTotal),
      monthlyGoal: Number(formState.monthlyGoal),
    };

    if (editingId) {
      const docRef = doc(firestore, 'daily_collections', editingId);
      updateDocumentNonBlocking(docRef, data);
    } else {
      addDocumentNonBlocking(dailyCollectionsRef, data);
    }
    clearForm();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormState({
      date: item.date,
      dailyCollectionAmount: item.dailyCollectionAmount.toString(),
      accumulatedMonthlyTotal: item.accumulatedMonthlyTotal.toString(),
      monthlyGoal: item.monthlyGoal.toString(),
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      const docRef = doc(firestore, 'daily_collections', id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Recaudación Diaria</CardTitle>
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
              name="dailyCollectionAmount"
              type="number"
              value={formState.dailyCollectionAmount}
              onChange={handleInputChange}
              placeholder="Recaudación Diaria"
            />
            <Input
              name="accumulatedMonthlyTotal"
              type="number"
              value={formState.accumulatedMonthlyTotal}
              onChange={handleInputChange}
              placeholder="Acumulado Mensual"
            />
            <Input
              name="monthlyGoal"
              type="number"
              value={formState.monthlyGoal}
              onChange={handleInputChange}
              placeholder="Meta Mensual"
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
                  <TableHead>Recaudación Diaria</TableHead>
                  <TableHead>Acumulado Mensual</TableHead>
                  <TableHead>Meta Mensual</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyCollections?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>S/ {item.dailyCollectionAmount.toFixed(2)}</TableCell>
                    <TableCell>S/ {item.accumulatedMonthlyTotal.toFixed(2)}</TableCell>
                    <TableCell>S/ {item.monthlyGoal.toFixed(2)}</TableCell>
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
