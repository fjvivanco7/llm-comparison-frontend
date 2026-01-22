import { Sidebar } from "@/components/dashboard/sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { NotificationsProvider } from "@/components/notifications"

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <NotificationsProvider>
                <div className="flex h-screen overflow-hidden bg-background">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                        <div className="container mx-auto px-8 py-8">
                            {children}
                        </div>
                    </main>
                </div>
            </NotificationsProvider>
        </AuthGuard>
    )
}