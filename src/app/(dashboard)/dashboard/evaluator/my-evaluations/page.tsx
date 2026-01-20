"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Award, Calendar, Star, MessageSquare, BarChart3, Eye, AlertTriangle, Bug, Shield, Zap, FileCode, User } from "lucide-react"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { QualitativeEvaluation } from "@/types/evaluation.types"
import ReactECharts from 'echarts-for-react'
import { CodeBlock } from "@/components/ui/code-block"

// Mapeo de problem tags
const PROBLEM_TAGS_MAP: Record<string, { label: string; icon: any; color: string }> = {
    'has_bugs': { label: 'Tiene bugs', icon: Bug, color: 'text-red-500' },
    'redundant_code': { label: 'Código redundante', icon: FileCode, color: 'text-orange-500' },
    'security_issue': { label: 'Problema de seguridad', icon: Shield, color: 'text-rose-500' },
    'bad_practice': { label: 'Mala práctica', icon: AlertTriangle, color: 'text-yellow-500' },
    'missing_error_handling': { label: 'Falta manejo de errores', icon: AlertTriangle, color: 'text-amber-500' },
    'incomplete_code': { label: 'Código incompleto', icon: FileCode, color: 'text-gray-500' },
    'poor_naming': { label: 'Nombres poco descriptivos', icon: FileCode, color: 'text-blue-500' },
    'no_comments': { label: 'Sin comentarios', icon: FileCode, color: 'text-purple-500' },
    'inefficient': { label: 'Ineficiente', icon: Zap, color: 'text-yellow-600' },
    'hard_to_read': { label: 'Difícil de leer', icon: FileCode, color: 'text-indigo-500' },
}

interface EvaluationWithCode extends QualitativeEvaluation {
    code?: {
        id: number
        llmName: string
        codeContent: string
        generatedAt: string
        developerName?: string
    }
}

