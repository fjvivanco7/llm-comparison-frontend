import VerifyEmailClient from "@/app/(auth)/verify-email/verify-email-client";
import {Suspense} from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <VerifyEmailClient />
        </Suspense>
    )
}