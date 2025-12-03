"use client";

import {
  Card,
  CardContent,
  CardDescription,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarIcon, Edit, Plus, Trash2, X, Upload, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, deleteDoc, setDoc, Timestamp, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import Image from "next/image";

const isValidImageUrl = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

export function MonthlyAchievementsCRUD() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'monthly_achievements'), orderBy('month', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const sortedData = data || [];
  
  const clearForm = () => {
    setDate(undefined);
    setDescription('');
    setImageUrl('');
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const itemDate = parse(item.month, 'yyyy-MM', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setDescription(item.description);
    setImageUrl(item.imageUrl);
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !description || !imageUrl) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete todos los campos.',
      });
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
        toast({
            variant: 'destructive',
            title: 'URL de Imagen no Válida',
            description: 'La URL debe ser un enlace directo a la imagen (terminar en .jpg, .png, etc.).',
        });
        return;
    }

    const monthStr = format(date, 'yyyy-MM');

    try {
        const dataToSave = {
            month: monthStr,
            imageUrl,
            description,
            updatedAt: Timestamp.now(),
        };

        const docRef = doc(firestore, 'monthly_achievements', monthStr);
        await setDoc(docRef, dataToSave, { merge: true });
      
        toast({ variant: 'success', title: 'Éxito', description: `El logro para ${format(date, 'MMMM yyyy', {locale: es})} ha sido guardado.` });
      
        clearForm();

    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: e.message,
      });
    }
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!firestore || !itemToDelete) return;
  
    try {
      const docRef = doc(firestore, "monthly_achievements", itemToDelete.id);
      await deleteDoc(docRef);
  
      toast({
        variant: "success",
        title: "Éxito",
        description: "El logro ha sido eliminado.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: e.message,
      });
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const isUrlValidForPreview = isValidImageUrl(imageUrl);

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Logros Mensuales (Galería)</CardTitle>
        <CardDescription>
            Añada o edite la imagen y descripción para la galería de logros del compendio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 p-4 border rounded-lg">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="month">Mes</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} className="justify-start text-left font-normal" disabled={!!editingItem}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "MMMM 'de' yyyy", { locale: es }) : <span>Seleccione un mes</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es} defaultMonth={date} />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="imageUrl">URL de la Imagen</Label>
                    <Input id="imageUrl" placeholder="https://i.imgur.com/imagen.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" placeholder="Breve resumen del hito o logro alcanzado..." value={description} onChange={e => setDescription(e.target.value)} rows={3}/>
                </div>
            </div>

            <div className="grid gap-4">
                <Label>Vista Previa de la Imagen</Label>
                <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-muted p-4">
                    {imageUrl ? (
                        isUrlValidForPreview ? (
                            <Image src={imageUrl} alt="Vista previa" fill objectFit="contain" className="rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-amber-600 dark:text-amber-400">
                                <Info className="h-10 w-10 mb-2" />
                                <p className="font-semibold">URL no válida</p>
                                <p className="text-xs text-muted-foreground px-4">
                                    La URL debe terminar en .jpg o .png. En Imgur, haz clic derecho en la imagen y elige "Copiar dirección de la imagen".
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                            <Upload className="h-10 w-10 mb-2" />
                            <p>Pegue una URL para ver la imagen.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4">
             {editingItem && (
                <Button variant="outline" onClick={clearForm}>
                    <X className="mr-2 h-4 w-4" /> Cancelar Edición
                </Button>
            )}
            <Button onClick={handleAddOrUpdate}>
                {editingItem ? (
                    <><Edit className="mr-2 h-4 w-4" /> Actualizar Logro</>
                ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Agregar Logro</>
                )}
            </Button>
        </div>


        <div className="border rounded-lg overflow-hidden">
          <div className="relative max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-table-header text-table-header-foreground z-10">
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Imagen</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Cargando datos...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-red-500">Error: {error.message}</TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">No hay logros para mostrar.</TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(parse(item.month, 'yyyy-MM', new Date()), 'MMMM yyyy', {locale: es})}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                    <TableCell>
                        <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Ver Imagen
                        </a>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )))
                }
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de que desea eliminar este logro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el logro de la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}