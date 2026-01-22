import { create } from 'zustand'
import api from '@/lib/axios'
import type { Notification, NotificationFilters, NotificationListResponse } from '@/types/notification.types'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  isConnected: boolean

  // Paginación
  currentPage: number
  totalPages: number
  total: number

  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  setUnreadCount: (count: number) => void
  incrementUnreadCount: () => void
  setConnected: (connected: boolean) => void

  // API Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: number) => Promise<void>
  clearReadNotifications: () => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isConnected: false,
  currentPage: 1,
  totalPages: 1,
  total: 0,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }))
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnreadCount: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }))
  },

  setConnected: (connected) => set({ isConnected: connected }),

  fetchNotifications: async (filters?: NotificationFilters) => {
    try {
      set({ isLoading: true })

      const params = new URLSearchParams()
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.unreadOnly) params.append('unreadOnly', 'true')
      if (filters?.type) params.append('type', filters.type)

      const response = await api.get<NotificationListResponse>(
        `/notifications?${params.toString()}`
      )

      set({
        notifications: response.data.data,
        unreadCount: response.data.meta.unreadCount,
        currentPage: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
        total: response.data.meta.total,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      set({ isLoading: false })
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all')

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`)

      set((state) => {
        const notification = state.notifications.find((n) => n.id === notificationId)
        return {
          notifications: state.notifications.filter((n) => n.id !== notificationId),
          unreadCount: notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
          total: state.total - 1,
        }
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  },

  clearReadNotifications: async () => {
    try {
      await api.delete('/notifications/clear/read')

      set((state) => ({
        notifications: state.notifications.filter((n) => !n.isRead),
      }))
    } catch (error) {
      console.error('Error clearing read notifications:', error)
    }
  },
}))
