"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Trophy,
    TrendingUp,
    Shield,
    Zap,
    Code2,
    FileCode,
    ArrowLeft,
    AlertCircle
} from "lucide-react"
import api from "@/lib/axios"
import Link from "next/link"
import ReactECharts from 'echarts-for-react'
import type { UserQuery, GeneratedCode } from "@/types/query.types"

export default function ComparisonPage() {
    const searchParams = useSearchParams()
    const queryId = searchParams.get("queryId")

    const [query, setQuery] = useState<UserQuery | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (queryId) {
            loadQuery()
        }
    }, [queryId])

    const loadQuery = async () => {
        try {
            const response = await api.get<UserQuery>(`/queries/${queryId}`)
            setQuery(response.data)
        } catch (error) {
            console.error("Error loading query:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getModelColor = (llmName: string) => {
        const colors: Record<string, string> = {
            // ✅ Nuevos modelos de OpenRouter
            'claude-3.5-sonnet': '#f97316',  // orange-500
            'gpt-4o': '#22c55e',             // green-500
            'gemini-2.5-pro': '#3b82f6',     // blue-500
            'mistral-large': '#a855f7',      // purple-500

            // Modelos antiguos de Ollama (por compatibilidad)
            'codellama': '#ef4444',          // red-500
            'deepseek-coder': '#06b6d4',     // cyan-500
            'deepseek': '#06b6d4',           // cyan-500
            'llama3': '#fb923c',             // orange-400
            'qwen': '#8b5cf6',               // violet-500
        }

        // Buscar por nombre exacto primero
        if (colors[llmName]) {
            return colors[llmName]
        }

        // Fallback: buscar por coincidencia parcial
        const normalizedName = llmName.toLowerCase()
        for (const [key, color] of Object.entries(colors)) {
            if (normalizedName.includes(key.toLowerCase().replace('-', ''))) {
                return color
            }
        }

        // Si no encuentra nada, gris por defecto
        return '#6b7280'  // gray-500
    }

    const calculateCategoryScores = (code: GeneratedCode) => {
        if (!code.metrics) return null

        const m = code.metrics

        const correctness = ((m.passRate || 0) + (m.errorHandlingScore || 0) + (100 - (m.runtimeErrorRate || 0))) / 3
        const efficiency = (
            (m.avgExecutionTime ? Math.max(0, 100 - m.avgExecutionTime / 10) : 0) +
            (m.memoryUsage ? Math.max(0, 100 - m.memoryUsage) : 0) +
            (m.algorithmicComplexity ? Math.max(0, 100 - m.algorithmicComplexity * 10) : 0)
        ) / 3
        const maintainability = (
            (m.cyclomaticComplexity ? Math.max(0, 100 - m.cyclomaticComplexity * 5) : 0) +
            (m.linesOfCode ? Math.max(0, 100 - m.linesOfCode / 5) : 0) +
            (m.nestingDepth ? Math.max(0, 100 - m.nestingDepth * 10) : 0) +
            (m.cohesionScore || 0)
        ) / 4
        const security = (
            (100 - (m.xssVulnerabilities || 0) * 25) +
            (100 - (m.injectionVulnerabilities || 0) * 25) +
            (100 - (m.hardcodedSecrets || 0) * 25) +
            (100 - (m.unsafeOperations || 0) * 25)
        ) / 4

        return {
            correctness: Math.max(0, Math.min(100, correctness)),
            efficiency: Math.max(0, Math.min(100, efficiency)),
            maintainability: Math.max(0, Math.min(100, maintainability)),
            security: Math.max(0, Math.min(100, security)),
        }
    }

    // Gráfico de Radar
    const getRadarChartOption = () => {
        if (!query) return {}

        const analyzedCodes = query.generatedCodes.filter(c => c.metrics)

        return {
            title: {
                text: 'Comparación por Categorías',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                bottom: 10,
                data: analyzedCodes.map(c => c.llmName)
            },
            radar: {
                indicator: [
                    { name: 'Corrección', max: 100 },
                    { name: 'Eficiencia', max: 100 },
                    { name: 'Mantenibilidad', max: 100 },
                    { name: 'Seguridad', max: 100 },
                ]
            },
            series: [{
                type: 'radar',
                data: analyzedCodes.map(code => {
                    const scores = calculateCategoryScores(code)
                    return {
                        name: code.llmName,
                        value: scores ? [
                            scores.correctness,
                            scores.efficiency,
                            scores.maintainability,
                            scores.security
                        ] : [0, 0, 0, 0],
                        itemStyle: { color: getModelColor(code.llmName) }
                    }
                })
            }]
        }
    }

    // Gráfico de Barras - Scores Totales
    const getBarChartOption = () => {
        if (!query) return {}

        const analyzedCodes = query.generatedCodes.filter(c => c.metrics)

        return {
            title: {
                text: 'Score Total por Modelo',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            xAxis: {
                type: 'category',
                data: analyzedCodes.map(c => c.llmName),
                axisLabel: { interval: 0, rotate: 30 }
            },
            yAxis: {
                type: 'value',
                max: 100,
                name: 'Score'
            },
            series: [{
                type: 'bar',
                data: analyzedCodes.map(code => ({
                    value: code.metrics?.totalScore || 0,
                    itemStyle: { color: getModelColor(code.llmName) }
                })),
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}'
                }
            }]
        }
    }

    // Gráfico de líneas - Métricas detalladas
    const getLineChartOption = () => {
        if (!query) return {}

        const analyzedCodes = query.generatedCodes.filter(c => c.metrics)

        return {
            title: {
                text: 'Métricas Detalladas',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                bottom: 10,
                data: ['Corrección', 'Eficiencia', 'Mantenibilidad', 'Seguridad']
            },
            xAxis: {
                type: 'category',
                data: analyzedCodes.map(c => c.llmName),
                axisLabel: { interval: 0, rotate: 30 }
            },
            yAxis: {
                type: 'value',
                max: 100,
                name: 'Score'
            },
            series: [
                {
                    name: 'Corrección',
                    type: 'line',
                    data: analyzedCodes.map(c => {
                        const scores = calculateCategoryScores(c)
                        return scores?.correctness.toFixed(1) || 0
                    }),
                    itemStyle: { color: '#10b981' }
                },
                {
                    name: 'Eficiencia',
                    type: 'line',
                    data: analyzedCodes.map(c => {
                        const scores = calculateCategoryScores(c)
                        return scores?.efficiency.toFixed(1) || 0
                    }),
                    itemStyle: { color: '#3b82f6' }
                },
                {
                    name: 'Mantenibilidad',
                    type: 'line',
                    data: analyzedCodes.map(c => {
                        const scores = calculateCategoryScores(c)
                        return scores?.maintainability.toFixed(1) || 0
                    }),
                    itemStyle: { color: '#f59e0b' }
                },
                {
                    name: 'Seguridad',
                    type: 'line',
                    data: analyzedCodes.map(c => {
                        const scores = calculateCategoryScores(c)
                        return scores?.security.toFixed(1) || 0
                    }),
                    itemStyle: { color: '#ef4444' }
                }
            ]
        }
    }

    // Determinar el ganador
    const getWinner = () => {
        if (!query) return null

        const analyzedCodes = query.generatedCodes.filter(c => c.metrics)
        if (analyzedCodes.length === 0) return null

        return analyzedCodes.reduce((best, current) => {
            const bestScore = best.metrics?.totalScore || 0
            const currentScore = current.metrics?.totalScore || 0
            return currentScore > bestScore ? current : best
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid gap-4">
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    if (!queryId || !query) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No hay consulta seleccionada</h2>
                <p className="text-muted-foreground mb-6">
                    Selecciona una consulta para ver la comparación de modelos
                </p>
                <Link href="/dashboard/queries">
                    <Button>
                        Ver Mis Consultas
                    </Button>
                </Link>
            </div>
        )
    }

    const analyzedCodes = query.generatedCodes.filter(c => c.metrics)
    const winner = getWinner()

    if (analyzedCodes.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/queries/${queryId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Comparación de Modelos</h1>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay análisis disponibles</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            Primero debes analizar los códigos generados para poder comparar los modelos
                        </p>
                        <Link href={`/dashboard/queries/${queryId}`}>
                            <Button>
                                Analizar Códigos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Link href={`/dashboard/queries/${queryId}`}>
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a la consulta
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Comparación de Modelos
                    </h1>
                    <p className="text-muted-foreground">
                        {query.userPrompt}
                    </p>
                </div>
            </div>

            {/* Winner Card */}
            {winner && (
                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Mejor Modelo</CardTitle>
                                <CardDescription>Basado en el score total</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-4 w-4 rounded-full`} style={{ backgroundColor: getModelColor(winner.llmName) }} />
                                <span className="text-2xl font-bold">{winner.llmName}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary">
                                    {winner.metrics?.totalScore?.toFixed(1) || 0}
                                </div>
                                <span className="text-sm text-muted-foreground">puntos</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Charts Tabs */}
            <Tabs defaultValue="radar" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="radar">Radar</TabsTrigger>
                    <TabsTrigger value="bars">Barras</TabsTrigger>
                    <TabsTrigger value="lines">Líneas</TabsTrigger>
                </TabsList>

                <TabsContent value="radar">
                    <Card className="border-border/50 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Comparación por Categorías</CardTitle>
                            <CardDescription>
                                Vista general del rendimiento en las 4 categorías principales
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReactECharts
                                option={getRadarChartOption()}
                                style={{ height: '500px' }}
                                opts={{ renderer: 'svg' }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bars">
                    <Card className="border-border/50 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Score Total</CardTitle>
                            <CardDescription>
                                Puntuación total de cada modelo (sobre 100)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReactECharts
                                option={getBarChartOption()}
                                style={{ height: '400px' }}
                                opts={{ renderer: 'svg' }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lines">
                    <Card className="border-border/50 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Métricas Detalladas</CardTitle>
                            <CardDescription>
                                Comparación línea por línea de las 4 categorías
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReactECharts
                                option={getLineChartOption()}
                                style={{ height: '400px' }}
                                opts={{ renderer: 'svg' }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Detailed Metrics Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Tabla Comparativa</CardTitle>
                    <CardDescription>
                        Métricas detalladas de todos los modelos analizados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-medium">Modelo</th>
                                <th className="text-center py-3 px-4 font-medium">Score Total</th>
                                <th className="text-center py-3 px-4 font-medium">Corrección</th>
                                <th className="text-center py-3 px-4 font-medium">Eficiencia</th>
                                <th className="text-center py-3 px-4 font-medium">Mantenibilidad</th>
                                <th className="text-center py-3 px-4 font-medium">Seguridad</th>
                                <th className="text-center py-3 px-4 font-medium">Tiempo (ms)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {analyzedCodes.map((code, index) => {
                                const scores = calculateCategoryScores(code)
                                return (
                                    <tr key={code.id} className="border-b border-border/50 hover:bg-muted/30">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: getModelColor(code.llmName) }}
                                                />
                                                <span className="font-medium">{code.llmName}</span>
                                                {code.id === winner?.id && (
                                                    <Trophy className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <Badge variant={code.id === winner?.id ? "default" : "secondary"}>
                                                {code.metrics?.totalScore?.toFixed(1) || 0}
                                            </Badge>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {scores?.correctness.toFixed(1) || 'N/A'}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {scores?.efficiency.toFixed(1) || 'N/A'}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {scores?.maintainability.toFixed(1) || 'N/A'}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {scores?.security.toFixed(1) || 'N/A'}
                                        </td>
                                        <td className="text-center py-3 px-4 text-muted-foreground">
                                            {code.generationTimeMs}
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Category Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'Corrección', icon: FileCode, color: 'text-green-500', key: 'correctness' },
                    { title: 'Eficiencia', icon: Zap, color: 'text-blue-500', key: 'efficiency' },
                    { title: 'Mantenibilidad', icon: Code2, color: 'text-orange-500', key: 'maintainability' },
                    { title: 'Seguridad', icon: Shield, color: 'text-red-500', key: 'security' },
                ].map((category) => {
                    const bestInCategory = analyzedCodes.reduce((best, current) => {
                        const bestScore = calculateCategoryScores(best)?.[category.key as keyof ReturnType<typeof calculateCategoryScores>] || 0
                        const currentScore = calculateCategoryScores(current)?.[category.key as keyof ReturnType<typeof calculateCategoryScores>] || 0
                        return currentScore > bestScore ? current : best
                    })

                    const score = calculateCategoryScores(bestInCategory)?.[category.key as keyof ReturnType<typeof calculateCategoryScores>]

                    return (
                        <Card key={category.key} className="border-border/50 bg-card/50 backdrop-blur">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{category.title}</CardTitle>
                                    <category.icon className={`h-5 w-5 ${category.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: getModelColor(bestInCategory.llmName) }}
                                        />
                                        <span className="text-sm font-medium">{bestInCategory.llmName}</span>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {typeof score === 'number' ? score.toFixed(1) : 'N/A'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}