import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface PreferencesState {
    // Configuración de código
    codeFontSize: number
    codeFontFamily: 'mono' | 'sans' | 'serif'

    // Acciones
    setCodeFontSize: (size: number) => void
    setCodeFontFamily: (family: 'mono' | 'sans' | 'serif') => void
    loadFromServer: (prefs: { promptFontSize?: number; promptFontFamily?: string }) => void
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            codeFontSize: 14,
            codeFontFamily: 'mono',

            setCodeFontSize: (size) => set({ codeFontSize: size }),
            setCodeFontFamily: (family) => set({ codeFontFamily: family }),

            loadFromServer: (prefs) => {
                set({
                    codeFontSize: prefs.promptFontSize || 14,
                    codeFontFamily: (prefs.promptFontFamily as 'mono' | 'sans' | 'serif') || 'mono',
                })
            },
        }),
        {
            name: 'preferences-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

// Helper para obtener la clase de fuente
export const getFontFamilyClass = (family: 'mono' | 'sans' | 'serif') => {
    switch (family) {
        case 'mono':
            return 'font-mono'
        case 'sans':
            return 'font-sans'
        case 'serif':
            return 'font-serif'
        default:
            return 'font-mono'
    }
}
