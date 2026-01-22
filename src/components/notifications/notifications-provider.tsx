'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useNotificationsStore } from '@/store/notifications-store'
import { useAuthStore } from '@/store/auth-store'
import type { Notification } from '@/types/notification.types'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Singleton para evitar múltiples conexiones
let globalSocket: Socket | null = null
let isInitialized = false

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const mountedRef = useRef(true)
  const { token, user } = useAuthStore()
  const {
    setConnected,
    addNotification,
    setUnreadCount,
    incrementUnreadCount,
    fetchNotifications,
  } = useNotificationsStore()

  useEffect(() => {
    mountedRef.current = true

    // Solo inicializar si hay token y usuario y no está ya inicializado
    if (token && user && !isInitialized && !globalSocket) {
      isInitialized = true

      // Cargar notificaciones iniciales
      fetchNotifications({ limit: 20 })

      // Conectar WebSocket
      globalSocket = io(`${SOCKET_URL}/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      globalSocket.on('connect', () => {
        console.log('WebSocket conectado')
        if (mountedRef.current) {
          setConnected(true)
        }
      })

      globalSocket.on('disconnect', (reason) => {
        console.log('WebSocket desconectado:', reason)
        if (mountedRef.current) {
          setConnected(false)
        }
      })

      globalSocket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error.message)
        if (mountedRef.current) {
          setConnected(false)
        }
      })

      globalSocket.on('new_notification', (notification: Notification) => {
        console.log('Nueva notificación:', notification)
        if (mountedRef.current) {
          addNotification(notification)
          incrementUnreadCount()
          showNotificationToast(notification)
        }
      })

      globalSocket.on('unread_count', (data: { count: number }) => {
        if (mountedRef.current) {
          setUnreadCount(data.count)
        }
      })

      globalSocket.on('error', (error: { message: string }) => {
        console.error('Error en WebSocket:', error.message)
      })
    }

    // Cleanup solo cuando el usuario hace logout
    return () => {
      mountedRef.current = false
    }
  }, [token, user, setConnected, addNotification, setUnreadCount, incrementUnreadCount, fetchNotifications])

  // Desconectar cuando el usuario hace logout
  useEffect(() => {
    if (!token && globalSocket) {
      globalSocket.disconnect()
      globalSocket = null
      isInitialized = false
      setConnected(false)
    }
  }, [token, setConnected])

  return <>{children}</>
}

// Función para emitir eventos al WebSocket (exportada para usar desde hooks)
export function emitToSocket(event: string, data: any) {
  if (globalSocket?.connected) {
    globalSocket.emit(event, data)
  }
}

// Helper para mostrar toasts
function showNotificationToast(notification: Notification) {
  const { type, title, message, data } = notification

  switch (type) {
    case 'CODE_EVALUATED':
      toast.success(title, {
        description: message,
        action: data?.codeId
          ? {
              label: 'Ver',
              onClick: () => {
                window.location.href = `/dashboard/queries?highlight=${data.codeId}`
              },
            }
          : undefined,
        duration: 5000,
      })
      break

    case 'NEW_CODE_TO_EVALUATE':
      toast.info(title, {
        description: message,
        action: data?.queryId
          ? {
              label: 'Evaluar',
              onClick: () => {
                window.location.href = `/dashboard/evaluator/pending`
              },
            }
          : undefined,
        duration: 5000,
      })
      break

    case 'EVALUATION_REMINDER':
      toast.warning(title, {
        description: message,
        duration: 5000,
      })
      break

    case 'SYSTEM':
    default:
      toast(title, {
        description: message,
        duration: 4000,
      })
      break
  }
}
