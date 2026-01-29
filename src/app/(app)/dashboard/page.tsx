"use client"

import { useState, useEffect } from "react"
import { StatusCard } from "@/components/bio-meter/status-card"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { logout } from "@/app/login/actions"
import { toast } from "sonner"
import { AddStatusDialog } from "@/components/bio-meter/add-status-dialog"

// Stat type from DB
type Stat = {
    id: string
    name: string
    decay_rate: number
    last_refill: string // ISO date
    color?: string
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stat[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setLoading(false)
                    window.location.href = "/login"
                    return
                }

                const { data, error } = await supabase
                    .from("stats")
                    .select("*")
                    .order("created_at", { ascending: true })

                if (error) {
                    toast.error("Failed to load stats")
                } else {
                    setStats(data || [])
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err)
                toast.error("An unexpected error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchStats()

        // Subscribe to Realtime updates
        const channel = supabase
            .channel("stats_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "stats" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        setStats(prev => [...prev, payload.new as Stat])
                    } else if (payload.eventType === "UPDATE") {
                        setStats(prev => prev.map(s => s.id === payload.new.id ? payload.new as Stat : s))
                    } else if (payload.eventType === "DELETE") {
                        setStats(prev => prev.filter(s => s.id === payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const handleRefill = async (id: string) => {
        const now = new Date().toISOString()

        // Optimistic update
        setStats(prev => prev.map(stat => {
            if (stat.id === id) {
                return { ...stat, last_refill: now }
            }
            return stat
        }))

        const { error } = await supabase
            .from("stats")
            .update({ last_refill: now })
            .eq("id", id)

        if (error) {
            toast.error("Failed to sync refill")
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-muted-foreground font-mono">SYNCHRONIZING BIO-DATA...</div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase tracking-widest">BioMeter</h1>
                    <p className="text-muted-foreground text-xs uppercase opacity-70">Biological Asset Monitoring System</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                        <LogOut className="h-5 w-5" />
                    </Button>
                    <AddStatusDialog />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => (
                    <StatusCard
                        key={stat.id}
                        id={stat.id}
                        name={stat.name}
                        decayRate={stat.decay_rate}
                        lastRefill={stat.last_refill}
                        color={stat.color}
                        onRefill={handleRefill}
                    />
                ))}

                {stats.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed rounded-xl border-muted-foreground/20">
                        <p className="text-muted-foreground italic">No biological assets tracked yet.</p>
                        <Button variant="link" className="mt-2">Initialize First Tracker</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
