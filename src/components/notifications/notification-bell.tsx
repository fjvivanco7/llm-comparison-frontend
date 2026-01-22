'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationItem } from './notification-item'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications()

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    // Las notificaciones se cargan automáticamente via WebSocket
    // Solo refrescar si no hay notificaciones cargadas
    if (isOpen && notifications.length === 0 && !isLoading) {
      fetchNotifications({ limit: 20 })
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {/* Indicador de conexión */}
          <span
            className={cn(
              'absolute bottom-0 right-0 h-2 w-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            )}
            title={isConnected ? 'Conectado' : 'Desconectado'}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 sm:w-96"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} sin leer
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false)
                // Navegar a página de todas las notificaciones si existe
              }}
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
