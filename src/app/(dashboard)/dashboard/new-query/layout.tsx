"use client"

import { RoleGuard } from "@/components/auth/role-guard"

export default function NewQueryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleGuard allowedRoles={['USER']}>
            {children}
        </RoleGuard>
    )
}
