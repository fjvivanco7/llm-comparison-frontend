export type NotificationType =
  | 'CODE_EVALUATED'
  | 'NEW_CODE_TO_EVALUATE'
  | 'EVALUATION_REMINDER'
  | 'SYSTEM'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  data?: {
    codeId?: number
    queryId?: number
    evaluatorName?: string
    llmName?: string
    score?: number
    developerName?: string
    codesCount?: number
    userPrompt?: string
  }
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface NotificationListResponse {
  data: Notification[]
  meta: {
    total: number
    unreadCount: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface NotificationFilters {
  page?: number
  limit?: number
  unreadOnly?: boolean
  type?: NotificationType
}
