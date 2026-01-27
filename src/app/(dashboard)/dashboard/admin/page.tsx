"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Users, FileCode, Code2, Award, TrendingUp, UserPlus,
    Settings, Shield, ArrowRight, Coins
} from "lucide-react"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

interface DashboardStats {
    totals: {
        users: number
        queries: number
        codes: number
        evaluations: number
        tokens: number
    }
    today: {
        newUsers: number
        queries: number
        tokens: number
    }
    usersByRole: {
        users: number
        evaluators: number
        admins: number
    }
    recentUsers: Array<{
        id: number
        email: string
        firstName: string | null
        lastName: string | null
        role: string
        createdAt: string
    }>
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Verificar que sea admin
        if (user && user.role !== 'ADMIN') {
            router.push('/dashboard')
            return
        }
        loadStats()
    }, [user, router])

    const loadStats = async () => {
        try {
            const response = await api.get("/admin/dashboard")
            setStats(response.data)
        } catch (error) {
            console.error("Error loading admin stats:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getRoleBadge = (role: string) => {
        const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
            ADMIN: { variant: "default", label: "Admin" },
            EVALUATOR: { variant: "secondary", label: "Evaluador" },
            USER: { variant: "outline", label: "Usuario" },
        }
        const config = variants[role] || variants.USER
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-7 w-7" />
                        Panel de Administración
                    </h1>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Error al cargar estadísticas</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-7 w-7" />
                        Panel de Administración
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gestiona usuarios y configuraciones del sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/admin/users">
                        <Button variant="outline" className="gap-2">
                            <Users className="h-4 w-4" />
                            Usuarios
                        </Button>
                    </Link>
                    <Link href="/dashboard/admin/settings">
                        <Button className="gap-2">
                            <Settings className="h-4 w-4" />
                            Configuración
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totals.users}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.today.newUsers} hoy
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Consultas</CardTitle>
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totals.queries.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.today.queries} hoy
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tokens Consumidos</CardTitle>
                        <Coins className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totals.tokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.today.tokens.toLocaleString()} hoy
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Códigos Generados</CardTitle>
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totals.codes.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totals.evaluations.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Users by Role */}
                <Card>
                    <CardHeader>
                        <CardTitle>Usuarios por Rol</CardTitle>
                        <CardDescription>Distribución de roles en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-primary" />
                                    <span>Desarrolladores</span>
                                </div>
                                <span className="font-bold">{stats.usersByRole.users}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                                    <span>Evaluadores</span>
                                </div>
                                <span className="font-bold">{stats.usersByRole.evaluators}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span>Administradores</span>
                                </div>
                                <span className="font-bold">{stats.usersByRole.admins}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Usuarios Recientes</CardTitle>
                            <CardDescription>Últimos registros en la plataforma</CardDescription>
                        </div>
                        <Link href="/dashboard/admin/users">
                            <Button variant="ghost" size="sm">
                                Ver todos
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            <span className="text-xs font-medium">
                                                {user.firstName?.[0] || user.email[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {user.firstName && user.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(user.createdAt), "PPp", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                    {getRoleBadge(user.role)}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
