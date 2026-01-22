'use client'

import { useNotificationsStore } from '@/store/notifications-store'
import { emitToSocket } from '@/components/notifications/notifications-provider'

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore()

  // Marcar como leída via WebSocket + API
  const handleMarkAsRead = (notificationId: number) => {
    emitToSocket('mark_as_read', { notificationId })
    markAsRead(notificationId)
  }

  // Marcar todas como leídas via WebSocket + API
  const handleMarkAllAsRead = () => {
    emitToSocket('mark_all_as_read', {})
    markAllAsRead()
  }

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    fetchNotifications,
  }
}
