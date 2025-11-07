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
    Check
} from "lucide-react"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import Link from "next/link"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { UserQuery, GeneratedCode, AnalysisMetricsSummary } from "@/types/query.types"

export default function QueryDetailPage() {
    const params = useParams()
    const queryId = params.id as string

    const [query, setQuery] = useState<UserQuery | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [analyzingCode, setAnalyzingCode] = useState<number | null>(null)
    const [copiedCode, setCopiedCode] = useState<number | null>(null)

    useEffect(() => {
        loadQuery()
    }, [queryId])

    const loadQuery = async () => {
        try {
            const response = await api.get<UserQuery>(`/queries/${queryId}`)
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
            await loadQuery() // Recargar para ver los resultados
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
            setAnalyzingCode(-1) // -1 = analizando todos

            // Analizar todos los códigos en paralelo
            const promises = query!.generatedCodes.map(code =>
                api.post(`/analysis/analyze/${code.id}`, {})
            )

            await Promise.all(promises)

            toast.success("Análisis completado", {
                description: `${query!.generatedCodes.length} códigos analizados`
            })

            await loadQuery() // Recargar para ver los resultados
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
            'codellama': 'bg-red-500',
            'deepseek-coder': 'bg-blue-500',
            'deepseek': 'bg-blue-500',
            'llama3': 'bg-orange-500',
            'qwen': 'bg-purple-500',
        }
        const key = llmName.toLowerCase().split(':')[0].replace('-', '')
        return colors[key] || 'bg-gray-500'
    }

    const calculateMetricsSummary = (code: GeneratedCode): AnalysisMetricsSummary | null => {
        if (!code.metrics) return null

        const m = code.metrics

        // Calcular promedios de cada categoría
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
                    {/* Botón Analizar Todos */}
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

                    {/* Botón Ver Comparación */}
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
                                                Resultados del Análisis
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Score */}
                                                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                                                    <span className="font-medium">Score Total</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-2xl font-bold text-primary">
                                                            {code.metrics.totalScore?.toFixed(1) || '0'}
                                                        </div>
                                                        <span className="text-muted-foreground">/100</span>
                                                    </div>
                                                </div>

                                                {/* Metrics Preview */}
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
                            </TabsContent>
                        )
                    })}
                </Tabs>
            )}
        </div>
    )
}