"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { BarChart3, Award, Zap, Target, TrendingUp, Plus, Trophy, Medal } from "lucide-react"
import api from "@/lib/axios"
import Link from "next/link"
import ReactECharts from 'echarts-for-react'

interface ModelRanking {
    llmName: string
    totalAnalyzed: number
    avgTotalScore: number
    avgCategoryScores: {
        correction: number
        efficiency: number
        maintainability: number
        security: number
    }
    wins: number
    overallRank: number
}

interface RankingData {
    ranking: ModelRanking[]
    totalQueries: number
    totalCodesAnalyzed: number
    generatedAt: string
}

export default function StatsPage() {
    const [data, setData] = useState<RankingData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const response = await api.get<RankingData>('/comparison/ranking')
            setData(response.data)
        } catch (error) {
            console.error("Error loading stats:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getModelColor = (llmName: string) => {
        const colors: Record<string, string> = {
            'codellama': '#ef4444',
            'deepseek-coder': '#3b82f6',
            'deepseek': '#3b82f6',
            'llama3': '#f97316',
            'qwen': '#a855f7',
            'claude': '#8b5cf6',
            'gpt': '#10b981',
            'gemini': '#3b82f6',
            'mistral': '#f97316',
        }
        const key = llmName.toLowerCase().split(':')[0].split('-')[0].split('/')[1] || llmName.toLowerCase().split(':')[0].split('-')[0]
        return colors[key] || '#6b7280'
    }

    // Encontrar el mejor modelo por cada categoría
    const getBestByCategory = (category: keyof ModelRanking['avgCategoryScores']) => {
        if (!data) return null
        return data.ranking.reduce((best, current) =>
            current.avgCategoryScores[category] > best.avgCategoryScores[category] ? current : best
        )
    }

    // Gráfico: Distribución de Victorias
    const getWinsDistributionChart = () => {
        if (!data) return {}

        return {
            title: {
                text: 'Distribución de Victorias',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} victorias ({d}%)'
            },
            legend: {
                bottom: 10,
                data: data.ranking.map(m => m.llmName)
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}\n{c} wins'
                },
                data: data.ranking.map(model => ({
                    name: model.llmName,
                    value: model.wins,
                    itemStyle: { color: getModelColor(model.llmName) }
                }))
            }]
        }
    }

    // Gráfico: Comparación de Categorías (Stacked Bar)
    const getCategoryComparisonChart = () => {
        if (!data) return {}

        return {
            title: {
                text: 'Scores Promedio por Categoría',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                bottom: 10,
                data: ['Corrección', 'Eficiencia', 'Mantenibilidad', 'Seguridad']
            },
            xAxis: {
                type: 'category',
                data: data.ranking.map(m => m.llmName),
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
                    type: 'bar',
                    stack: 'total',
                    data: data.ranking.map(m => m.avgCategoryScores.correction.toFixed(1)),
                    itemStyle: { color: '#3b82f6' }
                },
                {
                    name: 'Eficiencia',
                    type: 'bar',
                    stack: 'total',
                    data: data.ranking.map(m => m.avgCategoryScores.efficiency.toFixed(1)),
                    itemStyle: { color: '#eab308' }
                },
                {
                    name: 'Mantenibilidad',
                    type: 'bar',
                    stack: 'total',
                    data: data.ranking.map(m => m.avgCategoryScores.maintainability.toFixed(1)),
                    itemStyle: { color: '#22c55e' }
                },
                {
                    name: 'Seguridad',
                    type: 'bar',
                    stack: 'total',
                    data: data.ranking.map(m => m.avgCategoryScores.security.toFixed(1)),
                    itemStyle: { color: '#a855f7' }
                }
            ]
        }
    }

    // Gráfico: Análisis de Códigos por Modelo
    const getCodesAnalyzedChart = () => {
        if (!data) return {}

        return {
            title: {
                text: 'Códigos Analizados por Modelo',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            xAxis: {
                type: 'category',
                data: data.ranking.map(m => m.llmName),
                axisLabel: { interval: 0, rotate: 30 }
            },
            yAxis: {
                type: 'value',
                name: 'Códigos'
            },
            series: [{
                type: 'bar',
                data: data.ranking.map(model => ({
                    value: model.totalAnalyzed,
                    itemStyle: { color: getModelColor(model.llmName) }
                })),
                label: {
                    show: true,
                    position: 'top'
                }
            }]
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }

    if (!data || data.ranking.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No hay datos suficientes</h2>
                <p className="text-muted-foreground mb-6">
                    Genera y analiza códigos para ver estadísticas
                </p>
                <Link href="/dashboard/new-query">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Consulta
                    </Button>
                </Link>
            </div>
        )
    }

    const bestCorrection = getBestByCategory('correction')
    const bestEfficiency = getBestByCategory('efficiency')
    const bestMaintainability = getBestByCategory('maintainability')
    const bestSecurity = getBestByCategory('security')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Estadísticas Detalladas
                </h1>
                <p className="text-muted-foreground">
                    Análisis completo basado en {data.totalQueries} consultas analizadas
                </p>
            </div>

            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Consultas
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalQueries}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Códigos Analizados
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalCodesAnalyzed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Modelos Evaluados
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.ranking.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Best by Category */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-2xl">🏆 Mejores por Categoría</CardTitle>
                    <CardDescription>Modelos que destacan en cada área de evaluación</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Corrección */}
                        {bestCorrection && (
                            <Card className="border-blue-500/20 bg-blue-500/5">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <Target className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Corrección</p>
                                            <p className="font-bold text-lg">{bestCorrection.llmName}</p>
                                            <p className="text-2xl font-bold text-blue-500 mt-2">
                                                {bestCorrection.avgCategoryScores.correction.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Eficiencia */}
                        {bestEfficiency && (
                            <Card className="border-yellow-500/20 bg-yellow-500/5">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <Zap className="h-8 w-8 text-yellow-500" />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Eficiencia</p>
                                            <p className="font-bold text-lg">{bestEfficiency.llmName}</p>
                                            <p className="text-2xl font-bold text-yellow-500 mt-2">
                                                {bestEfficiency.avgCategoryScores.efficiency.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Mantenibilidad */}
                        {bestMaintainability && (
                            <Card className="border-green-500/20 bg-green-500/5">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <BarChart3 className="h-8 w-8 text-green-500" />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Mantenibilidad</p>
                                            <p className="font-bold text-lg">{bestMaintainability.llmName}</p>
                                            <p className="text-2xl font-bold text-green-500 mt-2">
                                                {bestMaintainability.avgCategoryScores.maintainability.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Seguridad */}
                        {bestSecurity && (
                            <Card className="border-purple-500/20 bg-purple-500/5">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <Award className="h-8 w-8 text-purple-500" />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Seguridad</p>
                                            <p className="font-bold text-lg">{bestSecurity.llmName}</p>
                                            <p className="text-2xl font-bold text-purple-500 mt-2">
                                                {bestSecurity.avgCategoryScores.security.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Distribución de Victorias */}
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Distribución de Victorias</CardTitle>
                        <CardDescription>
                            Porcentaje de veces que cada modelo obtuvo el mejor score
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts
                            option={getWinsDistributionChart()}
                            style={{ height: '400px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </CardContent>
                </Card>

                {/* Códigos Analizados */}
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Códigos Analizados</CardTitle>
                        <CardDescription>
                            Cantidad de códigos evaluados por modelo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts
                            option={getCodesAnalyzedChart()}
                            style={{ height: '400px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Category Comparison - Full Width */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Comparación por Categorías</CardTitle>
                    <CardDescription>
                        Desglose de scores promedio en cada categoría de evaluación
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReactECharts
                        option={getCategoryComparisonChart()}
                        style={{ height: '450px' }}
                        opts={{ renderer: 'svg' }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}