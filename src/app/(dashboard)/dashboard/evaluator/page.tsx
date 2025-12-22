"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, ClipboardCheck, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"
import api from "@/lib/axios"
import type { EvaluationStats } from "@/types/evaluation.types"

export default function EvaluatorDashboard() {
    const [stats, setStats] = useState<EvaluationStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const response = await api.get<EvaluationStats>('/evaluation/stats')
            setStats(response.data)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setIsLoading(false)
        }
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
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Award className="h-8 w-8 text-primary" />
                    Panel de Evaluador
                </h1>
                <p className="text-muted-foreground mt-2">
                    Evalúa la calidad del código generado por los modelos de IA
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Evaluaciones
                        </CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalEvaluations || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Códigos evaluados
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Promedio General
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.averageScores.total.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sobre 5.0
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Legibilidad
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {stats?.averageScores.readability.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Promedio
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mejor Código
                        </CardTitle>
                        <Award className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {stats?.bestCode?.score.toFixed(2) || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.bestCode?.llmName || 'Sin datos'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Link href="/dashboard/evaluator/pending">
                    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                                <ClipboardCheck className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Códigos Pendientes</CardTitle>
                            <CardDescription>
                                Evalúa códigos que aún no has calificado
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Ver Pendientes</Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/evaluator/my-evaluations">
                    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                                <Award className="h-5 w-5 text-blue-500" />
                            </div>
                            <CardTitle>Mis Evaluaciones</CardTitle>
                            <CardDescription>
                                Revisa el historial de tus evaluaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">Ver Historial</Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Model Ranking */}
            {stats?.modelRanking && stats.modelRanking.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Ranking por Evaluaciones Cualitativas</CardTitle>
                        <CardDescription>
                            Modelos ordenados por puntuación promedio de evaluadores
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.modelRanking.map((model, index) => (
                                <div
                                    key={model.llmName}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{model.llmName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {model.totalEvaluations} evaluaciones
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            {model.avgQualitativeScore.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">sobre 5.0</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}