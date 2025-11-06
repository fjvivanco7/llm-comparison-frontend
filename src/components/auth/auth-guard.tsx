"use client"

import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const verify = async () => {
            // Verificar si hay token en localStorage
            const token = localStorage.getItem('token')

            if (!token) {
                // No hay token, redirigir al login
                router.replace("/login")
                return
            }

            // Verificar token con el backend
            const { checkAuth, user } = useAuthStore.getState()
            await checkAuth()

            // Después de verificar, revisar si hay usuario
            const currentUser = useAuthStore.getState().user

            if (!currentUser) {
                // Token inválido, redirigir al login
                router.replace("/login")
                return
            }

            // Todo bien, mostrar contenido
            setIsChecking(false)
        }

        verify()
    }, [router])

    // Mientras verifica la sesión
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Verificando sesión...</p>
                </div>
            </div>
        )
    }

    // Si pasó la verificación, mostrar el contenido protegido
    return <>{children}</>
}