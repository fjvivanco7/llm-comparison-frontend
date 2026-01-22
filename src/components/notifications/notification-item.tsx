'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CheckCircle2,
  Code2,
  ClipboardCheck,
  Bell,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import { useNotificationsStore } from '@/store/notifications-store'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types/notification.types'

interface NotificationItemProps {
  notification: Notification
  onClose?: () => void
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  CODE_EVALUATED: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  NEW_CODE_TO_EVALUATE: <Code2 className="h-5 w-5 text-blue-500" />,
  EVALUATION_REMINDER: <ClipboardCheck className="h-5 w-5 text-yellow-500" />,
  SYSTEM: <Bell className="h-5 w-5 text-gray-500" />,
}

const notificationColors: Record<NotificationType, string> = {
  CODE_EVALUATED: 'border-l-green-500',
  NEW_CODE_TO_EVALUATE: 'border-l-blue-500',
  EVALUATION_REMINDER: 'border-l-yellow-500',
  SYSTEM: 'border-l-gray-500',
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter()
  const { markAsRead } = useNotifications()
  const { deleteNotification } = useNotificationsStore()

  const handleClick = () => {
    // Marcar como leída
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // Navegar según el tipo de notificación
    const { type, data } = notification

    switch (type) {
      case 'CODE_EVALUATED':
        if (data?.codeId) {
          router.push(`/dashboard/queries`)
        }
        break
      case 'NEW_CODE_TO_EVALUATE':
        router.push('/dashboard/evaluator/pending')
        break
      case 'EVALUATION_REMINDER':
        router.push('/dashboard/evaluator/pending')
        break
      default:
        break
    }

    onClose?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notification.id)
  }

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex cursor-pointer gap-3 border-l-4 px-4 py-3 transition-colors hover:bg-muted/50',
        notificationColors[notification.type],
        !notification.isRead && 'bg-muted/30'
      )}
    >
      {/* Icono */}
      <div className="flex-shrink-0 pt-0.5">
        {notificationIcons[notification.type]}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm',
              !notification.isRead && 'font-medium'
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        {/* Metadata adicional */}
        {notification.data?.score !== undefined && (
          <p className="mt-1 text-xs font-medium text-green-600">
            Puntuación: {notification.data.score.toFixed(1)}/5
          </p>
        )}

        <p className="mt-1 text-[10px] text-muted-foreground">
          {timeAgo}
        </p>
      </div>

      {/* Botón eliminar (visible en hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Eliminar</span>
      </Button>
    </div>
  )
}
