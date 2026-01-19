"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Users, Search, ChevronLeft, ChevronRight, Shield,
    Edit, Trash2, Eye, Loader2, CheckCircle2, XCircle,
    Smartphone, ArrowLeft
} from "lucide-react"
import api from "@/lib/axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

interface User {
    id: number
    email: string
    firstName: string | null
    lastName: string | null
    role: string
    isEmailVerified: boolean
    twoFactorEnabled: boolean
    createdAt: string
    lastLoginAt: string | null
    queriesCount: number
    evaluationsCount: number
}

interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { user: currentUser } = useAuthStore()
    const [users, setUsers] = useState<User[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("")

    // Edit modal
    const [editUser, setEditUser] = useState<User | null>(null)
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        role: "",
        isEmailVerified: false,
    })
    const [isSaving, setIsSaving] = useState(false)

    // Delete modal
    const [deleteUser, setDeleteUser] = useState<User | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (currentUser && currentUser.role !== 'ADMIN') {
            router.push('/dashboard')
            return
        }
        loadUsers()
    }, [currentPage, roleFilter, currentUser, router])

    const loadUsers = async () => {
        try {
            setIsLoading(true)
            let url = `/admin/users?page=${currentPage}&limit=10`
            if (search) url += `&search=${encodeURIComponent(search)}`
            if (roleFilter) url += `&role=${roleFilter}`

            const response = await api.get(url)
            setUsers(response.data.data)
            setMeta(response.data.meta)
        } catch (error) {
            console.error("Error loading users:", error)
            toast.error("Error al cargar usuarios")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        loadUsers()
    }

    const handleEdit = (user: User) => {
        setEditUser(user)
        setEditForm({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        })
    }

    const handleSaveEdit = async () => {
        if (!editUser) return

        try {
            setIsSaving(true)
            await api.put(`/admin/users/${editUser.id}`, editForm)
            toast.success("Usuario actualizado")
            setEditUser(null)
            loadUsers()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al actualizar")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteUser) return

        try {
            setIsDeleting(true)
            await api.delete(`/admin/users/${deleteUser.id}`)
            toast.success("Usuario eliminado")
            setDeleteUser(null)
            loadUsers()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al eliminar")
        } finally {
            setIsDeleting(false)
        }
    }

    const getRoleBadge = (role: string) => {
        const config: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
            ADMIN: { variant: "default", label: "Admin" },
            EVALUATOR: { variant: "secondary", label: "Evaluador" },
            USER: { variant: "outline", label: "Usuario" },
        }
        const c = config[role] || config.USER
        return <Badge variant={c.variant}>{c.label}</Badge>
    }

    if (isLoading && users.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-7 w-7" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {meta?.total || 0} usuarios registrados
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por email o nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="px-3 py-2 rounded-md border bg-background"
                        >
                            <option value="">Todos los roles</option>
                            <option value="USER">Usuarios</option>
                            <option value="EVALUATOR">Evaluadores</option>
                            <option value="ADMIN">Administradores</option>
                        </select>
                        <Button type="submit">Buscar</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">Usuario</th>
                                    <th className="text-left p-4 font-medium">Rol</th>
                                    <th className="text-left p-4 font-medium">Estado</th>
                                    <th className="text-left p-4 font-medium">Actividad</th>
                                    <th className="text-left p-4 font-medium">Registro</th>
                                    <th className="text-right p-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-muted/30">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">
                                                    {user.firstName && user.lastName
                                                        ? `${user.firstName} ${user.lastName}`
                                                        : user.email}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">{getRoleBadge(user.role)}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {user.isEmailVerified ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                {user.twoFactorEnabled && (
                                                    <Smartphone className="h-4 w-4 text-blue-500" title="2FA activo" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <p>{user.queriesCount} consultas</p>
                                                <p className="text-muted-foreground">
                                                    {user.evaluationsCount} evaluaciones
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <p>{format(new Date(user.createdAt), "PP", { locale: es })}</p>
                                                {user.lastLoginAt && (
                                                    <p className="text-muted-foreground">
                                                        Último: {format(new Date(user.lastLoginAt), "PP", { locale: es })}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteUser(user)}
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={!meta.hasPrevPage || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <span className="text-sm px-2">
                            {meta.page} de {meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={!meta.hasNextPage || isLoading}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Modificar información de {editUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellido</Label>
                                <Input
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border bg-background"
                            >
                                <option value="USER">Usuario</option>
                                <option value="EVALUATOR">Evaluador</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="emailVerified"
                                checked={editForm.isEmailVerified}
                                onChange={(e) => setEditForm({ ...editForm, isEmailVerified: e.target.checked })}
                            />
                            <Label htmlFor="emailVerified">Email verificado</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditUser(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Eliminar Usuario</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar a {deleteUser?.email}?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
