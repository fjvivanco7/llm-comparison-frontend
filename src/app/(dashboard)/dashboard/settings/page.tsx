"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Settings, User, Shield, BarChart3, Monitor, LogOut, Trash2,
    Save, Loader2, Smartphone, Globe, Eye, EyeOff, CheckCircle2,
    AlertTriangle, Lock, QrCode, Key, Copy, Check
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { usePreferencesStore } from "@/store/preferences-store"
import { useTheme } from "next-themes"

// Tipos
interface UserProfile {
    id: number
    email: string
    firstName: string | null
    lastName: string | null
    role: string
    isEmailVerified: boolean
    createdAt: string
    preferences: UserPreferences | null
}

interface UserPreferences {
    promptFontSize: number
    promptFontFamily: string
    theme: string
    language: string
}

interface Session {
    id: number
    deviceInfo: string | null
    ipAddress: string | null
    lastActivity: string
    createdAt: string
}

// Stats para Developer
interface DeveloperStats {
    type: 'developer'
    summary: {
        totalQueries: number
        totalCodes: number
        totalAnalyses: number
        memberSinceDays: number
    }
    daily: {
        used: number
        limit: number
        remaining: number
        percentageUsed: number
    }
    last30Days: {
        queries: number
        averagePerDay: number
    }
    modelUsage: Array<{
        model: string
        count: number
        percentage: number
    }>
    activityByDay: Array<{
        day: string
        count: number
    }>
}

// Stats para Evaluator
interface EvaluatorStats {
    type: 'evaluator'
    summary: {
        totalEvaluations: number
        pendingCodes: number
        memberSinceDays: number
    }
    today: {
        evaluations: number
    }
    last30Days: {
        evaluations: number
        averagePerDay: number
    }
    averageScores: {
        readability: number
        clarity: number
        structure: number
        documentation: number
        overall: number
    }
    activityByDay: Array<{
        day: string
        count: number
    }>
}

type UsageStats = DeveloperStats | EvaluatorStats

// Navegación del sidebar (base)
const allNavItems = [
    { id: "general", label: "General", icon: User },
    { id: "seguridad", label: "Seguridad", icon: Lock },
    { id: "cuenta", label: "Cuenta", icon: Shield },
    { id: "uso", label: "Uso", icon: BarChart3, hideForAdmin: true },
    { id: "sesiones", label: "Sesiones", icon: Monitor },
]

