'use client';

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
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in useUser will handle the redirect
    } catch (error: any) {
        // Handle other errors (e.g., wrong password)
        console.error("Login Error:", error);
        let description = "Ocurrió un error inesperado.";
        if (error.code === 'auth/user-not-found') {
          description = "El usuario no existe.";
        } else if (error.code === 'auth/wrong-password') {
          description = "Contraseña incorrecta. Por favor, intente de nuevo.";
        } else if (error.code === 'auth/invalid-credential') {
            description = "Credenciales inválidas. Verifique su correo y contraseña.";
        }
        
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: description,
        });
    }
  };
  
  const handleSignUp = async () => {
    if (!auth) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
          title: "Cuenta creada",
          description: "Se ha creado una nueva cuenta y se ha iniciado sesión.",
      });
      // The onAuthStateChanged listener will redirect to /admin
    } catch (error: any) {
        console.error("Sign Up Error:", error);
        let description = "No se pudo crear la cuenta.";
        if (error.code === 'auth/email-already-in-use') {
          description = "Este correo electrónico ya está en uso.";
        } else if (error.code === 'auth/weak-password') {
          description = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
        }
        toast({
          variant: "destructive",
          title: "Error de registro",
          description: description,
        });
    }
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión / Registrarse</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder o crear una cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@semapach.gob.pe"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleLogin}>
            Ingresar
          </Button>
          <Button variant="outline" className="w-full" onClick={handleSignUp}>
            Registrar Nueva Cuenta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
