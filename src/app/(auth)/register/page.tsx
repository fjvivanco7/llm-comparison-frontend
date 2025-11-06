"use client"

import { useAuthStore } from "@/store/auth-store"
import { AuthForm } from "@/components/auth/auth-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const { register: registerUser, isLoading, user } = useAuthStore()
    const router = useRouter()
    useEffect(() => {
        if (user) {
            router.push("/dashboard")
        }
    }, [user, router])

    const handleRegister = async (data: any) => {
        await registerUser(data)
    }

    return <AuthForm mode="register" onSubmit={handleRegister} isLoading={isLoading} />
}