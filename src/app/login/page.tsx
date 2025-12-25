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
import { Droplets } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "El servicio de autenticación no está disponible.",
      })
      return
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      toast({
        variant: "success",
        title: "¡Bienvenido!",
        description: "Ha iniciado sesión correctamente.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: "Las credenciales son incorrectas. Por favor, intente de nuevo.",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Droplets className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">SEMAPACH</h1>
            </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al panel.
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
                        placeholder="admin@semapach.com"
                        {...field}
                        type="email"
                        autoComplete="email"
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
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
