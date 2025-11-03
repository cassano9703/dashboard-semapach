"use client";

import { useState } from "react";
import Papa from "papaparse";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { Label } from "../ui/label";

// NOTE: The write functionality is disabled to prevent permission errors.
// const firestore = useFirestore();
// const districtProgressRef = collection(firestore, 'district_progress');

export function DistrictProgressManager() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, seleccione un archivo CSV.",
      });
      return;
    }

    // Immediately show a toast indicating the feature is disabled.
    toast({
        variant: "destructive",
        title: "Función Deshabilitada",
        description: "La carga de datos está deshabilitada debido a problemas de permisos del servidor.",
    });


    // The logic below is kept for context but is not executed.
    const uploadLogic = () => {
        setIsUploading(true);
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            const data = results.data as any[];
            // Here you would typically write to Firestore
            console.log("Parsed District Progress Data (not uploaded):", data);

            // Example of what would happen:
            // for (const row of data) {
            //   const docData = { ... };
            //   await addDoc(districtProgressRef, docData);
            // }

            setIsUploading(false);
          },
          error: (error: any) => {
            console.error("Error parsing CSV:", error);
            toast({
              variant: "destructive",
              title: "Error al procesar el archivo",
              description: "El archivo CSV no pudo ser procesado.",
            });
            setIsUploading(false);
          },
        });
    }

    // uploadLogic(); // This is intentionally commented out.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avance por Distrito</CardTitle>
        <CardDescription>
          Cargue un archivo CSV con el progreso mensual de los distritos.
          Columnas requeridas: `month`, `district`, `monthlyGoal`, `recovered`.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-district">Archivo CSV</Label>
            <Input id="csv-district" type="file" accept=".csv" onChange={handleFileChange} />
        </div>
        <Button onClick={handleUpload} disabled={isUploading}>
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Cargando..." : "Cargar Datos"}
        </Button>
      </CardContent>
    </Card>
  );
}
