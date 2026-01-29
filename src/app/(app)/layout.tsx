export const dynamic = "force-dynamic"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* 
        This layout wraps all pages under (app).
        We can add a SidebarProvider here if using Shadcn Sidebar later.
        For now, it just ensures the background color is correct.
      */}
            {children}
        </div>
    )
}
