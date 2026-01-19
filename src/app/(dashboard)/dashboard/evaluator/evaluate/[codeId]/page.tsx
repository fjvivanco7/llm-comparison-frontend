"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Send, Star } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import Link from "next/link"
import { CodeBlock } from "@/components/ui/code-block"
import type { PendingCode, CreateEvaluationDto } from "@/types/evaluation.types"

const CRITERIA = [
    {
        key: 'readabilityScore',
        label: 'Legibilidad',
        description: 'Nombres claros, formato consistente, fácil de leer',
        color: 'text-blue-500',
    },
    {
        key: 'clarityScore',
        label: 'Claridad',
        description: 'Lógica comprensible, sin ambigüedades',
        color: 'text-green-500',
    },
    {
        key: 'structureScore',
        label: 'Estructura',
        description: 'Organización, modularidad, patrones de diseño',
        color: 'text-orange-500',
    },
    {
        key: 'documentationScore',
        label: 'Documentación',
        description: 'Comentarios útiles, explicaciones claras',
        color: 'text-purple-500',
    },
] as const

export default function EvaluateCodePage() {
    const params = useParams()
    const router = useRouter()
    const codeId = parseInt(params.codeId as string)

    const [code, setCode] = useState<PendingCode | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [scores, setScores] = useState({
        readabilityScore: 0,
        clarityScore: 0,
        structureScore: 0,
        documentationScore: 0,
    })

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

    const handleScoreChange = (criterion: keyof typeof scores, value: number) => {
        setScores(prev => ({ ...prev, [criterion]: value }))
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

            const evaluationDto: CreateEvaluationDto = {
                ...scores,
                ...comments,
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
        const total = Object.values(scores).reduce((sum, score) => sum + score, 0)
        return (total / 4).toFixed(2)
    }

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
                <p className="text-muted-foreground">
                    {code.llmName} • {code.userPrompt}
                </p>
            </div>

            {/* Código a evaluar */}
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
                        maxHeight="500px"
                    />
                </CardContent>
            </Card>

            {/* Formulario de Evaluación */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Rúbrica de Evaluación</CardTitle>
                    <CardDescription>
                        Califica cada criterio del 1 al 5, donde 1 es muy deficiente y 5 es excelente
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Criterios */}
                    {CRITERIA.map((criterion) => (
                        <div key={criterion.key} className="space-y-3">
                            <div>
                                <Label className={`text-base font-semibold ${criterion.color}`}>
                                    {criterion.label}
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {criterion.description}
                                </p>
                            </div>

                            {/* Stars para puntuación */}
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => handleScoreChange(criterion.key, value)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`h-8 w-8 ${
                                                scores[criterion.key] >= value
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-medium">
                  {scores[criterion.key] > 0 ? scores[criterion.key] : '-'} / 5
                </span>
                            </div>

                            {/* Comentarios opcionales */}
                            <Textarea
                                placeholder={`Comentarios sobre ${criterion.label.toLowerCase()} (opcional)`}
                                value={comments[`${criterion.key.replace('Score', 'Comments')}` as keyof typeof comments]}
                                onChange={(e) =>
                                    setComments(prev => ({
                                        ...prev,
                                        [`${criterion.key.replace('Score', 'Comments')}`]: e.target.value,
                                    }))
                                }
                                className="min-h-[80px]"
                            />
                        </div>
                    ))}

                    {/* Comentarios generales */}
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-base font-semibold">
                            Comentarios Generales
                        </Label>
                        <Textarea
                            placeholder="Observaciones generales sobre el código (opcional)"
                            value={comments.generalComments}
                            onChange={(e) =>
                                setComments(prev => ({ ...prev, generalComments: e.target.value }))
                            }
                            className="min-h-[120px]"
                        />
                    </div>

                    {/* Score promedio */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                        <span className="font-medium">Score Promedio</span>
                        <span className="text-2xl font-bold text-primary">
              {calculateAverage()} / 5.0
            </span>
                    </div>

                    {/* Botón enviar */}
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