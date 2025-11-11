"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Send, Code2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"

const availableModels = [
    {
        id: "claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        color: "bg-orange-500",
        description: "El más inteligente"
    },
    {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "OpenAI",
        color: "bg-green-500",
        description: "Rápido y potente"
    },
    {
        id: "google/gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        provider: "Google",
        color: "bg-blue-500",
        description: "Último modelo de Google"
    },
    {
        id: "mistral-large",
        name: "Mistral Large",
        provider: "Mistral AI",
        color: "bg-purple-500",
        description: "Potente y versátil"
    },
]

export default function NewQueryPage() {
    const router = useRouter()
    const [prompt, setPrompt] = useState("")
    // ✅ Por defecto, seleccionar los 4 modelos
    const [selectedModels, setSelectedModels] = useState<string[]>([
        "claude-3.5-sonnet",
        "gpt-4",
        "gemini-2.5-pro",
        "mistral-large"
    ])
    const [isGenerating, setIsGenerating] = useState(false)

    const toggleModel = (modelId: string) => {
        if (selectedModels.includes(modelId)) {
            setSelectedModels(selectedModels.filter(id => id !== modelId))
        } else {
            setSelectedModels([...selectedModels, modelId])
        }
    }

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Error", {
                description: "Por favor escribe un prompt",
            })
            return
        }

        if (selectedModels.length === 0) {
            toast.error("Error", {
                description: "Selecciona al menos un modelo",
            })
            return
        }

        try {
            setIsGenerating(true)

            const response = await api.post("/queries", {
                userPrompt: prompt,
                promptCategory: "algorithms", // Opcional
                models: selectedModels,
            })

            toast.success("¡Código generado!", {
                description: `${selectedModels.length} modelos completados`,
            })

            // Redirigir a la vista de la consulta
            router.push(`/dashboard/queries/${response.data.id}`)
        } catch (error: any) {
            console.error(error)
            toast.error("Error al generar código", {
                description: error.response?.data?.message || "Intenta de nuevo",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const examplePrompts = [
        "Función que valide un email con regex",
        "Algoritmo de ordenamiento quicksort",
        "Función para calcular números primos",
        "Validador de tarjetas de crédito con Luhn",
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="h-7 w-7 text-primary" />
                    Nueva Consulta
                </h1>
                <p className="text-muted-foreground mt-2">
                    Genera código JavaScript con los mejores modelos de IA y compara los resultados
                </p>
            </div>

            {/* Main Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>¿Qué código necesitas?</CardTitle>
                    <CardDescription>
                        Describe lo que quieres crear en JavaScript
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Prompt</Label>
                        <Textarea
                            id="prompt"
                            placeholder="Ejemplo: Crea una función que ordene un array de números de menor a mayor..."
                            className="min-h-[150px] resize-none"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isGenerating}
                        />
                        <p className="text-xs text-muted-foreground">
                            {prompt.length} caracteres
                        </p>
                    </div>

                    {/* Example Prompts */}
                    <div className="space-y-2">
                        <Label className="text-sm">Ejemplos rápidos:</Label>
                        <div className="flex flex-wrap gap-2">
                            {examplePrompts.map((example, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setPrompt(example)}
                                    disabled={isGenerating}
                                >
                                    {example}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Modelos Premium ({selectedModels.length} seleccionados)</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedModels(availableModels.map(m => m.id))}
                                disabled={isGenerating}
                            >
                                Seleccionar todos
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableModels.map((model) => {
                                const isSelected = selectedModels.includes(model.id)
                                return (
                                    <div
                                        key={model.id}
                                        className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                        onClick={() => !isGenerating && toggleModel(model.id)}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={isGenerating}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${model.color}`} />
                                                <p className="font-medium text-sm">{model.name}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{model.provider}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                                                {model.description}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim() || selectedModels.length === 0}
                        className="w-full h-12"
                        size="lg"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generando código con {selectedModels.length} modelos premium...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                Generar con {selectedModels.length} {selectedModels.length === 1 ? "modelo" : "modelos"}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-border/50 bg-muted/30">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Code2 className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">¿Cómo funciona?</p>
                            <p className="text-sm text-muted-foreground">
                                Cada modelo de IA generará su propia solución en paralelo. Después podrás analizar
                                y comparar las métricas de calidad, corrección, eficiencia y seguridad de cada código.
                                Los mejores modelos del mercado: Claude, GPT-4, Gemini y Mistral.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}