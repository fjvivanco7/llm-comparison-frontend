import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '@/lib/axios'
import { toast } from 'sonner'

interface User {
    id: number
    email: string
    firstName?: string
    lastName?: string
    isEmailVerified: boolean
}

interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean

    // Actions
    setUser: (user: User, token: string) => void
    logout: () => void
    register: (data: RegisterData) => Promise<void>
    login: (data: LoginData) => Promise<void>
    checkAuth: () => Promise<void>
}

interface RegisterData {
    email: string
    password: string
    firstName?: string
    lastName?: string
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

            setUser: (user, token) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token)
                }
                set({ user, token })
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token')
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
                } catch (error: any) {
                    set({ isLoading: false })
                    const message = error.response?.data?.message || 'Credenciales inválidas'
                    toast.error('Error', { description: message })
                    throw error
                }
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
                    localStorage.removeItem('token')
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