import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '@/lib/axios'
import { toast } from 'sonner'

export type UserRole = 'USER' | 'EVALUATOR' | 'ADMIN'

interface User {
    id: number
    email: string
    firstName?: string
    lastName?: string
    role: UserRole  // ← AGREGAR
    isEmailVerified: boolean
}

interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean

    // 2FA state
    requiresTwoFactor: boolean
    tempToken: string | null

    // Actions
    setUser: (user: User, token: string) => void
    logout: () => void
    register: (data: RegisterData) => Promise<void>
    login: (data: LoginData) => Promise<{ requiresTwoFactor: boolean }>
    verify2FA: (code: string) => Promise<void>
    cancel2FA: () => void
    checkAuth: () => Promise<void>
}

interface RegisterData {
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: "USER" | "EVALUATOR"  // ← AGREGAR ESTA LÍNEA
}

interface LoginData {
    email: string
    password: string
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            requiresTwoFactor: false,
            tempToken: null,

            setUser: (user, token) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token)
                }
                set({ user, token })
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token')
                    localStorage.removeItem('auth-storage') // Clear zustand persisted state
                }
                set({ user: null, token: null })
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
            },

            register: async (data) => {
                try {
                    set({ isLoading: true })
                    const response = await api.post('/auth/register', data)

                    const { user } = response.data

                    // NO guardar token - el usuario debe verificar su email
                    set({ user: null, token: null, isLoading: false })

                    toast.success('¡Cuenta creada exitosamente!', {
                        description: `Enviamos un email a ${user.email}. Verifica tu cuenta para continuar.`,
                        duration: 6000,
                    })

                    // Redirigir al login después de mostrar el mensaje
                    setTimeout(() => {
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login'
                        }
                    }, 2000)


                } catch (error: any) {
                    set({ isLoading: false })
                    const message = error.response?.data?.message || 'Error al crear la cuenta'
                    toast.error('Error', { description: message })
                    throw error
                }
            },

            login: async (data) => {
                try {
                    set({ isLoading: true })
                    const response = await api.post('/auth/login', data)

                    // Check if 2FA is required
                    if (response.data.requiresTwoFactor) {
                        set({
                            isLoading: false,
                            requiresTwoFactor: true,
                            tempToken: response.data.tempToken,
                        })
                        toast.info('Verificación de dos factores', {
                            description: 'Ingresa el código de tu app de autenticación',
                        })
                        return { requiresTwoFactor: true }
                    }

                    const { accessToken, user } = response.data

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', accessToken)
                    }
                    set({ user, token: accessToken, isLoading: false })

                    toast.success('¡Bienvenido de vuelta!', {
                        description: `Hola ${user.firstName || user.email}`,
                    })

                    // Esperar un momento antes de redirigir
                    setTimeout(() => {
                        if (typeof window !== 'undefined') {
                            window.location.href = '/dashboard'
                        }
                    }, 500)

                    return { requiresTwoFactor: false }
                } catch (error: any) {
                    set({ isLoading: false })
                    const message = error.response?.data?.message || 'Credenciales inválidas'
                    toast.error('Error', { description: message })
                    throw error
                }
            },

            verify2FA: async (code) => {
                const { tempToken } = get()
                if (!tempToken) {
                    toast.error('Error', { description: 'Token temporal no encontrado' })
                    return
                }

                try {
                    set({ isLoading: true })
                    const response = await api.post('/auth/2fa/verify', {
                        tempToken,
                        code,
                    })

                    const { accessToken, user } = response.data

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', accessToken)
                    }
                    set({
                        user,
                        token: accessToken,
                        isLoading: false,
                        requiresTwoFactor: false,
                        tempToken: null,
                    })

                    toast.success('¡Bienvenido de vuelta!', {
                        description: `Hola ${user.firstName || user.email}`,
                    })

                    setTimeout(() => {
                        if (typeof window !== 'undefined') {
                            window.location.href = '/dashboard'
                        }
                    }, 500)
                } catch (error: any) {
                    set({ isLoading: false })
                    const message = error.response?.data?.message || 'Código 2FA inválido'
                    toast.error('Error', { description: message })
                    throw error
                }
            },

            cancel2FA: () => {
                set({ requiresTwoFactor: false, tempToken: null })
            },

            checkAuth: async () => {
                if (typeof window === 'undefined') return

                const token = localStorage.getItem('token')
                if (!token) {
                    set({ user: null, token: null })
                    return
                }

                try {
                    const response = await api.get('/auth/profile')
                    set({ user: response.data, token })
                } catch (error) {
                    // Clear all auth data when token is invalid
                    localStorage.removeItem('token')
                    localStorage.removeItem('auth-storage')
                    set({ user: null, token: null })
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            }),
        }
    )
)