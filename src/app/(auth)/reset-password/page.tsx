import { Suspense } from "react"
import ResetPasswordClient from "@/app/(auth)/reset-password/reset-password-cliente";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
            <ResetPasswordClient />
        </Suspense>
    )
}