export default function MyEvaluationsPage() {
    const [evaluations, setEvaluations] = useState<EvaluationWithCode[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationWithCode | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<number>(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loadingCode, setLoadingCode] = useState(false)

    useEffect(() => {
        loadEvaluations()
    }, [])

    const loadEvaluations = async () => {
        try {
            const response = await api.get<EvaluationWithCode[]>('/evaluation/my-evaluations')
            setEvaluations(response.data)
        } catch (error) {
            console.error('Error loading evaluations:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadCodeDetails = async (codeId: number) => {
        try {
            setLoadingCode(true)
            const response = await api.get(`/queries/code/${codeId}`)
            return {
                id: response.data.id,
                llmName: response.data.llmName,
                codeContent: response.data.codeContent,
                generatedAt: response.data.generatedAt,
                developerName: response.data.developerName,
            }
        } catch (error) {
            console.error('Error loading code:', error)
            return null
        } finally {
            setLoadingCode(false)
        }
    }

    const handleOpenModal = async (evaluation: EvaluationWithCode, index: number) => {
        setSelectedIndex(index)
        setSelectedEvaluation(evaluation)
        setIsModalOpen(true)

        // Cargar detalles del código si no están presentes
        if (!evaluation.code) {
            const codeDetails = await loadCodeDetails(evaluation.codeId)
            if (codeDetails) {
                setSelectedEvaluation({
                    ...evaluation,
                    code: codeDetails
                })
            }
        }
    }

    const getModelColor = (llmName: string) => {
        const colors: Record<string, string> = {
            'claude': 'bg-orange-500',
            'gpt': 'bg-green-500',
            'gemini': 'bg-blue-500',
            'mistral': 'bg-purple-500',
        }
        const key = llmName.toLowerCase().split('-')[0].split('/')[1] || llmName.toLowerCase().split('-')[0]
        return colors[key] || 'bg-gray-500'
    }

    // Gráfico de distribución de scores
    const getScoreDistributionChart = () => {
        if (evaluations.length === 0) return {}

        const avgScores = {
            readability: evaluations.reduce((sum, e) => sum + e.readabilityScore, 0) / evaluations.length,
            clarity: evaluations.reduce((sum, e) => sum + e.clarityScore, 0) / evaluations.length,
            structure: evaluations.reduce((sum, e) => sum + e.structureScore, 0) / evaluations.length,
            documentation: evaluations.reduce((sum, e) => sum + e.documentationScore, 0) / evaluations.length,
        }

        return {
            title: {
                text: 'Promedio por Criterio',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            xAxis: {
                type: 'category',
                data: ['Legibilidad', 'Claridad', 'Estructura', 'Documentación'],
                axisLabel: { interval: 0, rotate: 0 }
            },
            yAxis: {
                type: 'value',
                max: 5,
                name: 'Score'
            },
            series: [{
                type: 'bar',
                data: [
                    { value: avgScores.readability.toFixed(2), itemStyle: { color: '#3b82f6' } },
                    { value: avgScores.clarity.toFixed(2), itemStyle: { color: '#22c55e' } },
                    { value: avgScores.structure.toFixed(2), itemStyle: { color: '#f97316' } },
                    { value: avgScores.documentation.toFixed(2), itemStyle: { color: '#a855f7' } }
                ],
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}'
                }
            }]
        }
    }

    // Gráfico de evolución temporal
    const getTimelineChart = () => {
        if (evaluations.length === 0) return {}

        const sortedEvals = [...evaluations].sort((a, b) =>
            new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime()
        )

        return {
            title: {
                text: 'Evolución de Scores',
                left: 'center',
                textStyle: { color: '#888', fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: sortedEvals.map(e => format(new Date(e.evaluatedAt), 'dd/MM')),
                axisLabel: { interval: 0, rotate: 30 }
            },
            yAxis: {
                type: 'value',
                max: 5,
                name: 'Score'
            },
            series: [{
                name: 'Score Total',
                type: 'line',
                data: sortedEvals.map(e => e.totalScore.toFixed(2)),
                smooth: true,
                itemStyle: { color: '#8b5cf6' },
                areaStyle: { color: 'rgba(139, 92, 246, 0.1)' }
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
            </div>
        )
    }

    if (evaluations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No hay evaluaciones aún</h2>
                <p className="text-muted-foreground mb-6">
                    Comienza evaluando códigos para ver tu historial aquí
                </p>
                <Button onClick={() => window.location.href = '/dashboard/evaluator/pending'}>
                    Ver Códigos Pendientes
                </Button>
            </div>
        )
    }

    const avgTotalScore = evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length
    const highestScore = Math.max(...evaluations.map(e => e.totalScore))
    const lowestScore = Math.min(...evaluations.map(e => e.totalScore))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Award className="h-8 w-8 text-primary" />
                    Mis Evaluaciones
                </h1>
                <p className="text-muted-foreground mt-2">
                    {evaluations.length} {evaluations.length === 1 ? 'código evaluado' : 'códigos evaluados'}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Evaluaciones
                        </CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{evaluations.length}</div>
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
                        <div className="text-2xl font-bold text-primary">
                            {avgTotalScore.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">sobre 5.0</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Score Más Alto
                        </CardTitle>
                        <Star className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {highestScore.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Score Más Bajo
                        </CardTitle>
                        <Star className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">
                            {lowestScore.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Distribución de Scores</CardTitle>
                        <CardDescription>Promedio por cada criterio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts
                            option={getScoreDistributionChart()}
                            style={{ height: '300px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Evolución Temporal</CardTitle>
                        <CardDescription>Scores a lo largo del tiempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts
                            option={getTimelineChart()}
                            style={{ height: '300px' }}
                            opts={{ renderer: 'svg' }}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Lista de evaluaciones */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Historial de Evaluaciones</CardTitle>
                    <CardDescription>
                        Haz clic en una evaluación para ver los detalles completos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {evaluations.map((evaluation, index) => (
                            <div
                                key={evaluation.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                                onClick={() => handleOpenModal(evaluation, index + 1)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      #{index + 1}
                    </span>
                                        <div>
                                            <p className="font-medium">Evaluación #{index + 1}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(evaluation.evaluatedAt), "PPp", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                    {evaluation.generalComments && (
                                        <div className="flex items-start gap-2 text-sm mt-2 ml-11">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <p className="text-muted-foreground line-clamp-1">
                                                {evaluation.generalComments}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <Badge variant="secondary" className="gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            {evaluation.totalScore.toFixed(2)}
                                        </Badge>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Detalles */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                    {selectedEvaluation && (
                        <>
                            <DialogHeader className="flex-shrink-0 pr-8">
                                <DialogTitle className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                        #{selectedIndex}
                                    </span>
                                    Evaluación #{selectedIndex}
                                </DialogTitle>
                                <DialogDescription>
                                    {format(new Date(selectedEvaluation.evaluatedAt), "PPp", { locale: es })}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto space-y-6 mt-4 pr-2">
                                {/* Código evaluado - PRIMERO */}
                                {loadingCode ? (
                                    <Skeleton className="h-64" />
                                ) : selectedEvaluation.code ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-medium">Código Evaluado</h4>
                                            <Badge>{selectedEvaluation.code.llmName}</Badge>
                                            {selectedEvaluation.code.developerName && (
                                                <>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {selectedEvaluation.code.developerName}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <CodeBlock
                                            code={selectedEvaluation.code.codeContent}
                                            language="javascript"
                                            showLineNumbers
                                            maxHeight="300px"
                                        />
                                    </div>
                                ) : null}

                                {/* Score Total */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                                    <span className="font-medium">Score Total</span>
                                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                                        {selectedEvaluation.totalScore.toFixed(2)} / 5.0
                                    </span>
                                </div>

                                {/* Scores por criterio */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2 p-3 sm:p-4 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-blue-500">Legibilidad</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < selectedEvaluation.readabilityScore
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {selectedEvaluation.readabilityComments && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEvaluation.readabilityComments}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 p-3 sm:p-4 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-500">Claridad</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < selectedEvaluation.clarityScore
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {selectedEvaluation.clarityComments && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEvaluation.clarityComments}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 p-3 sm:p-4 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-orange-500">Estructura</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < selectedEvaluation.structureScore
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {selectedEvaluation.structureComments && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEvaluation.structureComments}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 p-3 sm:p-4 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-purple-500">Documentación</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < selectedEvaluation.documentationScore
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {selectedEvaluation.documentationComments && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEvaluation.documentationComments}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Comentarios generales */}
                                {selectedEvaluation.generalComments && (
                                    <div className="space-y-2 p-3 sm:p-4 rounded-lg border">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Comentarios Generales
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedEvaluation.generalComments}
                                        </p>
                                    </div>
                                )}

                                {/* Problemas Encontrados */}
                                {selectedEvaluation.problemTags && selectedEvaluation.problemTags.length > 0 && (
                                    <div className="space-y-3 p-3 sm:p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            Problemas Encontrados
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEvaluation.problemTags.map((tagId) => {
                                                const tag = PROBLEM_TAGS_MAP[tagId]
                                                if (!tag) return null
                                                const Icon = tag.icon
                                                return (
                                                    <Badge
                                                        key={tagId}
                                                        variant="outline"
                                                        className="flex items-center gap-1.5 py-1"
                                                    >
                                                        <Icon className={`h-3 w-3 ${tag.color}`} />
                                                        {tag.label}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}