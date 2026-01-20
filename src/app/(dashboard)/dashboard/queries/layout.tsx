"use client"

import { RoleGuard } from "@/components/auth/role-guard"

export default function QueriesLayout({
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
