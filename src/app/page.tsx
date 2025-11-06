"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Progress} from "@/components/ui/progress"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
    Code2,
    Github,
    ArrowRight,
    Sparkles,
    Brain,
    BarChart3,
    Zap,
    Shield,
    GitCompare,
    CheckCircle2,
    FileText,
    LogIn,
} from "lucide-react"
import Link from "next/link"

export default function Home() {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = () => {
        setIsGenerating(true)
        setTimeout(() => setIsGenerating(false), 2000)
    }

    const features = [
        {
            icon: Brain,
            title: "Múltiples LLMs",
            description:
                "Comparación entre GPT-4, Claude 3.5, Gemini Pro y Mistral Large para generación de código JavaScript.",
        },
        {
            icon: Code2,
            title: "Análisis de Calidad",
            description:
                "Evaluación exhaustiva de corrección, eficiencia, mantenibilidad y seguridad en el código generado.",
        },
        {
            icon: BarChart3,
            title: "Métricas Detalladas",
            description: "14 métricas cuantitativas organizadas en 4 categorías: corrección, eficiencia, mantenibilidad y seguridad.",
        },
        {
            icon: Zap,
            title: "Análisis en Tiempo Real",
            description: "Ejecución de código en sandbox seguro con medición de tiempo de respuesta y uso de memoria.",
        },
        {
            icon: Shield,
            title: "Seguridad",
            description: "Detección automática de vulnerabilidades XSS, inyecciones, secretos hardcodeados y operaciones inseguras.",
        },
        {
            icon: GitCompare,
            title: "Comparación Visual",
            description: "Dashboards interactivos con rankings y estadísticas para visualizar el rendimiento de cada LLM.",
        },
    ]

    const models = [
        {
            name: "GPT-4 Turbo",
            provider: "OpenAI",
            description: "Modelo de última generación con excelente comprensión de contexto y generación de código complejo.",
            features: ["Sintaxis precisa", "Documentación incluida", "Optimización avanzada"],
            color: "from-emerald-500 to-teal-500",
        },
        {
            name: "Claude 3.5 Sonnet",
            provider: "Anthropic",
            description: "Enfocado en seguridad y mejores prácticas, con explicaciones detalladas del código generado.",
            features: ["Código seguro", "Explicaciones claras", "Manejo de errores"],
            color: "from-blue-500 to-cyan-500",
        },
        {
            name: "Gemini Pro",
            provider: "Google",
            description: "Modelo multimodal con capacidades avanzadas de razonamiento y generación de código eficiente.",
            features: ["Velocidad rápida", "Código eficiente", "Integración API"],
            color: "from-violet-500 to-purple-500",
        },
        {
            name: "Mistral Large",
            provider: "Mistral AI",
            description: "Modelo europeo de alto rendimiento con excelente balance entre velocidad y precisión.",
            features: ["Alto rendimiento", "Multilenguaje", "Contexto extenso"],
            color: "from-orange-500 to-red-500",
        },
    ]

    const metrics = [
        {name: "Tasa de Aprobación", gpt4: 95, claude: 93, gemini: 90, mistral: 87},
        {name: "Eficiencia del Código", gpt4: 88, claude: 92, gemini: 89, mistral: 85},
        {name: "Mantenibilidad", gpt4: 90, claude: 95, gemini: 85, mistral: 82},
        {name: "Seguridad", gpt4: 87, claude: 91, gemini: 86, mistral: 84},
        {name: "Velocidad de Generación", gpt4: 82, claude: 80, gemini: 92, mistral: 88},
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header
                className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Code2 className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <span className="text-lg font-semibold">LLM Comparison</span>
                    </div>

                    <nav className="hidden items-center gap-6 md:flex">
                        <a href="#features"
                           className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            Características
                        </a>
                        <a href="#models"
                           className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            Modelos
                        </a>
                        <a href="#comparison"
                           className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            Comparación
                        </a>
                        <a href="#research"
                           className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            Investigación
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button className="gap-2">
                                <LogIn className="h-4 w-4"/>
                                Iniciar Sesión
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-32 pb-20">
                    {/* Background grid */}
                    <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"/>

                    <div className="container relative mx-auto px-4">
                        <div className="mx-auto max-w-4xl text-center">
                            <div
                                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                                <Sparkles className="h-4 w-4"/>
                                <span>Plataforma de Análisis de IA </span>
                            </div>

                            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                                Análisis Comparativo de{" "}
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Generación de Código
                </span>{" "}
                                con LLMs
                            </h1>

                            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                                Sistema de comparación integral para evaluar la calidad de código JavaScript generado
                                por GPT-4, Claude 3.5, Gemini Pro y Mistral Large.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link href="/register">
                                    <Button size="lg" className="gap-2">
                                        Comenzar Ahora
                                        <ArrowRight className="h-4 w-4"/>
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button size="lg" variant="outline">
                                        Ver Resultados
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Code Preview */}
                        <div className="mt-20">
                            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
                                <Tabs defaultValue="input" className="w-full">
                                    <div
                                        className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-3">
                                        <TabsList>
                                            <TabsTrigger value="input">Prompt</TabsTrigger>
                                            <TabsTrigger value="output">Código Generado</TabsTrigger>
                                        </TabsList>
                                        <Badge variant="secondary" className="gap-1.5">
                                            <Sparkles className="h-3 w-3"/>
                                            Claude 3.5
                                        </Badge>
                                    </div>

                                    <TabsContent value="input" className="m-0 p-6">
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">Entrada del usuario:</p>
                                            <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm">
                                                Crea una función que valide un email y retorne true si es válido
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="output" className="m-0 p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">Código JavaScript
                                                    generado:</p>
                                                {isGenerating &&
                                                    <span className="text-xs text-primary">Analizando...</span>}
                                            </div>
                                            <pre
                                                className="overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
                        <code className="text-foreground">{`function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

// Ejemplo de uso
console.log(validateEmail('test@example.com')); // true
console.log(validateEmail('invalid-email')); // false`}</code>
                      </pre>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>✓ Score: 92/100</span>
                                                <span>• Complejidad: Baja</span>
                                                <span>• Tiempo: 45ms</span>
                                                <span>• Seguro</span>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">¿Qué es lo que puedes
                                hacer?</h2>
                            <p className="text-lg text-muted-foreground text-pretty">
                                Analiza y compara código generado por IA con métricas profesionales.
                                Toma decisiones informadas sobre qué modelo usar para cada tarea.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <Card
                                    key={index}
                                    className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg"
                                >
                                    <CardHeader>
                                        <div
                                            className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                            <feature.icon className="h-6 w-6 text-primary"/>
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription
                                            className="text-base leading-relaxed">{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Models Section */}
                <section id="models" className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Modelos Evaluados</h2>
                            <p className="text-lg text-muted-foreground text-pretty">
                                Comparación exhaustiva de los cuatro principales modelos de lenguaje para generación de
                                código JavaScript.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {models.map((model, index) => (
                                <Card
                                    key={index}
                                    className="overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg"
                                >
                                    <div className={`h-2 bg-gradient-to-r ${model.color}`}/>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-2xl mb-1">{model.name}</CardTitle>
                                                <Badge variant="secondary">{model.provider}</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <CardDescription
                                            className="text-base leading-relaxed">{model.description}</CardDescription>
                                        <div className="space-y-2">
                                            {model.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-primary"/>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Comparison Section */}
                <section id="comparison" className="py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Rendimiento en Tiempo
                                Real</h2>
                            <p className="text-lg text-muted-foreground text-pretty">
                                Compara el desempeño de cada modelo en las métricas que más importan para tu proyecto.
                            </p>
                        </div>

                        <Card className="border-border/50 bg-card/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle>Métricas de Evaluación (%)</CardTitle>
                                {/*<CardDescription>Datos basados en pruebas iniciales con Ollama*/}
                                {/*    (CodeLlama)</CardDescription>*/}
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {metrics.map((metric, index) => (
                                    <div key={index} className="space-y-3">
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span>{metric.name}</span>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">GPT-4</span>
                                                    <span className="font-medium">{metric.gpt4}%</span>
                                                </div>
                                                <Progress value={metric.gpt4} className="h-2"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Claude 3.5</span>
                                                    <span className="font-medium">{metric.claude}%</span>
                                                </div>
                                                <Progress value={metric.claude} className="h-2"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Gemini</span>
                                                    <span className="font-medium">{metric.gemini}%</span>
                                                </div>
                                                <Progress value={metric.gemini} className="h-2"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Mistral</span>
                                                    <span className="font-medium">{metric.mistral}%</span>
                                                </div>
                                                <Progress value={metric.mistral} className="h-2"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="research" className="py-24">
                    <div className="container mx-auto px-4">
                        <Card
                            className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 backdrop-blur">
                            <div className="p-12 text-center">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                                    Comienza a Comparar LLMs
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8 text-pretty">
                                    Regístrate para acceder a la plataforma completa de análisis y comparación de código
                                    generado por IA.
                                </p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link href="/register">
                                        <Button size="lg" className="gap-2">
                                            <Sparkles className="h-5 w-5"/>
                                            Crear Cuenta Gratis
                                            <ArrowRight className="h-4 w-4"/>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>

                        <footer
                            className="mt-16 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
                            <p>© 2025 LLM Comparison. Todos los derechos reservados.</p>
                            <p className="mt-2">La forma inteligente de elegir tu modelo de IA</p>
                        </footer>
                    </div>
                </section>
            </main>
        </div>
    )
}