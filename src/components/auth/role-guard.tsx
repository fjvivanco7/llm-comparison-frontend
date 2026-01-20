"use client"

import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

type UserRole = 'USER' | 'EVALUATOR' | 'ADMIN'

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter()
    const { user } = useAuthStore()
    const [hasAccess, setHasAccess] = useState(false)

    useEffect(() => {
        if (!user) return

        const userHasAccess = allowedRoles.includes(user.role as UserRole)

        if (!userHasAccess) {
            // Redirigir al dashboard por defecto según el rol
            if (user.role === 'ADMIN') {
                router.replace('/dashboard/admin')
            } else if (user.role === 'EVALUATOR') {
                router.replace('/dashboard/evaluator')
            } else {
                router.replace('/dashboard')
            }
            return
        }

        setHasAccess(true)
    }, [user, allowedRoles, router])

    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return <>{children}</>
}
