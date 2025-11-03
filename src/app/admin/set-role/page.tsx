'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setAdminRole } from '@/ai/flows/set-role-flow';

// Temporal: Define el primer administrador por su email.
// REEMPLAZA ESTO con el email completo del administrador inicial.
const SUPER_ADMIN_EMAIL = 'cassano9703@gmail.com'; 

export default function SetRolePage() {
  const [emailToMakeAdmin, setEmailToMakeAdmin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, claims, isUserLoading } = useUser();
  const router = useRouter();

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  const isAdmin = claims?.claims?.role === 'admin';

  useEffect(() => {
    // Redirigir si no está cargando y no es admin/super-admin
    if (!isUserLoading && !isAdmin && !isSuperAdmin) {
      toast({
        variant: 'destructive',
        title: 'Acceso denegado',
        description: 'No tienes permisos para acceder a esta página.',
      });
      router.push('/admin');
    }
  }, [user, claims, isUserLoading, router, isAdmin, isSuperAdmin, toast]);

  const handleSetRole = async () => {
    if (!emailToMakeAdmin) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, ingrese un correo electrónico.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await setAdminRole({ email: emailToMakeAdmin });
      toast({
        title: 'Éxito',
        description: result.message,
      });
      setEmailToMakeAdmin('');
    } catch (error: any) {
      console.error('Error setting role:', error);
      toast({
        variant: 'destructive',
        title: 'Error al asignar rol',
        description: error.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Muestra un estado de carga mientras se verifica el usuario
  if (isUserLoading || (!isAdmin && !isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <h1 className="text-3xl font-bold tracking-tight">Asignar Rol de Administrador</h1>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Asignar rol de Administrador</CardTitle>
          <CardDescription>
            Introduce el correo electrónico del usuario al que deseas darle permisos de administrador. 
            El usuario debe existir previamente en Firebase Authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico del Usuario</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              required
              value={emailToMakeAdmin}
              onChange={(e) => setEmailToMakeAdmin(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetRole} disabled={isSubmitting}>
            {isSubmitting ? 'Asignando...' : 'Asignar Rol de Administrador'}
          </Button>
        </CardFooter>
      </Card>
      {isSuperAdmin && !isAdmin && (
          <Card className="w-full max-w-lg border-amber-500">
             <CardHeader>
                 <CardTitle className="text-amber-600">Paso Inicial Requerido</CardTitle>
                 <CardDescription>
                    Eres el súper administrador. Para completar la configuración, por favor asigna el rol de 'admin' a tu propia cuenta ({user?.email}) usando el formulario de arriba.
                 </CardDescription>
             </CardHeader>
          </Card>
      )}
    </div>
  );
}