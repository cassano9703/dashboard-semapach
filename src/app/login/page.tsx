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
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    try {
      // First, try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in useUser will handle the redirect
    } catch (error: any) {
      // If sign-in fails because the user is not found, try to sign them up.
      if (error.code === 'auth/user-not-found') {
        initiateEmailSignUp(auth, email, password);
        toast({
          title: "Creando nueva cuenta",
          description: "El usuario no existía y se ha creado una nueva cuenta.",
        });
      } else {
        // Handle other errors (e.g., wrong password)
        console.error("Login Error:", error);
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: "Contraseña incorrecta o error de red.",
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico y contraseña para acceder al panel de
            administración.
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
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            Ingresar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
