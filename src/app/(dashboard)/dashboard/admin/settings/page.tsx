"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import api from "@/lib/axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

interface AppSettings {
    [key: string]: {
        value: string
        description: string | null
    }
}

export default function AdminSettingsPage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const [settings, setSettings] = useState<AppSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [dailyQueryLimit, setDailyQueryLimit] = useState("10")
    const [maxModelsPerQuery, setMaxModelsPerQuery] = useState("5")
    const [maintenanceMode, setMaintenanceMode] = useState(false)

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/dashboard')
            return
        }
        loadSettings()
    }, [user, router])

    const loadSettings = async () => {
        try {
            const response = await api.get("/admin/settings")
            setSettings(response.data)

            // Set form values
            setDailyQueryLimit(response.data.dailyQueryLimit?.value || "10")
            setMaxModelsPerQuery(response.data.maxModelsPerQuery?.value || "5")
            setMaintenanceMode(response.data.maintenanceMode?.value === "true")
        } catch (error) {
            console.error("Error loading settings:", error)
            toast.error("Error al cargar configuraciones")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            await api.put("/admin/settings", {
                settings: {
                    dailyQueryLimit,
                    maxModelsPerQuery,
                    maintenanceMode: maintenanceMode.toString(),
                },
            })
            toast.success("Configuraciones guardadas")
            loadSettings()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al guardar")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="h-7 w-7" />
                        Configuración del Sistema
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Ajusta los parámetros globales de la aplicación
                    </p>
                </div>
            </div>

            {/* Limits Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Límites de Uso</CardTitle>
                    <CardDescription>
                        Configura los límites de uso para los usuarios
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="dailyLimit">Consultas diarias por usuario</Label>
                            <Input
                                id="dailyLimit"
                                type="number"
                                min="1"
                                max="100"
                                value={dailyQueryLimit}
                                onChange={(e) => setDailyQueryLimit(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Máximo de consultas que un usuario puede hacer por día
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxModels">Modelos por consulta</Label>
                            <Input
                                id="maxModels"
                                type="number"
                                min="1"
                                max="10"
                                value={maxModelsPerQuery}
                                onChange={(e) => setMaxModelsPerQuery(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Máximo de modelos LLM que se pueden seleccionar por consulta
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card className={maintenanceMode ? "border-orange-500/50" : ""}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {maintenanceMode && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                        Modo Mantenimiento
                    </CardTitle>
                    <CardDescription>
                        Activa el modo mantenimiento para bloquear el acceso de usuarios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">
                                {maintenanceMode ? "Mantenimiento activo" : "Sistema operativo"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {maintenanceMode
                                    ? "Los usuarios no pueden acceder a la plataforma"
                                    : "La plataforma está funcionando con normalidad"}
                            </p>
                        </div>
                        <Switch
                            checked={maintenanceMode}
                            onCheckedChange={setMaintenanceMode}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Current Settings Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumen de Configuraciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        {settings && Object.entries(settings).map(([key, setting]) => (
                            <div key={key} className="flex justify-between py-2 border-b last:border-0">
                                <span className="text-muted-foreground">{key}</span>
                                <span className="font-mono">{setting.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Configuraciones
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
