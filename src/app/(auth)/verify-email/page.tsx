"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Code2 } from "lucide-react"
import Link from "next/link"
import api from "@/lib/axios"

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("Token de verificación no encontrado")
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await api.get(`/auth/verify-email?token=${token}`)
                setStatus("success")
                setMessage(response.data.message || "Email verificado exitosamente")
            } catch (error: any) {
                setStatus("error")
                setMessage(
                    error.response?.data?.message || "Error al verificar el email. El token puede estar expirado."
                )
            }
        }

        verifyEmail()
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <Card className="relative w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        {status === "loading" && (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        )}
                        {status === "success" && (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        )}
                        {status === "error" && (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                <XCircle className="h-8 w-8 text-destructive" />
                            </div>
                        )}
                    </div>

                    <CardTitle className="text-2xl">
                        {status === "loading" && "Verificando email..."}
                        {status === "success" && "¡Email verificado!"}
                        {status === "error" && "Error de verificación"}
                    </CardTitle>

                    <CardDescription className="text-base">
                        {message}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {status === "success" && (
                        <div className="space-y-3">
                            <p className="text-sm text-center text-muted-foreground">
                                Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
                            </p>
                            <Link href="/login" className="block">
                                <Button className="w-full">
                                    Iniciar sesión
                                </Button>
                            </Link>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-3">
                            <Link href="/login" className="block">
                                <Button variant="outline" className="w-full">
                                    Volver al inicio
                                </Button>
                            </Link>
                        </div>
                    )}

                    {status === "loading" && (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Por favor espera mientras verificamos tu email...
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}