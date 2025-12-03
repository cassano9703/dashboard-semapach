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
import { Calendar as CalendarIcon, Edit, Plus, Trash2, X, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState, useRef } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase, useStorage } from "@/firebase";
import { collection, query, doc, deleteDoc, setDoc, Timestamp, orderBy } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import Image from "next/image";

export function MonthlyAchievementsCRUD() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  
  const dataRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'monthly_achievements'), orderBy('month', 'desc')) : null),
    [firestore]
  );
  const { data, isLoading, error } = useCollection(dataRef);

  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedData = data || [];
  
  const clearForm = () => {
    setDate(undefined);
    setDescription('');
    setEditingItem(null);
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const itemDate = parse(item.month, 'yyyy-MM', new Date());
    if (isValid(itemDate)) {
      setDate(itemDate);
    }
    setDescription(item.description);
    setImagePreview(item.imageUrl);
    setImageFile(null);
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !storage || !date || !description) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete el mes y la descripción.',
      });
      return;
    }
     if (!imageFile && !editingItem) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, suba una imagen para un nuevo logro.',
      });
      return;
    }
  
    const monthStr = format(date, 'yyyy-MM');
    let imageUrl = editingItem?.imageUrl || '';

    try {
        if (imageFile) {
            const filePath = `monthly_achievements/${monthStr}/${imageFile.name}`;
            const fileRef = storageRef(storage, filePath);
            const uploadResult = await uploadBytes(fileRef, imageFile);
            imageUrl = await getDownloadURL(uploadResult.ref);
        }

        const dataToSave = {
            month: monthStr,
            imageUrl,
            description,
            updatedAt: Timestamp.now(),
        };

        const docRef = doc(firestore, 'monthly_achievements', monthStr);
        await setDoc(docRef, dataToSave, { merge: true });
      
        toast({ variant: 'success', title: 'Éxito', description: `El logro para ${format(date, 'MMMM yyyy', {locale: es})} ha sido ${editingItem ? 'actualizado' : 'creado'}.` });
      
        clearForm();

    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: e.message,
      });
    }
  };

  const handleDelete = async (item: any) => {
    if (!firestore || !storage) return;

    const docRef = doc(firestore, "monthly_achievements", item.id);
    const imageRef = storageRef(storage, item.imageUrl);

    try {
        await deleteDoc(docRef);
        await deleteObject(imageRef).catch(error => {
            if (error.code !== 'storage/object-not-found') {
                throw error;
            }
        });
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Logros Mensuales (Galería)</CardTitle>
        <CardDescription>
            Añada o edite la imagen y descripción para la galería de logros del compendio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 p-4 border rounded-lg">
          {/* Columna de Formulario */}
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
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Breve resumen del hito o logro alcanzado..." value={description} onChange={e => setDescription(e.target.value)} rows={5}/>
            </div>
          </div>

          {/* Columna de Imagen y Acciones */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Imagen del Logro</Label>
              <Label htmlFor="image-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-4 h-48 cursor-pointer hover:bg-muted/50 transition-colors">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={imagePreview} alt="Vista previa" layout="fill" objectFit="contain" />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p className="mt-2">Haga clic para subir una imagen</p>
                  </div>
                )}
              </Label>
              <Input ref={fileInputRef} id="image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
            </div>
            <div className="flex items-end gap-2">
              <Button className="w-full" onClick={handleAddOrUpdate}>
                {editingItem ? <><Edit className="mr-2 h-4 w-4" /> Actualizar Logro</> : <><Plus className="mr-2 h-4 w-4" /> Agregar Logro</>}
              </Button>
              {editingItem && (
                <Button variant="outline" size="icon" onClick={clearForm}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
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
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
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
  );
}
