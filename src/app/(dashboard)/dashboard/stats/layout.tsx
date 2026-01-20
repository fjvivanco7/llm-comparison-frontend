"use client"

import { RoleGuard } from "@/components/auth/role-guard"

export default function StatsLayout({
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
