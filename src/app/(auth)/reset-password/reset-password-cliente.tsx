"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Loader2, Lock, CheckCircle2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import Link from "next/link"

const schema = z.object({
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data: FormData) => {
        if (!token) {
            toast.error("Error", { description: "Token no encontrado" })
            return
        }

        try {
            setIsLoading(true)
            await api.post("/auth/reset-password", {
                token,
                newPassword: data.newPassword,
            })
            setSuccess(true)
            toast.success("Contraseña restablecida", {
                description: "Ya puedes iniciar sesión con tu nueva contraseña",
            })
        } catch (error: any) {
            toast.error("Error", {
                description: error.response?.data?.message || "Error al restablecer la contraseña",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                <Card className="relative w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">¡Contraseña restablecida!</CardTitle>
                        <CardDescription>
                            Tu contraseña ha sido actualizada exitosamente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Link href="/login">
                            <Button className="w-full">
                                <Lock className="mr-2 h-4 w-4" />
                                Iniciar sesión
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                <Card className="relative w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                                <Lock className="h-6 w-6 text-destructive" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Token no encontrado</CardTitle>
                        <CardDescription>
                            El enlace de recuperación no es válido o ha expirado
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Link href="/forgot-password">
                            <Button variant="outline" className="w-full">
                                Solicitar nuevo enlace
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <Card className="relative w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                            <Lock className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
                    <CardDescription>Ingresa tu nueva contraseña segura</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                {...register("newPassword")}
                            />
                            {errors.newPassword && (
                                <p className="text-sm text-destructive">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repite la contraseña"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Restableciendo...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Restablecer contraseña
                                </>
                            )}
                        </Button>

                        <Link href="/login" className="w-full">
                            <Button variant="ghost" className="w-full text-muted-foreground">
                                Volver al inicio de sesión
                            </Button>
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
