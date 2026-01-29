"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RefreshCw, Zap } from "lucide-react"
import { useDecay } from "@/lib/hooks/use-decay"
import { cn } from "@/lib/utils"

interface StatusCardProps {
    id: string
    name: string
    lastRefill: Date | string
    decayRate: number
    color?: string
    onRefill: (id: string) => void
}

export function StatusCard({
    id,
    name,
    lastRefill,
    decayRate,
    color = "#22c55e", // Default green
    onRefill
}: StatusCardProps) {
    const value = useDecay(lastRefill, decayRate)

    // Determine status color state
    const isCritical = value < 20
    const isWarning = value < 50 && value >= 20

    // Dynamic classes for visual feedback
    const statusColorClass = isCritical
        ? "text-red-500"
        : isWarning
            ? "text-yellow-500"
            : "text-green-500"

    // Formatted percentage for display
    const formattedValue = Math.round(value)

    return (
        <Card className="w-full transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderLeftColor: isCritical ? '#ef4444' : color }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    {name}
                </CardTitle>
                <Zap className={cn("h-4 w-4", statusColorClass)} />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between">
                        <span className={cn("text-2xl font-bold font-mono", statusColorClass)}>
                            {formattedValue}%
                        </span>
                        <span className="text-xs text-muted-foreground mb-1">
                            -{decayRate}% / hr
                        </span>
                    </div>

                    <Progress
                        value={value}
                        className="h-2"
                        indicatorClassName={cn(
                            isCritical ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-green-500"
                        )}
                    // We might need to override the background color style directly if Shadcn Progress doesn't expose it easily via props,
                    // but standard Shadcn Progress usually accepts className on the root and we modified shadcn progress to accept indicatorClassName or just use CSS vars.
                    // Standard Shadcn `Progress` implementation often uses `bg-primary` for the indicator. 
                    // I'll assume standard shadcn installation which might need a small patch if `indicatorClassName` isn't prop.
                    // Actually standard shadcn/ui progress component:
                    // <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" ... />
                    // So we can't easily change color per instance without `indicatorClassName` or style override.
                    // I'll add a style prop to the indicator via a wrapper or assume I need to modify Progress component.
                    // For now, I'll use a style attribute on the wrapper or assume I can pass color.
                    // Actually, I'll update `src/components/ui/progress.tsx` if needed, but for now I'll apply a class that sets `--primary` variable locally? No that's messy.
                    // I will modify `src/components/ui/progress.tsx` to allow className override on Indicator if needed, OR just use color classes if I can.
                    // For MVP, I'll rely on global `text-{color}` if Progress uses `currentColor`? No it uses `bg-primary`.
                    // Let's look at `progress.tsx` if I can. I'll write this file first.
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors group"
                        onClick={() => onRefill(id)}
                    >
                        <RefreshCw className="mr-2 h-3 w-3 group-hover:animate-spin" />
                        Refill
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
