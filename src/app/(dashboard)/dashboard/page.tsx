"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Code2, Sparkles, BarChart3, Plus, FileCode, Trophy, Clock } from "lucide-react"
import Link from "next/link"
import api from "@/lib/axios"
import type { DashboardStats } from "@/types/dashboard.types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
    const router = useRouter() // ← AGREGAR
    const { user } = useAuthStore()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user?.role === 'EVALUATOR') {
            router.push('/dashboard/evaluator')
        } else if (user?.role === 'ADMIN') {
            router.push('/dashboard/admin')
        }
    }, [user, router])

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const response = await api.get<DashboardStats>('/analysis/dashboard/stats')
            setStats(response.data)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getModelColor = (llmName: string) => {
        const colors: Record<string, string> = {
            'codellama': 'bg-red-500',
            'deepseek-coder': 'bg-blue-500',
            'deepseek': 'bg-blue-500',
            'llama3': 'bg-orange-500',
            'qwen': 'bg-purple-500',
            'claude': 'bg-purple-600',
            'gpt': 'bg-green-600',
            'gemini': 'bg-blue-600',
            'mistral': 'bg-orange-600',
        }
        const key = llmName.toLowerCase().split(':')[0].split('-')[0]
        return colors[key] || 'bg-gray-500'
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-12 w-96" />
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Bienvenido de vuelta, {user?.firstName || "Usuario"} 👋
                </h1>
                <p className="text-muted-foreground mt-2">
                    Comienza a generar y comparar código con los mejores modelos de IA
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Consultas
                        </CardTitle>
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalQueries || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Prompts enviados
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Códigos Generados
                        </CardTitle>
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCodesGenerated || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Por todos los modelos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Análisis Completados
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAnalysisCompleted || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Métricas calculadas
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mejor LLM
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {stats?.bestModel.name !== '-' && (
                                <div className={`h-2 w-2 rounded-full ${getModelColor(stats?.bestModel.name || '')}`} />
                            )}
                            <div className="text-2xl font-bold truncate">
                                {stats?.bestModel.name || '-'}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Score: {stats?.bestModel.avgScore || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/dashboard/new-query">
                    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                                <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Nueva Consulta</CardTitle>
                            <CardDescription>
                                Genera código con múltiples LLMs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Comenzar</Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/queries">
                    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                                <Code2 className="h-5 w-5 text-blue-500" />
                            </div>
                            <CardTitle>Mis Consultas</CardTitle>
                            <CardDescription>
                                Ver historial de código generado
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">Ver Todo</Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/comparison">
                    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 mb-2">
                                <BarChart3 className="h-5 w-5 text-violet-500" />
                            </div>
                            <CardTitle>Comparación</CardTitle>
                            <CardDescription>
                                Rankings y estadísticas de LLMs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">Explorar</Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Queries */}
            {stats && stats.recentQueries.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Consultas Recientes
                        </CardTitle>
                        <CardDescription>
                            Tus últimas 5 consultas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentQueries.map((query) => (
                                <Link
                                    key={query.id}
                                    href={`/dashboard/queries/${query.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {query.userPrompt}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(query.createdAt), "PPp", { locale: es })}
                                                </p>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <p className="text-xs text-muted-foreground">
                                                    {query.codesCount} {query.codesCount === 1 ? 'código' : 'códigos'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={query.status === 'completed' ? 'default' : 'secondary'}>
                                            {query.status === 'completed' ? 'Completado' : 'Procesando'}
                                        </Badge>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {stats && stats.totalQueries === 0 && (
                <Card className="border-border/50 bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">¡Comienza a generar código!</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            Crea tu primera consulta para comparar cómo diferentes modelos de IA generan código
                        </p>
                        <Link href="/dashboard/new-query">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nueva Consulta
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}