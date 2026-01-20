"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GitCompare, Code2, ArrowRight, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface QueryForComparison {
    id: number
    userPrompt: string
    createdAt: string
    codesCount: number
    codes: {
        id: number
        llmName: string
        codePreview: string
    }[]
}

export default function ComparePage() {
    const router = useRouter()
    const [queries, setQueries] = useState<QueryForComparison[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadQueries()
    }, [])

    const loadQueries = async () => {
        try {
            const response = await api.get<QueryForComparison[]>('/evaluation/comparative/pending')
            setQueries(response.data)
        } catch (error) {
            console.error('Error loading queries:', error)
            toast.error('Error al cargar consultas')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <GitCompare className="h-7 w-7" />
                        Evaluación Comparativa
                    </h1>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        )
    }

    if (queries.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <GitCompare className="h-7 w-7" />
                        Evaluación Comparativa
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Compara códigos de diferentes LLMs lado a lado
                    </p>
                </div>
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">¡Todo comparado!</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            No hay consultas pendientes para comparar. Todas las consultas con múltiples códigos ya han sido evaluadas.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <GitCompare className="h-7 w-7" />
                    Evaluación Comparativa
                </h1>
                <p className="text-muted-foreground mt-2">
                    Compara códigos de diferentes LLMs lado a lado y elige el mejor
                </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm py-1 px-3">
                    {queries.length} {queries.length === 1 ? 'consulta pendiente' : 'consultas pendientes'}
                </Badge>
            </div>

            {/* Lista de consultas */}
            <div className="grid gap-4">
                {queries.map((query) => (
                    <Card
                        key={query.id}
                        className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => router.push(`/dashboard/evaluator/compare/${query.id}`)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg line-clamp-2 mb-2">
                                        {query.userPrompt}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-4 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(query.createdAt), "PPp", { locale: es })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Code2 className="h-3 w-3" />
                                            {query.codesCount} códigos para comparar
                                        </span>
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {query.codes.map((code) => (
                                    <Badge key={code.id} variant="outline">
                                        {code.llmName}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
