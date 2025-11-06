"use client"

import { useAuthStore } from "@/store/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code2, Sparkles, BarChart3, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    const { user } = useAuthStore()

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

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer">
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
                        <Link href="/dashboard/new-query">
                            <Button className="w-full">Comenzar</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer">
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
                        <Link href="/dashboard/queries">
                            <Button variant="outline" className="w-full">Ver Todo</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer">
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
                        <Link href="/dashboard/comparison">
                            <Button variant="outline" className="w-full">Explorar</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Preview */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Resumen de Actividad</CardTitle>
                    <CardDescription>
                        Tus estadísticas de uso de la plataforma
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Consultas</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Códigos Generados</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Análisis Completados</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Mejor LLM</p>
                            <p className="text-2xl font-bold">-</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}