export interface DashboardStats {
    totalQueries: number
    totalCodesGenerated: number
    totalAnalysisCompleted: number
    bestModel: {
        name: string
        avgScore: number
    }
    recentQueries: RecentQuery[]
}

export interface RecentQuery {
    id: number
    userPrompt: string
    status: string
    createdAt: string
    codesCount: number
}