"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Loader2, Mail, Lock, User } from "lucide-react"

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

const registerSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

interface AuthFormProps {
    mode: "login" | "register"
    onSubmit: (data: any) => Promise<void>
    isLoading?: boolean
}

export function AuthForm({ mode, onSubmit, isLoading }: AuthFormProps) {
    const isLogin = mode === "login"

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <Card className="relative w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="space-y-3">
                    <div className="flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                            <Code2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">
                        {isLogin ? "Bienvenido de vuelta" : "Crear cuenta"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isLogin
                            ? "Ingresa tus credenciales para continuar"
                            : "Regístrate para comenzar a comparar LLMs"}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nombre</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="firstName"
                                            placeholder="Juan"
                                            className="pl-9"
                                            {...register("firstName")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Apellido</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Pérez"
                                        {...register("lastName")}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="pl-9"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message as string}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                                {isLogin && (
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9"
                                    {...register("password")}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message as string}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                                </>
                            ) : (
                                <>{isLogin ? "Iniciar sesión" : "Crear cuenta"}</>
                            )}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                            <Link
                                href={isLogin ? "/register" : "/login"}
                                className="text-primary hover:underline font-medium"
                            >
                                {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}