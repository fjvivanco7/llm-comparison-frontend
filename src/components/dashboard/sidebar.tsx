"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Code2,
    LayoutDashboard,
    FileCode,
    GitCompare,
    BarChart3,
    Settings,
    LogOut,
    Plus,
    User,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Nueva Consulta", href: "/dashboard/new-query", icon: Plus },
    { name: "Mis Consultas", href: "/dashboard/queries", icon: FileCode },
    { name: "Comparación", href: "/dashboard/comparison", icon: GitCompare },
    { name: "Estadísticas", href: "/dashboard/stats", icon: BarChart3 },
]

export function Sidebar() {
    const { user, logout } = useAuthStore()
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const getInitials = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        }
        return user?.email[0].toUpperCase() || "U"
    }

    return (
        <div
            className={cn(
                "relative flex h-screen flex-col border-r border-border/40 bg-card/50 backdrop-blur transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Code2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold">LLM Comparison</span>
                    </div>
                )}

                {isCollapsed && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary mx-auto">
                        <Code2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-background shadow-md hover:bg-accent",
                )}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                ) : (
                    <ChevronLeft className="h-3 w-3" />
                )}
            </Button>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                isCollapsed && "justify-center"
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User section */}
            <div className="border-t border-border/40 p-4">
                {!user?.isEmailVerified && !isCollapsed && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
                        Email no verificado
                    </div>
                )}

                {/* Avatar */}
                <div className={cn(
                    "flex items-center gap-3 rounded-lg bg-muted/50 p-3 mb-3",
                    isCollapsed && "justify-center p-2"
                )}>
                    <Avatar className={cn("h-9 w-9", isCollapsed && "h-8 w-8")}>
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user?.firstName || "Usuario"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-1">
                    <Link href="/dashboard/profile">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "w-full gap-2",
                                isCollapsed ? "justify-center px-0" : "justify-start"
                            )}
                            title={isCollapsed ? "Perfil" : undefined}
                        >
                            <User className="h-4 w-4" />
                            {!isCollapsed && <span>Perfil</span>}
                        </Button>
                    </Link>

                    <Link href="/dashboard/settings">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "w-full gap-2",
                                isCollapsed ? "justify-center px-0" : "justify-start"
                            )}
                            title={isCollapsed ? "Configuración" : undefined}
                        >
                            <Settings className="h-4 w-4" />
                            {!isCollapsed && <span>Configuración</span>}
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "w-full gap-2 text-destructive hover:text-destructive",
                            isCollapsed ? "justify-center px-0" : "justify-start"
                        )}
                        onClick={logout}
                        title={isCollapsed ? "Cerrar sesión" : undefined}
                    >
                        <LogOut className="h-4 w-4" />
                        {!isCollapsed && <span>Cerrar sesión</span>}
                    </Button>
                </div>
            </div>
        </div>
    )
}