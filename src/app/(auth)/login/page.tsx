"use client"

import { useAuthStore } from "@/store/auth-store"
import { AuthForm } from "@/components/auth/auth-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const { login, isLoading, user } = useAuthStore()
    const router = useRouter()

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (user) {
            router.push("/dashboard")
        }
    }, [user, router])

    const handleLogin = async (data: any) => {
        await login(data)
    }

    return <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />
}