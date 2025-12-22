"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ArrowLeft,
    Clock,
    Play,
    CheckCircle2,
    XCircle,
    Loader2,
    BarChart3,
    Copy,
    Check,
    Award,
    Star,
    MessageSquare
} from "lucide-react"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import Link from "next/link"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ReactECharts from 'echarts-for-react'

// ========== INTERFACES ==========
interface Metrics {
    id: number
    passRate: number
    errorHandling: number
    runtimeErrors: number
    executionTime: number
    memoryUsage: number
    algorithmicComplexity: number
    cyclomaticComplexity: number
    linesOfCode: number
    nestingDepth: number
    cohesion: number
    xssVulnerabilities: number
    injectionVulnerabilities: number
    hardcodedSecrets: number
    unsafeOperations: number
    overallScore: number
}

interface GeneratedCode {
    id: number
    llmName: string
    codeContent: string
    generatedAt: string
    generationTimeMs: number
    metrics: Metrics | null
}

// ← INTERFACES NUEVAS PARA EVALUACIONES CUALITATIVAS
interface QualitativeEvaluation {
    id: number
    evaluatorName: string
    readabilityScore: number
    clarityScore: number
    structureScore: number
    documentationScore: number
    totalScore: number
    generalComments?: string
    readabilityComments?: string
    clarityComments?: string
    structureComments?: string
    documentationComments?: string
    evaluatedAt: string
}

interface CodeWithEvaluations extends GeneratedCode {
    qualitativeEvaluations?: QualitativeEvaluation[]
}

interface Query {
    id: number
    userPrompt: string
    createdAt: string
    status: string
    generatedCodes: CodeWithEvaluations[]
}

interface AnalysisMetricsSummary {
    correctness: number
    efficiency: number
    maintainability: number
    security: number
}
// ================================================

