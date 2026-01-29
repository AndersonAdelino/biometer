import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        BioMeter
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-[600px]">
        Track your biological needs with real-time decay mechanics.
        Think of it as a character status screen for your life.
      </p>

      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full px-8">
            Enter Dashboard
          </Button>
        </Link>
        <Link href="#">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            Learn More
          </Button>
        </Link>
      </div>
    </div>
  )
}
