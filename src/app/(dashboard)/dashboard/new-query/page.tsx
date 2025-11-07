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
    { id: "codellama", name: "CodeLlama", provider: "Meta", color: "bg-red-500" },
    { id: "deepseek-coder:6.7b", name: "DeepSeek Coder", provider: "DeepSeek", color: "bg-blue-500" },
]

export default function NewQueryPage() {
    const router = useRouter()
    const [prompt, setPrompt] = useState("")
    const [selectedModels, setSelectedModels] = useState<string[]>(["codellama"])
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
        "Componente React de formulario de login",
        "Función para calcular factorial recursivo",
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
                    Genera código JavaScript con múltiples modelos de IA y compara los resultados
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
                        <Label>Selecciona modelos ({selectedModels.length} seleccionados)</Label>
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
                                Generando código...
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
                                Cada modelo generará su propia solución en paralelo. Después podrás analizar
                                y comparar las métricas de calidad, eficiencia y seguridad de cada código.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}