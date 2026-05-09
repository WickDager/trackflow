import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroDashboard from "@/components/landing/HeroDashboard"

export default function Hero() {
  return (
    <section className="pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Beta badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-subtle border border-accent/10 text-accent text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          Now in public beta
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ink-primary leading-[1.05] tracking-tight mb-6">
          Ship smarter.
          <br />
          <span className="text-ink-secondary">Track everything.</span>
        </h1>

        <p className="text-base sm:text-lg text-ink-secondary mb-10 max-w-xl mx-auto leading-relaxed">
          Real-time logistics visibility for B2B teams.
          From warehouse to delivery, in one dashboard.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-14">
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto text-base px-10 h-12">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-10 h-12">
              Learn more
            </Button>
          </Link>
        </div>

        {/* Animated dashboard preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent z-10 pointer-events-none" />
          <HeroDashboard />
        </div>
      </div>
    </section>
  )
}
