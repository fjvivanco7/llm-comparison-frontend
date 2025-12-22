"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardCheck, Code2, AlertCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { PendingCode } from "@/types/evaluation.types"

export default function PendingCodesPage() {
    const router = useRouter()
    const [codes, setCodes] = useState<PendingCode[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadPendingCodes()
    }, [])

    const loadPendingCodes = async () => {
        try {
            const response = await api.get<PendingCode[]>('/evaluation/pending')
            setCodes(response.data)
        } catch (error) {
            console.error('Error loading pending codes:', error)
        } finally {
            setIsLoading(false)
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        )
    }

    if (codes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">¡Todo evaluado!</h2>
                <p className="text-muted-foreground mb-6">
                    No hay códigos pendientes de evaluar en este momento
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ClipboardCheck className="h-8 w-8 text-primary" />
                    Códigos Pendientes
                </h1>
                <p className="text-muted-foreground mt-2">
                    {codes.length} {codes.length === 1 ? 'código pendiente' : 'códigos pendientes'} de evaluar
                </p>
            </div>

            {/* Códigos pendientes */}
            <div className="grid gap-4">
                {codes.map((code) => (
                    <Card
                        key={code.id}
                        className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all"
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`h-3 w-3 rounded-full ${getModelColor(code.llmName)}`} />
                                        <CardTitle className="text-lg">{code.llmName}</CardTitle>
                                        {code.hasMetrics && (
                                            <Badge variant="secondary" className="gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Analizado
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {code.userPrompt}
                                    </CardDescription>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span>{format(new Date(code.generatedAt), "PPp", { locale: es })}</span>
                                        {code.hasMetrics && code.quantitativeScore !== null && (
                                            <>
                                                <span>•</span>
                                                <span>Score Cuantitativo: {code.quantitativeScore.toFixed(1)}/100</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Preview del código */}
                                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs max-h-32 overflow-hidden relative">
                  <pre className="whitespace-pre-wrap break-words">
                    {code.codeContent.substring(0, 200)}
                      {code.codeContent.length > 200 && '...'}
                  </pre>
                                    {code.codeContent.length > 200 && (
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/50 to-transparent" />
                                    )}
                                </div>

                                {/* Botón de evaluar */}
                                <Button
                                    onClick={() => router.push(`/dashboard/evaluator/evaluate/${code.id}`)}
                                    className="w-full gap-2"
                                >
                                    <Code2 className="h-4 w-4" />
                                    Evaluar Código
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}