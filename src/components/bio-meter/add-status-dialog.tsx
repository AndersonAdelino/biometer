"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddStatusDialog({
    onSuccess
}: {
    onSuccess?: () => void
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [decayRate, setDecayRate] = useState(10)
    const [color, setColor] = useState("#22c55e")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast.error("You must be logged in")
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from("stats")
            .insert({
                user_id: user.id,
                name,
                decay_rate: decayRate,
                color,
                last_refill: new Date().toISOString()
            })

        setLoading(false)

        if (error) {
            toast.error("Failed to create tracker")
        } else {
            toast.success("Tracker created!")
            setOpen(false)
            setName("")
            setDecayRate(10)
            if (onSuccess) onSuccess()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Add Stat</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="uppercase tracking-widest">Add Biological Tracker</DialogTitle>
                    <DialogDescription>
                        Defina o nome e a taxa de decaimento por hora para o novo Mirror Biológico.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Asset Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Social Battery, Hydration"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Decay Rate</Label>
                            <span className="text-xs font-mono text-muted-foreground">{decayRate}% / hr</span>
                        </div>
                        <Slider
                            value={[decayRate]}
                            onValueChange={(vals) => setDecayRate(vals[0])}
                            max={100}
                            step={1}
                        />
                        <p className="text-[10px] text-muted-foreground uppercase opacity-70">
                            {Math.round(100 / decayRate)} HORAS ATÉ O ESGOTAMENTO TOTAL
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Color Indicator</Label>
                        <Input
                            id="color"
                            type="color"
                            className="h-10 p-1"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "SYNCING..." : "INITIALIZE TRACKER"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
