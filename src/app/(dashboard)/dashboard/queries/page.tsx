"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileCode, Clock, Code2, ArrowRight, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface Query {
    id: number
    userPrompt: string
    status: string
    createdAt: string
    generatedCodes: Array<{
        id: number
        llmName: string
    }>
}

interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

const ITEMS_PER_PAGE = 10

export default function QueriesPage() {
    const router = useRouter()
    const [queries, setQueries] = useState<Query[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        loadQueries(currentPage)
    }, [currentPage])

    const loadQueries = async (page: number) => {
        try {
            setIsLoading(true)
            const response = await api.get(`/queries?page=${page}&limit=${ITEMS_PER_PAGE}`)
            setQueries(response.data.data)
            setMeta(response.data.meta)
        } catch (error) {
            console.error("Error loading queries:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNextPage = () => {
        if (meta?.hasNextPage) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const handlePrevPage = () => {
        if (meta?.hasPrevPage) {
            setCurrentPage(prev => prev - 1)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            completed: "default",
            processing: "secondary",
            failed: "destructive",
        }
        return (
            <Badge variant={variants[status] || "secondary"}>
                {status === "completed" ? "Completado" : status === "processing" ? "Procesando" : "Fallido"}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Consultas</h1>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!isLoading && queries.length === 0 && currentPage === 1) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                    <FileCode className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No tienes consultas aún</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Comienza generando código con diferentes modelos de IA para comparar resultados
                </p>
                <Link href="/dashboard/new-query">
                    <Button size="lg" className="gap-2">
                        <Plus className="h-5 w-5" />
                        Nueva Consulta
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Consultas</h1>
                    <p className="text-muted-foreground mt-2">
                        Historial de código generado
                    </p>
                </div>
                <Link href="/dashboard/new-query">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Consulta
                    </Button>
                </Link>
            </div>

            {/* Queries List */}
            <div className="grid gap-4">
                {queries.map((query) => (
                    <Card
                        key={query.id}
                        className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => router.push(`/dashboard/queries/${query.id}`)}
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
                                            {query.generatedCodes.length} {query.generatedCodes.length === 1 ? "modelo" : "modelos"}
                    </span>
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(query.status)}
                                    <Button variant="ghost" size="icon">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} de {meta.total} consultas
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={!meta.hasPrevPage || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                            Página {meta.page} de {meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={!meta.hasNextPage || isLoading}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}