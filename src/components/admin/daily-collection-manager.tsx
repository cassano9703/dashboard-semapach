'use client';
import { useState, useRef, useEffect } from 'react';
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
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMonthGoalEditable, setIsMonthGoalEditable] = useState(false);

  const dailyCollectionAmountRef = useRef<HTMLInputElement>(null);
  const monthlyGoalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dailyCollections && currentDate) {
      const selectedMonth = currentDate.substring(0, 7);
      const collectionsForMonth = dailyCollections.filter(item => item.date.startsWith(selectedMonth));
      
      if (collectionsForMonth.length > 0) {
        setIsMonthGoalEditable(false);
        if (monthlyGoalRef.current) {
          monthlyGoalRef.current.value = collectionsForMonth[0].monthlyGoal.toString();
        }
      } else {
        setIsMonthGoalEditable(true);
        if (monthlyGoalRef.current) {
          monthlyGoalRef.current.value = ''; // Clear for new month
        }
      }
    }
  }, [currentDate, dailyCollections]);


  const clearForm = () => {
    setEditingId(null);
    setCurrentDate(new Date().toISOString().split('T')[0]);
    if (dailyCollectionAmountRef.current) dailyCollectionAmountRef.current.value = '';
    // monthlyGoalRef is handled by useEffect
  };

  const handleSave = () => {
    const dailyAmount = Number(dailyCollectionAmountRef.current?.value || 0);
    const monthlyGoal = Number(monthlyGoalRef.current?.value || 0);
    
    if (!currentDate) {
        alert('La fecha es obligatoria.');
        return;
    }
    if (isMonthGoalEditable && monthlyGoal <= 0) {
        alert('Debe establecer una meta para el nuevo mes.');
        return;
    }

    // Calculate accumulated monthly total
    const selectedMonth = currentDate.substring(0, 7);
    const collectionsForMonth = (dailyCollections || []).filter(item => item.date.startsWith(selectedMonth) && item.id !== editingId);
    const accumulatedMonthlyTotal = collectionsForMonth.reduce((acc, item) => acc + item.dailyCollectionAmount, 0) + dailyAmount;

    const data = {
      date: currentDate,
      dailyCollectionAmount: dailyAmount,
      accumulatedMonthlyTotal: accumulatedMonthlyTotal,
      monthlyGoal: monthlyGoal,
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
    setCurrentDate(item.date);
    setTimeout(() => {
        if (dailyCollectionAmountRef.current) dailyCollectionAmountRef.current.value = item.dailyCollectionAmount.toString();
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
              <Label htmlFor="dailyCollectionAmount">Recaudación Diaria</Label>
              <Input
                id="dailyCollectionAmount"
                ref={dailyCollectionAmountRef}
                name="dailyCollectionAmount"
                type="number"
                placeholder="S/ 0.00"
              />
            </div>
            <div className="grid gap-1.5">
               <Label htmlFor="monthlyGoal">Meta Mensual</Label>
              <Input
                id="monthlyGoal"
                ref={monthlyGoalRef}
                name="monthlyGoal"
                type="number"
                placeholder="S/ 0.00"
                readOnly={!isMonthGoalEditable}
                className={!isMonthGoalEditable ? 'bg-muted/50' : ''}
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
                  <TableHead>Recaudación Diaria</TableHead>
                  <TableHead>Acumulado Mensual</TableHead>
                  <TableHead>Meta Mensual</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyCollections?.sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.dailyCollectionAmount.toFixed(2)}</TableCell>
                    <TableCell>{item.accumulatedMonthlyTotal.toFixed(2)}</TableCell>
                    <TableCell>{item.monthlyGoal.toFixed(2)}</TableCell>
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
