export interface CodeMetrics {
    id: number
    codeId: number

    // CORRECCIÓN (3 métricas)
    passRate?: number
    errorHandlingScore?: number
    runtimeErrorRate?: number

    // EFICIENCIA (3 métricas)
    avgExecutionTime?: number
    memoryUsage?: number
    algorithmicComplexity?: number

    // MANTENIBILIDAD (4 métricas)
    cyclomaticComplexity?: number
    linesOfCode?: number
    nestingDepth?: number
    cohesionScore?: number

    // SEGURIDAD (4 métricas)
    xssVulnerabilities?: number
    injectionVulnerabilities?: number
    hardcodedSecrets?: number
    unsafeOperations?: number

    // PUNTUACIONES FINALES
    totalScore?: number
    analyzedAt: string
}

export interface GeneratedCode {
    id: number
    queryId: number
    llmName: string
    codeContent: string
    generatedAt: string
    generationTimeMs: number

    // Relaciones opcionales
    metrics?: CodeMetrics
}

export interface UserQuery {
    id: number
    userId: number
    userPrompt: string
    promptCategory?: string
    status: string
    createdAt: string

    // Relaciones
    generatedCodes: GeneratedCode[]
}

// Tipos auxiliares para la UI
export interface AnalysisMetricsSummary {
    correctness: number
    efficiency: number
    maintainability: number
    security: number
}