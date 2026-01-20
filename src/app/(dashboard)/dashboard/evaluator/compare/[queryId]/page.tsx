"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    Trophy,
    Medal,
    GripVertical,
    Send,
    Check,
    ChevronUp,
    ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import Link from "next/link"
import { CodeBlock } from "@/components/ui/code-block"
import { cn } from "@/lib/utils"

interface CodeForComparison {
    id: number
    llmName: string
    codeContent: string
    generatedAt: string
    hasMetrics: boolean
    quantitativeScore: number | null
    hasEvaluation: boolean
    evaluationScore: number | null
}

interface QueryComparison {
    id: number
    userPrompt: string
    createdAt: string
    codes: CodeForComparison[]
    existingComparison: {
        rankings: { codeId: number; rank: number }[]
        winnerId: number | null
        comparisonNotes: string | null
    } | null
}

export default function CompareDetailPage() {
    const params = useParams()
    const router = useRouter()
    const queryId = parseInt(params.queryId as string)

    const [query, setQuery] = useState<QueryComparison | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Rankings (order determines rank)
    const [rankedCodes, setRankedCodes] = useState<CodeForComparison[]>([])
    const [comparisonNotes, setComparisonNotes] = useState('')

    useEffect(() => {
        loadQuery()
    }, [queryId])

    const loadQuery = async () => {
        try {
            const response = await api.get<QueryComparison>(`/evaluation/comparative/query/${queryId}`)
            setQuery(response.data)

            // Initialize rankings
            if (response.data.existingComparison) {
                // Restore existing order
                const sortedCodes = [...response.data.codes].sort((a, b) => {
                    const rankA = response.data.existingComparison?.rankings.find(r => r.codeId === a.id)?.rank || 999
                    const rankB = response.data.existingComparison?.rankings.find(r => r.codeId === b.id)?.rank || 999
                    return rankA - rankB
                })
                setRankedCodes(sortedCodes)
                setComparisonNotes(response.data.existingComparison.comparisonNotes || '')
            } else {
                setRankedCodes(response.data.codes)
            }
        } catch (error) {
            console.error('Error loading query:', error)
            toast.error('Error al cargar la consulta')
            router.push('/dashboard/evaluator/compare')
        } finally {
            setIsLoading(false)
        }
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const newRanked = [...rankedCodes]
        ;[newRanked[index - 1], newRanked[index]] = [newRanked[index], newRanked[index - 1]]
        setRankedCodes(newRanked)
    }

    const moveDown = (index: number) => {
        if (index === rankedCodes.length - 1) return
        const newRanked = [...rankedCodes]
        ;[newRanked[index], newRanked[index + 1]] = [newRanked[index + 1], newRanked[index]]
        setRankedCodes(newRanked)
    }

    const handleSubmit = async () => {
        if (query?.existingComparison) {
            toast.error('Ya has evaluado esta comparación')
            return
        }

        try {
            setIsSubmitting(true)

            const rankings = rankedCodes.map((code, index) => ({
                codeId: code.id,
                rank: index + 1,
            }))

            await api.post('/evaluation/comparative', {
                queryId,
                rankings,
                winnerId: rankedCodes[0].id,
                comparisonNotes: comparisonNotes || undefined,
            })

            toast.success('¡Comparación guardada!', {
                description: `${rankedCodes[0].llmName} fue seleccionado como el mejor`,
            })

            router.push('/dashboard/evaluator/compare')
        } catch (error: any) {
            console.error('Error submitting comparison:', error)
            toast.error('Error al guardar la comparación', {
                description: error.response?.data?.message || 'Intenta de nuevo',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
        if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
        if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
        return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
    }

    const getRankBadge = (index: number) => {
        if (index === 0) return <Badge className="bg-yellow-500">1° Mejor</Badge>
        if (index === 1) return <Badge variant="secondary">2° Lugar</Badge>
        if (index === 2) return <Badge variant="outline">3° Lugar</Badge>
        return <Badge variant="outline">{index + 1}° Lugar</Badge>
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid gap-4 lg:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    if (!query) {
        return null
    }

    const isReadOnly = !!query.existingComparison

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/evaluator/compare">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a comparaciones
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Comparar Códigos
                </h1>
                <p className="text-muted-foreground line-clamp-2">
                    {query.userPrompt}
                </p>
            </div>

            {isReadOnly && (
                <Card className="border-green-500/50 bg-green-500/10">
                    <CardContent className="flex items-center gap-3 py-4">
                        <Check className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="font-medium">Ya evaluaste esta comparación</p>
                            <p className="text-sm text-muted-foreground">
                                El ganador fue: {rankedCodes[0]?.llmName}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Instrucciones */}
            {!isReadOnly && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="py-4">
                        <p className="text-sm">
                            <strong>Instrucciones:</strong> Ordena los códigos del mejor al peor usando las flechas.
                            El código en la posición #1 será el ganador. Puedes agregar notas explicando tu decisión.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Ranking y códigos */}
            <div className="space-y-4">
                {rankedCodes.map((code, index) => (
                    <Card
                        key={code.id}
                        className={cn(
                            "border-border/50 bg-card/50 backdrop-blur transition-all",
                            index === 0 && "border-yellow-500/50 bg-yellow-500/5"
                        )}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getRankIcon(index)}
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {code.llmName}
                                            {getRankBadge(index)}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-3 mt-1">
                                            {code.hasMetrics && code.quantitativeScore !== null && (
                                                <span>Score cuantitativo: {code.quantitativeScore.toFixed(1)}</span>
                                            )}
                                            {code.hasEvaluation && code.evaluationScore !== null && (
                                                <span>Score cualitativo: {code.evaluationScore.toFixed(1)}</span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>

                                {!isReadOnly && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveDown(index)}
                                            disabled={index === rankedCodes.length - 1}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CodeBlock
                                code={code.codeContent}
                                language="javascript"
                                showLineNumbers
                                maxHeight="400px"
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Notas y enviar */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Notas de Comparación</CardTitle>
                    <CardDescription>
                        Explica por qué elegiste este orden (opcional)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="¿Por qué consideras que el primer código es mejor? ¿Qué diferencias notaste?"
                        value={comparisonNotes}
                        onChange={(e) => setComparisonNotes(e.target.value)}
                        disabled={isReadOnly}
                        className="min-h-[120px]"
                    />

                    {!isReadOnly && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                                <p className="font-medium">Ganador seleccionado:</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    {rankedCodes[0]?.llmName}
                                </p>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="gap-2"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <>Guardando...</>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Guardar Comparación
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
