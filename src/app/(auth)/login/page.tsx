"use client"

import { useAuthStore } from "@/store/auth-store"
import { AuthForm } from "@/components/auth/auth-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Code2, Loader2, Shield, ArrowLeft } from "lucide-react"

export default function LoginPage() {
    const { login, verify2FA, cancel2FA, isLoading, user, requiresTwoFactor } = useAuthStore()
    const router = useRouter()
    const [twoFactorCode, setTwoFactorCode] = useState("")

    // Redirigir si ya está autenticado según el rol
    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') {
                router.push("/dashboard/admin")
            } else if (user.role === 'EVALUATOR') {
                router.push("/dashboard/evaluator")
            } else {
                router.push("/dashboard")
            }
        }
    }, [user, router])

    const handleLogin = async (data: any) => {
        await login(data)
    }

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault()
        if (twoFactorCode.length !== 6 && !twoFactorCode.includes("-")) {
            return
        }
        await verify2FA(twoFactorCode)
    }

    const handleCancel2FA = () => {
        cancel2FA()
        setTwoFactorCode("")
    }

    // Mostrar pantalla de 2FA
    if (requiresTwoFactor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                <Card className="relative w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="space-y-3">
                        <div className="flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                                <Shield className="h-6 w-6 text-primary-foreground" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">
                            Verificación de dos factores
                        </CardTitle>
                        <CardDescription className="text-center">
                            Ingresa el código de 6 dígitos de tu app de autenticación o un código de respaldo
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleVerify2FA}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Código de verificación</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    maxLength={10}
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9A-Za-z-]/g, ""))}
                                    placeholder="000000 o XXXX-XXXX"
                                    className="text-center text-lg tracking-widest font-mono"
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    También puedes usar un código de respaldo
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || (twoFactorCode.length !== 6 && !twoFactorCode.includes("-"))}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    "Verificar código"
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={handleCancel2FA}
                                disabled={isLoading}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        )
    }

    return <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />
}