export default function QueryDetailPage() {
    const params = useParams()
    const queryId = params.id as string

    const [query, setQuery] = useState<Query | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [analyzingCode, setAnalyzingCode] = useState<number | null>(null)
    const [copiedCode, setCopiedCode] = useState<number | null>(null)

    useEffect(() => {
        loadQuery()
    }, [queryId])

    const loadQuery = async () => {
        try {
            const response = await api.get<Query>(`/queries/${queryId}`)
            setQuery(response.data)
        } catch (error) {
            console.error("Error loading query:", error)
            toast.error("Error al cargar la consulta")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnalyze = async (codeId: number) => {
        try {
            setAnalyzingCode(codeId)
            await api.post(`/analysis/analyze/${codeId}`, {})
            toast.success("Análisis completado")
            await loadQuery()
        } catch (error: any) {
            toast.error("Error al analizar", {
                description: error.response?.data?.message || "Intenta de nuevo"
            })
        } finally {
            setAnalyzingCode(null)
        }
    }

    const handleAnalyzeAll = async () => {
        try {
            setAnalyzingCode(-1)
            const promises = query!.generatedCodes.map(code =>
                api.post(`/analysis/analyze/${code.id}`, {})
            )
            await Promise.all(promises)
            toast.success("Análisis completado", {
                description: `${query!.generatedCodes.length} códigos analizados`
            })
            await loadQuery()
        } catch (error: any) {
            toast.error("Error al analizar", {
                description: error.response?.data?.message || "Algunos análisis fallaron"
            })
        } finally {
            setAnalyzingCode(null)
        }
    }

    const copyToClipboard = (code: string, codeId: number) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(codeId)
        toast.success("Código copiado al portapapeles")
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const getModelColor = (llmName: string) => {
        const colors: Record<string, string> = {
            'claude-3.5-sonnet': 'bg-orange-500',
            'gpt-4o': 'bg-green-500',
            'gemini-2.5-pro': 'bg-blue-500',
            'mistral-large': 'bg-purple-500',
            'codellama': 'bg-red-500',
            'deepseek-coder': 'bg-cyan-500',
            'deepseek': 'bg-cyan-500',
            'llama3': 'bg-orange-400',
            'qwen': 'bg-violet-500',
        }

        if (colors[llmName]) {
            return colors[llmName]
        }

        const normalizedName = llmName.toLowerCase()
        for (const [key, color] of Object.entries(colors)) {
            if (normalizedName.includes(key.toLowerCase().replace('-', ''))) {
                return color
            }
        }

        return 'bg-gray-500'
    }

    const calculateMetricsSummary = (code: CodeWithEvaluations): AnalysisMetricsSummary | null => {
        if (!code.metrics) return null

        const m = code.metrics
        const correctness = ((m.passRate || 0) + (m.errorHandling || 0) + (100 - (m.runtimeErrors || 0))) / 3
        const efficiency = (
            (m.executionTime ? Math.max(0, 100 - m.executionTime / 10) : 0) +
            (m.memoryUsage ? Math.max(0, 100 - m.memoryUsage) : 0) +
            (m.algorithmicComplexity ? Math.max(0, 100 - m.algorithmicComplexity * 10) : 0)
        ) / 3
        const maintainability = (
            (m.cyclomaticComplexity ? Math.max(0, 100 - m.cyclomaticComplexity * 5) : 0) +
            (m.linesOfCode ? Math.max(0, 100 - m.linesOfCode / 5) : 0) +
            (m.nestingDepth ? Math.max(0, 100 - m.nestingDepth * 10) : 0) +
            (m.cohesion || 0)
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

    const getQualitativeAverage = (code: CodeWithEvaluations) => {
        if (!code.qualitativeEvaluations || code.qualitativeEvaluations.length === 0) {
            return null
        }
        const total = code.qualitativeEvaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0)
        return (total / code.qualitativeEvaluations.length).toFixed(2)
    }

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'text-green-500'
        if (score >= 3.5) return 'text-blue-500'
        if (score >= 2.5) return 'text-orange-500'
        return 'text-red-500'
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

    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <XCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Consulta no encontrada</h2>
                <Link href="/dashboard/queries">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a consultas
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Link href="/dashboard/queries">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {query.userPrompt}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(query.createdAt), "PPp", { locale: es })}
                        </span>
                        <Badge variant={query.status === 'completed' ? 'default' : 'secondary'}>
                            {query.status === 'completed' ? 'Completado' : 'Procesando'}
                        </Badge>
                        <span>{query.generatedCodes.length} {query.generatedCodes.length === 1 ? 'modelo' : 'modelos'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleAnalyzeAll}
                        disabled={analyzingCode !== null || query.generatedCodes.every(c => c.metrics)}
                        className="gap-2"
                        variant={query.generatedCodes.every(c => c.metrics) ? "outline" : "default"}
                    >
                        {analyzingCode === -1 ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analizando todos...
                            </>
                        ) : query.generatedCodes.every(c => c.metrics) ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Todos analizados
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Analizar Todos
                            </>
                        )}
                    </Button>

                    <Link href={`/dashboard/comparison?queryId=${queryId}`}>
                        <Button variant="outline" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Ver Comparación
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Generated Codes */}
            {query.generatedCodes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Generando código...</p>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue={query.generatedCodes[0]?.id.toString()} className="space-y-4">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        {query.generatedCodes.map((code) => (
                            <TabsTrigger
                                key={code.id}
                                value={code.id.toString()}
                                className="gap-2"
                            >
                                <div className={`h-2 w-2 rounded-full ${getModelColor(code.llmName)}`} />
                                {code.llmName}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {query.generatedCodes.map((code) => {
                        const metricsSummary = calculateMetricsSummary(code)

                        return (
                            <TabsContent key={code.id} value={code.id.toString()} className="space-y-4">
                                {/* Code Card */}
                                <Card className="border-border/50 bg-card/50 backdrop-blur">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <div className={`h-3 w-3 rounded-full ${getModelColor(code.llmName)}`} />
                                                    {code.llmName}
                                                </CardTitle>
                                                <CardDescription className="mt-2">
                                                    Tiempo de respuesta: {code.generationTimeMs}ms
                                                </CardDescription>
                                            </div>
                                            <Badge variant="default" className="gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Completado
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Code */}
                                        {code.codeContent && (
                                            <div className="relative group">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => copyToClipboard(code.codeContent, code.id)}
                                                >
                                                    {copiedCode === code.id ? (
                                                        <>
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Copiado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copiar
                                                        </>
                                                    )}
                                                </Button>
                                                <SyntaxHighlighter
                                                    language="javascript"
                                                    style={vscDarkPlus}
                                                    customStyle={{
                                                        borderRadius: '0.5rem',
                                                        padding: '1.5rem',
                                                        fontSize: '0.875rem',
                                                        margin: 0,
                                                    }}
                                                    showLineNumbers
                                                >
                                                    {code.codeContent}
                                                </SyntaxHighlighter>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleAnalyze(code.id)}
                                                disabled={analyzingCode === code.id || analyzingCode === -1}
                                                className="gap-2"
                                                variant="outline"
                                            >
                                                {analyzingCode === code.id ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Analizando...
                                                    </>
                                                ) : code.metrics ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Re-analizar
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-4 w-4" />
                                                        Analizar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Analysis Results */}
                                {code.metrics && metricsSummary && (
                                    <Card className="border-border/50 bg-muted/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5 text-primary" />
                                                Resultados del Análisis Cuantitativo
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                                                    <span className="font-medium">Score Total</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-2xl font-bold text-primary">
                                                            {code.metrics.overallScore?.toFixed(1) || '0'}
                                                        </div>
                                                        <span className="text-muted-foreground">/100</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="p-3 rounded-lg bg-background border">
                                                        <p className="text-xs text-muted-foreground mb-1">Corrección</p>
                                                        <p className="text-lg font-bold">
                                                            {metricsSummary.correctness.toFixed(1)}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-background border">
                                                        <p className="text-xs text-muted-foreground mb-1">Eficiencia</p>
                                                        <p className="text-lg font-bold">
                                                            {metricsSummary.efficiency.toFixed(1)}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-background border">
                                                        <p className="text-xs text-muted-foreground mb-1">Mantenibilidad</p>
                                                        <p className="text-lg font-bold">
                                                            {metricsSummary.maintainability.toFixed(1)}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-background border">
                                                        <p className="text-xs text-muted-foreground mb-1">Seguridad</p>
                                                        <p className="text-lg font-bold">
                                                            {metricsSummary.security.toFixed(1)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* ← SECCIÓN DE EVALUACIONES CUALITATIVAS */}
                                {code.qualitativeEvaluations && code.qualitativeEvaluations.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Award className="h-5 w-5 text-primary" />
                                                Evaluaciones Cualitativas
                                            </h3>
                                            <Badge variant="secondary" className="gap-1">
                                                {code.qualitativeEvaluations.length} {code.qualitativeEvaluations.length === 1 ? 'evaluación' : 'evaluaciones'}
                                            </Badge>
                                        </div>

                                        {/* Promedio General */}
                                        <Card className="mb-4 border-primary/20 bg-primary/5">
                                            <CardContent className="py-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Promedio de Evaluadores</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Basado en {code.qualitativeEvaluations.length} evaluación{code.qualitativeEvaluations.length !== 1 ? 'es' : ''} profesional{code.qualitativeEvaluations.length !== 1 ? 'es' : ''}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-3xl font-bold ${getScoreColor(parseFloat(getQualitativeAverage(code) || '0'))}`}>
                                                            {getQualitativeAverage(code)}
                                                        </div>
                                                        <div className="flex gap-0.5 justify-end mt-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < Math.round(parseFloat(getQualitativeAverage(code) || '0'))
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">sobre 5.0</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Lista de Evaluaciones */}
                                        <div className="space-y-4">
                                            {code.qualitativeEvaluations.map((evaluation, idx) => (
                                                <Card key={evaluation.id} className="border-border/50">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <CardTitle className="text-base flex items-center gap-2">
                                                                    <Award className="h-4 w-4 text-primary" />
                                                                    Evaluación #{idx + 1}
                                                                </CardTitle>
                                                                <CardDescription className="mt-1">
                                                                    por {evaluation.evaluatorName} • {format(new Date(evaluation.evaluatedAt), "PPp", { locale: es })}
                                                                </CardDescription>
                                                            </div>
                                                            <Badge variant="secondary" className="gap-1">
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                {evaluation.totalScore.toFixed(2)}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {/* Scores por criterio */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <div className="space-y-1 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                                <p className="text-xs font-medium text-blue-600">Legibilidad</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`h-3 w-3 ${
                                                                                    i < evaluation.readabilityScore
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : 'text-gray-300'
                                                                                }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-blue-600">{evaluation.readabilityScore}</span>
                                                                </div>
                                                                {evaluation.readabilityComments && (
                                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                        {evaluation.readabilityComments}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-1 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                                <p className="text-xs font-medium text-green-600">Claridad</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`h-3 w-3 ${
                                                                                    i < evaluation.clarityScore
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : 'text-gray-300'
                                                                                }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-green-600">{evaluation.clarityScore}</span>
                                                                </div>
                                                                {evaluation.clarityComments && (
                                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                        {evaluation.clarityComments}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-1 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                                <p className="text-xs font-medium text-orange-600">Estructura</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`h-3 w-3 ${
                                                                                    i < evaluation.structureScore
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : 'text-gray-300'
                                                                                }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-orange-600">{evaluation.structureScore}</span>
                                                                </div>
                                                                {evaluation.structureComments && (
                                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                        {evaluation.structureComments}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-1 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                                                <p className="text-xs font-medium text-purple-600">Documentación</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`h-3 w-3 ${
                                                                                    i < evaluation.documentationScore
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : 'text-gray-300'
                                                                                }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-purple-600">{evaluation.documentationScore}</span>
                                                                </div>
                                                                {evaluation.documentationComments && (
                                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                        {evaluation.documentationComments}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Comentarios Generales */}
                                                        {evaluation.generalComments && (
                                                            <div className="p-4 rounded-lg bg-muted/50 border">
                                                                <div className="flex items-start gap-2">
                                                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                                                            Comentarios del Evaluador
                                                                        </p>
                                                                        <p className="text-sm">
                                                                            {evaluation.generalComments}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mensaje si no hay evaluaciones */}
                                {(!code.qualitativeEvaluations || code.qualitativeEvaluations.length === 0) && (
                                    <div className="mt-6 p-6 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                                        <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Este código aún no ha sido evaluado por expertos
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Las evaluaciones cualitativas aparecerán aquí cuando un evaluador lo califique
                                        </p>
                                    </div>
                                )}
                            </TabsContent>
                        )
                    })}
                </Tabs>
            )}
        </div>
    )
}