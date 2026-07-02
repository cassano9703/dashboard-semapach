
"use client"

import * as React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useAuth } from "@/firebase"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Droplets, AlertCircle, ExternalLink, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [debugError, setDebugError] = React.useState<{code: string, message: string} | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setDebugError(null);
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Error de configuración",
        description: "El servicio de Firebase Auth no se ha inicializado.",
      })
      return
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      toast({
        variant: "success",
        title: "¡Bienvenido!",
        description: "Acceso concedido.",
      })
      router.push("/")
    } catch (error: any) {
      console.error("Auth Error:", error);
      const errorCode = error.code;
      const errorMessage = error.message;
      
      setDebugError({ code: errorCode, message: errorMessage });

      let userFriendlyMessage = "Credenciales incorrectas o el usuario no existe en este proyecto.";
      
      if (errorCode === 'auth/unauthorized-domain') {
        userFriendlyMessage = "ESTE DOMINIO NO ESTÁ AUTORIZADO. Vea las instrucciones abajo.";
      } else if (errorCode === 'auth/network-request-failed') {
        userFriendlyMessage = "Error de red. Verifique su conexión o si el dominio está bloqueado.";
      } else if (errorCode === 'auth/too-many-requests') {
        userFriendlyMessage = "Demasiados intentos. Intente más tarde.";
      }

      toast({
        variant: "destructive",
        title: "Fallo al ingresar",
        description: userFriendlyMessage,
      })
    }
  }

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '...';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                  <Droplets className="h-10 w-10 text-primary" />
                  <h1 className="text-3xl font-bold tracking-tight">SEMAPACH</h1>
              </div>
            <CardTitle>Panel Estadístico</CardTitle>
            <CardDescription>
              Ingrese sus credenciales de administración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="usuario@semapach.gob.pe"
                          {...field}
                          type="email"
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          {...field}
                          type="password"
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                  {isSubmitting ? "Verificando..." : "Entrar al Sistema"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {debugError && (
          <Alert variant="destructive" className="bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Error Detectado: {debugError.code}</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p className="text-sm">{debugError.message}</p>
              
              {debugError.code === 'auth/unauthorized-domain' && (
                <div className="bg-background/50 p-3 rounded border border-destructive/20 text-foreground">
                  <p className="font-bold text-xs uppercase mb-1 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Acción requerida:
                  </p>
                  <p className="text-xs mb-2">Debes agregar este dominio en tu Consola de Firebase:</p>
                  <code className="block bg-muted p-2 rounded text-[10px] break-all select-all font-mono mb-2">
                    {currentDomain}
                  </code>
                  <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Ir a Firebase Console <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-[10px] mt-2 text-muted-foreground italic">
                    Ubicación: Authentication > Settings > Authorized domains
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
