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
import { Calendar as CalendarIcon, Edit, Plus, Trash2, X, UploadCloud, Image as ImageIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState, useRef, ChangeEvent } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useCollection, useFirestore, useMemoFirebase, useStorage } from "@/firebase";
import { collection, query, doc, deleteDoc, setDoc, Timestamp, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedData = data || [];
  
  const clearForm = () => {
    setDate(undefined);
    setDescription('');
    setImageFile(null);
    setPreviewUrl(null);
    setEditingItem(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
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
    setPreviewUrl(item.imageUrl);
    setImageFile(null);
  };

  const handleAddOrUpdate = async () => {
    if (!firestore || !date || !description) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Por favor, complete mes y descripción.',
      });
      return;
    }

    if (!imageFile && !editingItem) {
        toast({ variant: 'destructive', title: 'Error de validación', description: 'Por favor, seleccione una imagen.' });
        return;
    }

    setIsUploading(true);

    const monthStr = format(date, 'yyyy-MM');
    let imageUrl = editingItem?.imageUrl || '';

    try {
        if (imageFile && storage) {
            const storageRef = ref(storage, `monthly_achievements/${monthStr}/${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(storageRef);
        }

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!firestore || !storage) return;

    const confirmed = window.confirm("¿Está seguro de que desea eliminar este logro? La imagen también será eliminada.");
    if (!confirmed) return;

    try {
        // Delete Firestore document
        const docRef = doc(firestore, "monthly_achievements", item.id);
        await deleteDoc(docRef);

        // Delete image from Storage
        const imageRef = ref(storage, item.imageUrl);
        await deleteObject(imageRef);

        toast({
            variant: "success",
            title: "Éxito",
            description: "El logro ha sido eliminado.",
        });
    } catch (e: any) {
        // Handle cases where the file might not exist in storage anymore
        if (e.code === 'storage/object-not-found') {
             const docRef = doc(firestore, "monthly_achievements", item.id);
             await deleteDoc(docRef); // Still delete the DB record
             toast({ variant: 'success', title: 'Éxito', description: 'El logro ha sido eliminado (la imagen no se encontró en el almacenamiento).'});
        } else {
            toast({
                variant: "destructive",
                title: "Error al eliminar",
                description: e.message,
            });
        }
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
            {/* Left Column */}
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

            {/* Right Column */}
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Imagen del Logro</Label>
                    <div 
                        className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Input ref={fileInputRef} id="imageFile" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
                        {previewUrl ? (
                             <Image src={previewUrl} alt="Vista previa" layout="fill" objectFit="contain" className="rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG o GIF</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4">
             {editingItem && (
                <Button variant="outline" onClick={clearForm} disabled={isUploading}>
                    <X className="mr-2 h-4 w-4" /> Cancelar Edición
                </Button>
            )}
            <Button onClick={handleAddOrUpdate} disabled={isUploading}>
                {isUploading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Guardando...</>
                ) : editingItem ? (
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
