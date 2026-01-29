"use client"

import { useState, useEffect } from "react"
import { differenceInMilliseconds } from "date-fns"

/**
 * Calculates the current value (0-100) based on decay mechanics.
 * 
 * Formula: Value = 100 - (HoursPassed * DecayRatePerHour)
 * 
 * @param lastRefill The timestamp when the stats were last at 100%
 * @param decayRatePerHour How much percentage is lost per hour (e.g., 10 = 10% per hour)
 * @returns {number} Current value between 0 and 100
 */
export function useDecay(lastRefill: Date | string, decayRatePerHour: number): number {
    const [value, setValue] = useState(100)

    useEffect(() => {
        // Ensure lastRefill is a Date object
        const refillDate = new Date(lastRefill)

        const calculate = () => {
            const now = new Date()
            // Calculate difference in hours (floating point)
            const diffInHours = differenceInMilliseconds(now, refillDate) / (1000 * 60 * 60)

            const lostValue = diffInHours * decayRatePerHour
            const currentValue = Math.max(0, Math.min(100, 100 - lostValue))

            return currentValue
        }

        // Initial calculation
        setValue(calculate())

        // Animation loop
        let animationFrameId: number

        const tick = () => {
            setValue(calculate())
            // Throttle? requestAnimationFrame runs 60fps, might be overkill for values changing slowly
            // But it guarantees smooth pixel movement if we map percentage to pixels.
            // For performance, we could debounce or assume input changes infrequently.
            // Given spec asks for "Real-time", RAF is appropriate.
            animationFrameId = requestAnimationFrame(tick)
        }

        animationFrameId = requestAnimationFrame(tick)

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId)
        }
    }, [lastRefill, decayRatePerHour])

    return value
}
