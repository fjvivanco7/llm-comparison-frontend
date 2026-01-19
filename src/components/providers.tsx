"use client"

import { ThemeProvider } from "next-themes"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { usePreferencesStore } from "@/store/preferences-store"
import api from "@/lib/axios"

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    const { token } = useAuthStore()
    const { loadFromServer } = usePreferencesStore()

    // Cargar preferencias del servidor cuando hay token
    useEffect(() => {
        if (token) {
            api.get("/users/preferences")
                .then((res) => {
                    loadFromServer(res.data)
                })
                .catch(() => {
                    // Si falla, usar valores por defecto (ya están en el store)
                })
        }
    }, [token, loadFromServer])

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    )
}
