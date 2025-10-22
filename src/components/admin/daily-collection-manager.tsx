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

  // Use refs for form inputs
  const dateRef = useRef<HTMLInputElement>(null);
  const dailyCollectionAmountRef = useRef<HTMLInputElement>(null);
  const accumulatedMonthlyTotalRef = useRef<HTMLInputElement>(null);
  const monthlyGoalRef = useRef<HTMLInputElement>(null);

  const clearForm = () => {
    setEditingId(null);
    if (dateRef.current) dateRef.current.value = '';
    if (dailyCollectionAmountRef.current) dailyCollectionAmountRef.current.value = '';
    if (accumulatedMonthlyTotalRef.current) accumulatedMonthlyTotalRef.current.value = '';
    if (monthlyGoalRef.current) monthlyGoalRef.current.value = '';
  };

  const handleSave = () => {
    const data = {
      date: dateRef.current?.value || '',
      dailyCollectionAmount: Number(dailyCollectionAmountRef.current?.value || 0),
      accumulatedMonthlyTotal: Number(accumulatedMonthlyTotalRef.current?.value || 0),
      monthlyGoal: Number(monthlyGoalRef.current?.value || 0),
    };

    if (!data.date) {
        // Optional: Add user feedback for required fields
        alert('La fecha es obligatoria.');
        return;
    }

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
    // Set initial values for the refs when editing
    setTimeout(() => {
        if (dateRef.current) dateRef.current.value = item.date;
        if (dailyCollectionAmountRef.current) dailyCollectionAmountRef.current.value = item.dailyCollectionAmount.toString();
        if (accumulatedMonthlyTotalRef.current) accumulatedMonthlyTotalRef.current.value = item.accumulatedMonthlyTotal.toString();
        if (monthlyGoalRef.current) monthlyGoalRef.current.value = item.monthlyGoal.toString();
    }, 0);
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
              ref={dateRef}
              name="date"
              type="date"
              placeholder="Fecha"
              defaultValue={editingId ? undefined : new Date().toISOString().split('T')[0]}
            />
            <Input
              ref={dailyCollectionAmountRef}
              name="dailyCollectionAmount"
              type="number"
              placeholder="Recaudación Diaria"
            />
            <Input
              ref={accumulatedMonthlyTotalRef}
              name="accumulatedMonthlyTotal"
              type="number"
              placeholder="Acumulado Mensual"
            />
            <Input
              ref={monthlyGoalRef}
              name="monthlyGoal"
              type="number"
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
