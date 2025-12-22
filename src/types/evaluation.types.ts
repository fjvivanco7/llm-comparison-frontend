export interface QualitativeEvaluation {
    id: number
    codeId: number
    evaluatorId: number
    evaluatorName: string
    readabilityScore: number
    clarityScore: number
    structureScore: number
    documentationScore: number
    totalScore: number
    generalComments?: string
    readabilityComments?: string
    clarityComments?: string
    structureComments?: string
    documentationComments?: string
    evaluatedAt: string
}

export interface PendingCode {
    id: number
    llmName: string
    codeContent: string
    queryId: number
    userPrompt: string
    generatedAt: string
    hasMetrics: boolean
    quantitativeScore: number | null
}

export interface EvaluationStats {
    totalEvaluations: number
    averageScores: {
        readability: number
        clarity: number
        structure: number
        documentation: number
        total: number
    }
    bestCode: {
        codeId: number
        llmName: string
        score: number
    } | null
    modelRanking: Array<{
        llmName: string
        avgQualitativeScore: number
        totalEvaluations: number
    }>
}

export interface CreateEvaluationDto {
    readabilityScore: number
    clarityScore: number
    structureScore: number
    documentationScore: number
    generalComments?: string
    readabilityComments?: string
    clarityComments?: string
    structureComments?: string
    documentationComments?: string
}