export default function SettingsPage() {
    const { user, setUser, token } = useAuthStore()
    const { theme: currentTheme, setTheme: setSystemTheme } = useTheme()
    const { codeFontSize, codeFontFamily, setCodeFontSize, setCodeFontFamily } = usePreferencesStore()

    // Filtrar items de navegación según rol
    const navItems = allNavItems.filter(item => {
        if (item.hideForAdmin && user?.role === 'ADMIN') return false
        return true
    })

    const [activeSection, setActiveSection] = useState("general")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Estados de datos
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [sessions, setSessions] = useState<Session[]>([])
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null)

    // Estados de formularios
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")
    const [showDeletePassword, setShowDeletePassword] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    // Estados 2FA
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
    const [twoFactorSetup, setTwoFactorSetup] = useState<{ qrCode: string; secret: string } | null>(null)
    const [twoFactorCode, setTwoFactorCode] = useState("")
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [showBackupCodes, setShowBackupCodes] = useState(false)
    const [disableCode, setDisableCode] = useState("")
    const [disablePassword, setDisablePassword] = useState("")
    const [copiedBackup, setCopiedBackup] = useState(false)

    // Preferencias locales (para el formulario)
    const [selectedTheme, setSelectedTheme] = useState(currentTheme || "dark")
    const [fontSize, setFontSize] = useState(codeFontSize)
    const [fontFamily, setFontFamily] = useState(codeFontFamily)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setIsLoading(true)

            // Para admin no cargamos stats de uso
            const isAdmin = user?.role === 'ADMIN'

            const requests: Promise<any>[] = [
                api.get("/users/profile"),
                api.get("/users/sessions"),
                api.get("/auth/2fa/status"),
            ]

            // Solo cargar stats si no es admin
            if (!isAdmin) {
                requests.push(api.get("/users/usage-stats"))
            }

            const responses = await Promise.all(requests)

            setProfile(responses[0].data)
            setSessions(responses[1].data)
            setTwoFactorEnabled(responses[2].data.twoFactorEnabled)

            if (!isAdmin && responses[3]) {
                setUsageStats(responses[3].data)
            }

            // Setear valores del formulario
            setFirstName(responses[0].data.firstName || "")
            setLastName(responses[0].data.lastName || "")

            // Sincronizar preferencias
            if (responses[0].data.preferences) {
                setSelectedTheme(responses[0].data.preferences.theme || "dark")
                setFontSize(responses[0].data.preferences.promptFontSize || 14)
                setFontFamily(responses[0].data.preferences.promptFontFamily || "mono")
            }
        } catch (error) {
            console.error("Error cargando datos:", error)
            toast.error("Error al cargar configuración")
        } finally {
            setIsLoading(false)
        }
    }

    // Guardar perfil
    const handleSaveProfile = async () => {
        try {
            setIsSaving(true)
            const response = await api.put("/users/profile", { firstName, lastName })

            // Actualizar el auth store para reflejar los cambios en el sidebar
            if (user && token) {
                setUser({
                    ...user,
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                }, token)
            }

            toast.success("Perfil actualizado")
            loadData()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al guardar")
        } finally {
            setIsSaving(false)
        }
    }

    // Guardar preferencias
    const handleSavePreferences = async () => {
        try {
            setIsSaving(true)

            // Guardar en servidor
            await api.put("/users/preferences", {
                theme: selectedTheme,
                promptFontSize: fontSize,
                promptFontFamily: fontFamily,
            })

            // Aplicar tema inmediatamente
            setSystemTheme(selectedTheme)

            // Actualizar store de preferencias
            setCodeFontSize(fontSize)
            setCodeFontFamily(fontFamily as 'mono' | 'sans' | 'serif')

            toast.success("Preferencias actualizadas")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al guardar")
        } finally {
            setIsSaving(false)
        }
    }

    // Cambiar contraseña
    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }
        if (newPassword.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres")
            return
        }

        try {
            setIsSaving(true)
            await api.post("/users/change-password", {
                currentPassword,
                newPassword,
            })
            toast.success("Contraseña actualizada. Se cerraron todas las sesiones.")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")

            // Redirigir al login - limpiar todo el estado de autenticación
            localStorage.removeItem("token")
            localStorage.removeItem("auth-storage")
            window.location.href = "/login"
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al cambiar contraseña")
        } finally {
            setIsSaving(false)
        }
    }

    // Cerrar todas las sesiones
    const handleLogoutAll = async () => {
        try {
            await api.post("/users/logout-all")
            toast.success("Todas las sesiones cerradas")
            localStorage.removeItem("token")
            localStorage.removeItem("auth-storage")
            window.location.href = "/login"
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error")
        }
    }

    // Cerrar sesión específica
    const handleLogoutSession = async (sessionId: number) => {
        try {
            await api.delete(`/users/sessions/${sessionId}`)
            toast.success("Sesión cerrada")
            loadData()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error")
        }
    }

    // Eliminar cuenta
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error("Ingresa tu contraseña para confirmar")
            return
        }

        try {
            setIsSaving(true)
            await api.post("/users/delete-account", { password: deletePassword })
            toast.success("Cuenta eliminada")
            localStorage.removeItem("token")
            localStorage.removeItem("auth-storage")
            window.location.href = "/login"
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al eliminar cuenta")
        } finally {
            setIsSaving(false)
        }
    }

    // ============ 2FA Handlers ============

    // Iniciar configuración de 2FA
    const handleSetup2FA = async () => {
        try {
            setIsSaving(true)
            const response = await api.post("/auth/2fa/setup")
            setTwoFactorSetup({
                qrCode: response.data.qrCode,
                secret: response.data.secret,
            })
            toast.success("Escanea el código QR con tu app de autenticación")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al configurar 2FA")
        } finally {
            setIsSaving(false)
        }
    }

    // Verificar código y activar 2FA
    const handleEnable2FA = async () => {
        if (twoFactorCode.length !== 6) {
            toast.error("El código debe tener 6 dígitos")
            return
        }

        try {
            setIsSaving(true)
            const response = await api.post("/auth/2fa/enable", { code: twoFactorCode })
            setBackupCodes(response.data.backupCodes)
            setShowBackupCodes(true)
            setTwoFactorEnabled(true)
            setTwoFactorSetup(null)
            setTwoFactorCode("")
            toast.success("2FA activado correctamente")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Código inválido")
        } finally {
            setIsSaving(false)
        }
    }

    // Desactivar 2FA
    const handleDisable2FA = async () => {
        if (!disableCode || !disablePassword) {
            toast.error("Ingresa tu código 2FA y contraseña")
            return
        }

        try {
            setIsSaving(true)
            await api.post("/auth/2fa/disable", {
                code: disableCode,
                password: disablePassword,
            })
            setTwoFactorEnabled(false)
            setDisableCode("")
            setDisablePassword("")
            toast.success("2FA desactivado")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al desactivar 2FA")
        } finally {
            setIsSaving(false)
        }
    }

    // Regenerar códigos de respaldo
    const handleRegenerateBackupCodes = async () => {
        if (!twoFactorCode) {
            toast.error("Ingresa tu código 2FA")
            return
        }

        try {
            setIsSaving(true)
            const response = await api.post("/auth/2fa/backup-codes", { code: twoFactorCode })
            setBackupCodes(response.data.backupCodes)
            setShowBackupCodes(true)
            setTwoFactorCode("")
            toast.success("Nuevos códigos de respaldo generados")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Código inválido")
        } finally {
            setIsSaving(false)
        }
    }

    // Copiar códigos de respaldo
    const handleCopyBackupCodes = () => {
        const codesText = backupCodes.join("\n")
        navigator.clipboard.writeText(codesText)
        setCopiedBackup(true)
        setTimeout(() => setCopiedBackup(false), 2000)
        toast.success("Códigos copiados al portapapeles")
    }

    if (isLoading) {
        return (
            <div className="flex gap-6">
                <Skeleton className="w-48 h-96" />
                <Skeleton className="flex-1 h-96" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-7 w-7" />
                    Configuración
                </h1>
            </div>

            <div className="flex gap-6">
                {/* Sidebar */}
                <nav className="w-48 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                                activeSection === item.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Contenido */}
                <div className="flex-1 space-y-6">
                    {/* SECCIÓN: GENERAL */}
                    {activeSection === "general" && (
                        <>
                            {/* Perfil */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Perfil</CardTitle>
                                    <CardDescription>Tu información personal</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nombre</Label>
                                            <Input
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Tu nombre"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Apellido</Label>
                                            <Input
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Tu apellido"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <div className="flex items-center gap-2">
                                            <Input value={profile?.email || ""} disabled className="bg-muted" />
                                            {profile?.isEmailVerified ? (
                                                <Badge variant="outline" className="text-green-500 border-green-500">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Verificado
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Sin verificar
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                        Guardar cambios
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Apariencia - Para todos los usuarios */}
                            <Card>
                                    <CardHeader>
                                        <CardTitle>Apariencia</CardTitle>
                                        <CardDescription>Personaliza la interfaz</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Tema</Label>
                                                <select
                                                    value={selectedTheme}
                                                    onChange={(e) => setSelectedTheme(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-md border bg-background"
                                                >
                                                    <option value="dark">Oscuro</option>
                                                    <option value="light">Claro</option>
                                                    <option value="system">Sistema</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fuente del código</Label>
                                                <select
                                                    value={fontFamily}
                                                    onChange={(e) => setFontFamily(e.target.value as typeof fontFamily)}
                                                    className="w-full px-3 py-2 rounded-md border bg-background"
                                                >
                                                    <option value="mono">Monospace</option>
                                                    <option value="sans">Sans-serif</option>
                                                    <option value="serif">Serif</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tamaño de fuente: {fontSize}px</Label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="24"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>

                                        <Button onClick={handleSavePreferences} disabled={isSaving}>
                                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                            Guardar preferencias
                                        </Button>
                                    </CardContent>
                                </Card>
                        </>
                    )}

                    {/* SECCIÓN: SEGURIDAD (2FA) */}
                    {activeSection === "seguridad" && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Autenticación de dos factores (2FA)
                                    </CardTitle>
                                    <CardDescription>
                                        Añade una capa extra de seguridad a tu cuenta usando una app de autenticación
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Estado actual */}
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                twoFactorEnabled ? "bg-green-500/20" : "bg-muted"
                                            )}>
                                                {twoFactorEnabled ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {twoFactorEnabled ? "2FA Activado" : "2FA Desactivado"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {twoFactorEnabled
                                                        ? "Tu cuenta está protegida con autenticación de dos factores"
                                                        : "Activa 2FA para mayor seguridad"}
                                                </p>
                                            </div>
                                        </div>
                                        {!twoFactorEnabled && !twoFactorSetup && (
                                            <Button onClick={handleSetup2FA} disabled={isSaving}>
                                                {isSaving ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <QrCode className="h-4 w-4 mr-2" />
                                                )}
                                                Configurar 2FA
                                            </Button>
                                        )}
                                    </div>

                                    {/* Configuración de 2FA - Mostrar QR */}
                                    {twoFactorSetup && !twoFactorEnabled && (
                                        <div className="space-y-4 p-4 rounded-lg border bg-card">
                                            <div className="text-center space-y-4">
                                                <h4 className="font-medium">Escanea el código QR</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Usa Google Authenticator, Authy u otra app compatible para escanear este código
                                                </p>

                                                {/* QR Code */}
                                                <div className="flex justify-center">
                                                    <div className="p-4 bg-white rounded-lg">
                                                        <img
                                                            src={twoFactorSetup.qrCode}
                                                            alt="QR Code para 2FA"
                                                            className="w-48 h-48"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Clave manual */}
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        O ingresa esta clave manualmente:
                                                    </p>
                                                    <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                                                        {twoFactorSetup.secret}
                                                    </code>
                                                </div>
                                            </div>

                                            {/* Verificar código */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <Label>Ingresa el código de 6 dígitos de tu app</Label>
                                                <div className="flex gap-3">
                                                    <Input
                                                        type="text"
                                                        maxLength={6}
                                                        value={twoFactorCode}
                                                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                                                        placeholder="000000"
                                                        className="text-center text-lg tracking-widest font-mono"
                                                    />
                                                    <Button
                                                        onClick={handleEnable2FA}
                                                        disabled={isSaving || twoFactorCode.length !== 6}
                                                    >
                                                        {isSaving ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        )}
                                                        Verificar y activar
                                                    </Button>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                className="w-full"
                                                onClick={() => setTwoFactorSetup(null)}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}

                                    {/* 2FA Activado - Opciones */}
                                    {twoFactorEnabled && (
                                        <div className="space-y-4">
                                            {/* Regenerar códigos de respaldo */}
                                            <div className="p-4 rounded-lg border space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Key className="h-4 w-4 text-muted-foreground" />
                                                    <h4 className="font-medium">Códigos de respaldo</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Genera nuevos códigos de respaldo. Los códigos anteriores serán invalidados.
                                                </p>
                                                <div className="flex gap-3">
                                                    <Input
                                                        type="text"
                                                        maxLength={6}
                                                        value={twoFactorCode}
                                                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                                                        placeholder="Código 2FA"
                                                        className="max-w-[150px] text-center font-mono"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleRegenerateBackupCodes}
                                                        disabled={isSaving || !twoFactorCode}
                                                    >
                                                        {isSaving ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Key className="h-4 w-4 mr-2" />
                                                        )}
                                                        Regenerar códigos
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Desactivar 2FA */}
                                            <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    <h4 className="font-medium text-red-500">Desactivar 2FA</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Esto reducirá la seguridad de tu cuenta. Necesitarás tu código 2FA actual y tu contraseña.
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input
                                                        type="text"
                                                        maxLength={6}
                                                        value={disableCode}
                                                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                                                        placeholder="Código 2FA"
                                                        className="text-center font-mono"
                                                    />
                                                    <Input
                                                        type="password"
                                                        value={disablePassword}
                                                        onChange={(e) => setDisablePassword(e.target.value)}
                                                        placeholder="Tu contraseña"
                                                    />
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDisable2FA}
                                                    disabled={isSaving || !disableCode || !disablePassword}
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Shield className="h-4 w-4 mr-2" />
                                                    )}
                                                    Desactivar 2FA
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Diálogo de códigos de respaldo */}
                            <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Key className="h-5 w-5" />
                                            Códigos de respaldo
                                        </DialogTitle>
                                        <DialogDescription>
                                            Guarda estos códigos en un lugar seguro. Puedes usarlos para acceder a tu cuenta si pierdes acceso a tu app de autenticación.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                                            {backupCodes.map((code, index) => (
                                                <div key={index} className="p-2 bg-background rounded text-center">
                                                    {code}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-500">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                            <p className="text-xs">
                                                Cada código solo puede usarse una vez. Guárdalos ahora, no podrás verlos de nuevo.
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex gap-3 sm:gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleCopyBackupCodes}
                                        >
                                            {copiedBackup ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Copiados
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copiar códigos
                                                </>
                                            )}
                                        </Button>
                                        <Button onClick={() => setShowBackupCodes(false)}>
                                            Listo, los guardé
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}

                    {/* SECCIÓN: CUENTA */}
                    {activeSection === "cuenta" && (
                        <>
                            {/* Cambiar contraseña */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cambiar contraseña</CardTitle>
                                    <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Contraseña actual</Label>
                                        <div className="relative">
                                            <Input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nueva contraseña</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Confirmar contraseña</Label>
                                            <Input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleChangePassword} disabled={isSaving || !currentPassword || !newPassword}>
                                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                                        Cambiar contraseña
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Zona de peligro */}
                            <Card className="border-red-500/20">
                                <CardHeader>
                                    <CardTitle className="text-red-500">Zona de peligro</CardTitle>
                                    <CardDescription>Acciones irreversibles</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 space-y-4">
                                        <div>
                                            <h4 className="font-medium text-red-500">Eliminar cuenta</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Confirma tu contraseña</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showDeletePassword ? "text" : "password"}
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="border-red-500/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            onClick={() => setShowDeleteConfirmation(true)}
                                            disabled={isSaving || !deletePassword}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar mi cuenta
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* SECCIÓN: USO */}
                    {activeSection === "uso" && usageStats && (
                        <>
                            {/* ========== STATS PARA DEVELOPER ========== */}
                            {usageStats.type === 'developer' && (
                                <>
                                    {/* Resumen Developer */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tu uso de la plataforma</CardTitle>
                                            <CardDescription>
                                                Miembro desde hace {usageStats.summary.memberSinceDays} días
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold">{usageStats.summary.totalQueries}</p>
                                                    <p className="text-sm text-muted-foreground">Consultas totales</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold">{usageStats.summary.totalCodes}</p>
                                                    <p className="text-sm text-muted-foreground">Códigos generados</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold">{usageStats.summary.totalAnalyses}</p>
                                                    <p className="text-sm text-muted-foreground">Análisis completados</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Límite diario */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Límite diario</CardTitle>
                                            <CardDescription>
                                                {usageStats.daily.remaining} consultas restantes hoy
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{usageStats.daily.used} usadas</span>
                                                <span>{usageStats.daily.limit} límite</span>
                                            </div>
                                            <Progress value={usageStats.daily.percentageUsed} className="h-2" />
                                            <p className="text-xs text-muted-foreground">
                                                El límite se reinicia a medianoche
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Últimos 30 días */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Últimos 30 días</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-2xl font-bold">{usageStats.last30Days.queries}</p>
                                                    <p className="text-sm text-muted-foreground">Consultas</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-2xl font-bold">{usageStats.last30Days.averagePerDay}</p>
                                                    <p className="text-sm text-muted-foreground">Promedio/día</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Modelos más usados */}
                                    {usageStats.modelUsage.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Modelos más usados</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {usageStats.modelUsage.map((model, index) => (
                                                        <div key={model.model} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-muted-foreground">#{index + 1}</span>
                                                                <span className="font-medium">{model.model}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">{model.count} usos</span>
                                                                <Badge variant="outline">{model.percentage}%</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}

                            {/* ========== STATS PARA EVALUATOR ========== */}
                            {usageStats.type === 'evaluator' && (
                                <>
                                    {/* Resumen Evaluador */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tu actividad como evaluador</CardTitle>
                                            <CardDescription>
                                                Miembro desde hace {usageStats.summary.memberSinceDays} días
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold">{usageStats.summary.totalEvaluations}</p>
                                                    <p className="text-sm text-muted-foreground">Evaluaciones realizadas</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-3xl font-bold text-orange-500">{usageStats.summary.pendingCodes}</p>
                                                    <p className="text-sm text-muted-foreground">Códigos pendientes</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Actividad reciente */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Actividad reciente</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-2xl font-bold">{usageStats.today.evaluations}</p>
                                                    <p className="text-sm text-muted-foreground">Hoy</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-2xl font-bold">{usageStats.last30Days.evaluations}</p>
                                                    <p className="text-sm text-muted-foreground">Últimos 30 días</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <p className="text-2xl font-bold">{usageStats.last30Days.averagePerDay}</p>
                                                    <p className="text-sm text-muted-foreground">Promedio/día</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Promedio de scores dados */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tus promedios de evaluación</CardTitle>
                                            <CardDescription>Scores promedio que has dado en tus evaluaciones</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Legibilidad</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={usageStats.averageScores.readability * 20} className="w-32 h-2" />
                                                        <span className="text-sm font-medium w-8">{usageStats.averageScores.readability}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Claridad</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={usageStats.averageScores.clarity * 20} className="w-32 h-2" />
                                                        <span className="text-sm font-medium w-8">{usageStats.averageScores.clarity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Estructura</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={usageStats.averageScores.structure * 20} className="w-32 h-2" />
                                                        <span className="text-sm font-medium w-8">{usageStats.averageScores.structure}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Documentación</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={usageStats.averageScores.documentation * 20} className="w-32 h-2" />
                                                        <span className="text-sm font-medium w-8">{usageStats.averageScores.documentation}</span>
                                                    </div>
                                                </div>
                                                <div className="border-t pt-4 flex items-center justify-between">
                                                    <span className="font-medium">Promedio general</span>
                                                    <Badge variant="outline" className="text-lg px-3 py-1">
                                                        {usageStats.averageScores.overall}/5
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* Actividad por día - Común para ambos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actividad por día de la semana</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-2">
                                        {usageStats.activityByDay.map((day) => (
                                            <div key={day.day} className="text-center">
                                                <div
                                                    className="h-20 rounded bg-primary/20 flex items-end justify-center mb-1"
                                                    style={{
                                                        background: `linear-gradient(to top, hsl(var(--primary)) ${Math.min(day.count * 10, 100)}%, transparent ${Math.min(day.count * 10, 100)}%)`
                                                    }}
                                                >
                                                    <span className="text-xs font-medium pb-1">{day.count}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{day.day.slice(0, 3)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* SECCIÓN: SESIONES */}
                    {activeSection === "sesiones" && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sesiones activas</CardTitle>
                                    <CardDescription>
                                        Dispositivos donde has iniciado sesión
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sessions.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            No hay sesiones activas registradas
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {sessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-background">
                                                            <Smartphone className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {session.deviceInfo || "Dispositivo desconocido"}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Globe className="h-3 w-3" />
                                                                <span>{session.ipAddress || "IP desconocida"}</span>
                                                                <span>•</span>
                                                                <span>
                                                                    Última actividad: {new Date(session.lastActivity).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleLogoutSession(session.id)}
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cerrar todas las sesiones */}
                            <Card className="border-orange-500/20">
                                <CardHeader>
                                    <CardTitle className="text-orange-500">Cerrar todas las sesiones</CardTitle>
                                    <CardDescription>
                                        Se cerrará la sesión en todos los dispositivos, incluyendo este
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="outline"
                                        className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                                        onClick={handleLogoutAll}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Cerrar todas las sesiones
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            {/* Diálogo de confirmación para eliminar cuenta */}
            <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Confirmar eliminación de cuenta
                        </DialogTitle>
                        <DialogDescription className="pt-2 space-y-2">
                            <p>
                                Estás a punto de eliminar tu cuenta permanentemente. Esta acción:
                            </p>
                            {profile?.role === 'USER' ? (
                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                    <li>Eliminará todos tus datos personales</li>
                                    <li>Eliminará todas tus consultas y códigos generados</li>
                                    <li>Eliminará tu historial de análisis</li>
                                    <li><strong className="text-red-500">No se puede deshacer</strong></li>
                                </ul>
                            ) : (
                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                    <li>Eliminará todos tus datos personales</li>
                                    <li>Eliminará todas las evaluaciones que has realizado</li>
                                    <li>Eliminará tu historial de actividad como evaluador</li>
                                    <li><strong className="text-red-500">No se puede deshacer</strong></li>
                                </ul>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-center font-medium">
                            ¿Estás completamente seguro de que deseas eliminar tu cuenta?
                        </p>
                    </div>
                    <DialogFooter className="flex gap-3 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirmation(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowDeleteConfirmation(false)
                                handleDeleteAccount()
                            }}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Sí, eliminar mi cuenta
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
