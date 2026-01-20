"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowLeft, Send, Star, AlertTriangle, Bug, Shield, Zap, FileCode, User } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import Link from "next/link"
import { CodeBlock } from "@/components/ui/code-block"
import type { PendingCode } from "@/types/evaluation.types"

// Criterios de evaluación
const CRITERIA = [
    {
        key: 'readabilityScore',
        label: 'Legibilidad',
        description: 'Nombres claros, formato consistente, fácil de leer',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
    },
    {
        key: 'clarityScore',
        label: 'Claridad',
        description: 'Lógica comprensible, sin ambigüedades',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    {
        key: 'structureScore',
        label: 'Estructura',
        description: 'Organización, modularidad, patrones de diseño',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
    },
    {
        key: 'documentationScore',
        label: 'Documentación',
        description: 'Comentarios útiles, explicaciones claras',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
    },
] as const

// Tags de problemas
const PROBLEM_TAGS = [
    { id: 'has_bugs', label: 'Tiene bugs', icon: Bug, color: 'text-red-500' },
    { id: 'redundant_code', label: 'Código redundante', icon: FileCode, color: 'text-orange-500' },
    { id: 'security_issue', label: 'Problema de seguridad', icon: Shield, color: 'text-rose-500' },
    { id: 'bad_practice', label: 'Mala práctica', icon: AlertTriangle, color: 'text-yellow-500' },
    { id: 'missing_error_handling', label: 'Falta manejo de errores', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'incomplete_code', label: 'Código incompleto', icon: FileCode, color: 'text-gray-500' },
    { id: 'poor_naming', label: 'Nombres poco descriptivos', icon: FileCode, color: 'text-blue-500' },
    { id: 'no_comments', label: 'Sin comentarios', icon: FileCode, color: 'text-purple-500' },
    { id: 'inefficient', label: 'Ineficiente', icon: Zap, color: 'text-yellow-600' },
    { id: 'hard_to_read', label: 'Difícil de leer', icon: FileCode, color: 'text-indigo-500' },
]

// Rúbricas de puntuación
const SCORE_RUBRICS: Record<number, { label: string; description: string; color: string }> = {
    1: { label: 'Muy deficiente', description: 'Código ilegible o no funcional', color: 'text-red-500' },
    2: { label: 'Deficiente', description: 'Funciona pero tiene problemas importantes', color: 'text-orange-500' },
    3: { label: 'Aceptable', description: 'Cumple lo básico, hay espacio para mejora', color: 'text-yellow-500' },
    4: { label: 'Bueno', description: 'Bien estructurado, pocas mejoras necesarias', color: 'text-green-500' },
    5: { label: 'Excelente', description: 'Código ejemplar, sigue mejores prácticas', color: 'text-emerald-500' },
}

export default function EvaluateCodePage() {
    const params = useParams()
    const router = useRouter()
    const codeId = parseInt(params.codeId as string)

    const [code, setCode] = useState<PendingCode | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Scores
    const [scores, setScores] = useState({
        readabilityScore: 0,
        clarityScore: 0,
        structureScore: 0,
        documentationScore: 0,
    })

    // Problem tags
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const [comments, setComments] = useState({
        generalComments: '',
        readabilityComments: '',
        clarityComments: '',
        structureComments: '',
        documentationComments: '',
    })

    useEffect(() => {
        loadCode()
    }, [codeId])

    const loadCode = async () => {
        try {
            const response = await api.get<PendingCode[]>('/evaluation/pending')
            const foundCode = response.data.find(c => c.id === codeId)

            if (!foundCode) {
                toast.error('Código no encontrado o ya evaluado')
                router.push('/dashboard/evaluator/pending')
                return
            }

            setCode(foundCode)
        } catch (error) {
            console.error('Error loading code:', error)
            toast.error('Error al cargar el código')
        } finally {
            setIsLoading(false)
        }
    }

    const handleScoreChange = (criterion: string, value: number) => {
        setScores(prev => ({ ...prev, [criterion]: value }))
    }

    const handleTagToggle = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        )
    }

    const handleSubmit = async () => {
        // Validar que todos los criterios tengan puntuación
        const allScored = Object.values(scores).every(score => score > 0)

        if (!allScored) {
            toast.error('Por favor califica todos los criterios (1-5)')
            return
        }

        try {
            setIsSubmitting(true)

            const evaluationDto = {
                ...scores,
                ...comments,
                problemTags: selectedTags,
            }

            await api.post(`/evaluation/code/${codeId}`, evaluationDto)

            toast.success('¡Evaluación enviada!', {
                description: 'El código ha sido evaluado exitosamente',
            })

            router.push('/dashboard/evaluator/pending')
        } catch (error: any) {
            console.error('Error submitting evaluation:', error)
            toast.error('Error al enviar la evaluación', {
                description: error.response?.data?.message || 'Intenta de nuevo',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const calculateAverage = () => {
        const validScores = Object.values(scores).filter(s => s > 0)
        if (validScores.length === 0) return '0.00'
        const total = validScores.reduce((sum, score) => sum + score, 0)
        return (total / validScores.length).toFixed(2)
    }

    const ScoreSelector = ({
        criterion,
        currentScore,
        onChange,
        color,
    }: {
        criterion: string
        currentScore: number
        onChange: (value: number) => void
        color: string
    }) => (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                    <TooltipProvider key={value}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => onChange(value)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`h-7 w-7 ${
                                            currentScore >= value
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 hover:text-gray-400'
                                        }`}
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <p className={`font-semibold ${SCORE_RUBRICS[value].color}`}>
                                    {value} - {SCORE_RUBRICS[value].label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {SCORE_RUBRICS[value].description}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
                <span className="ml-3 text-sm font-medium">
                    {currentScore > 0 ? (
                        <span className={SCORE_RUBRICS[currentScore]?.color}>
                            {currentScore}/5 - {SCORE_RUBRICS[currentScore]?.label}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Sin calificar</span>
                    )}
                </span>
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96" />
            </div>
        )
    }

    if (!code) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/evaluator/pending">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a pendientes
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Evaluar Código
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{code.llmName}</Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {code.developerName}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-muted-foreground line-clamp-1">{code.userPrompt}</p>
                </div>
            </div>

            {/* Código a evaluar - Arriba ocupando todo el ancho */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Código Generado</CardTitle>
                    <CardDescription>Revisa el código antes de evaluar</CardDescription>
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

            {/* Criterios de Evaluación */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Criterios de Evaluación</CardTitle>
                    <CardDescription>
                        Califica cada criterio del 1 al 5. Pasa el cursor sobre las estrellas para ver la rúbrica.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {CRITERIA.map((criterion) => (
                            <div key={criterion.key} className={`p-4 rounded-lg ${criterion.bgColor}`}>
                                <div className="mb-2">
                                    <Label className={`text-base font-semibold ${criterion.color}`}>
                                        {criterion.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {criterion.description}
                                    </p>
                                </div>
                                <ScoreSelector
                                    criterion={criterion.key}
                                    currentScore={scores[criterion.key as keyof typeof scores]}
                                    onChange={(value) => handleScoreChange(criterion.key, value)}
                                    color={criterion.color}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tags de Problemas */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Problemas Encontrados
                    </CardTitle>
                    <CardDescription>
                        Marca los problemas que identificaste en el código (opcional)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {PROBLEM_TAGS.map((tag) => {
                            const Icon = tag.icon
                            const isSelected = selectedTags.includes(tag.id)
                            return (
                                <div
                                    key={tag.id}
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                        isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        className="pointer-events-none"
                                    />
                                    <Icon className={`h-4 w-4 ${tag.color}`} />
                                    <span className="text-sm">{tag.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Comentarios generales */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Comentarios Generales</CardTitle>
                    <CardDescription>
                        Observaciones adicionales sobre el código (opcional)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Escribe tus observaciones generales aquí..."
                        value={comments.generalComments}
                        onChange={(e) =>
                            setComments(prev => ({ ...prev, generalComments: e.target.value }))
                        }
                        className="min-h-[120px]"
                    />
                </CardContent>
            </Card>

            {/* Score promedio y botón enviar */}
            <Card className="border-primary/50 bg-primary/5 backdrop-blur">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-medium">Score Promedio</p>
                            <p className="text-sm text-muted-foreground">
                                {Object.values(scores).filter(s => s > 0).length} de 4 criterios evaluados
                            </p>
                        </div>
                        <span className="text-3xl font-bold text-primary">
                            {calculateAverage()} / 5.0
                        </span>
                    </div>

                    {selectedTags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                            {selectedTags.map(tagId => {
                                const tag = PROBLEM_TAGS.find(t => t.id === tagId)
                                return tag ? (
                                    <Badge key={tagId} variant="outline" className="text-xs">
                                        {tag.label}
                                    </Badge>
                                ) : null
                            })}
                        </div>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !Object.values(scores).every(s => s > 0)}
                        className="w-full h-12 gap-2"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>Enviando evaluación...</>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Enviar Evaluación
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
