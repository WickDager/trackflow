import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Pricing from "@/components/landing/Pricing"

function About() {
  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight mb-4">About Trackflow</h2>
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed mb-12 max-w-2xl mx-auto">
          Trackflow was built for logistics teams who need real visibility into their shipments.
          We combine carrier integrations, real-time tracking, and team management into one
          dashboard — so you can focus on delivering, not chasing updates.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-accent tracking-tight">50+</div>
            <div className="text-xs sm:text-sm text-ink-muted mt-2">Carrier integrations</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-accent tracking-tight">10K+</div>
            <div className="text-xs sm:text-sm text-ink-muted mt-2">Shipments tracked</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-accent tracking-tight">99.9%</div>
            <div className="text-xs sm:text-sm text-ink-muted mt-2">Uptime SLA</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-accent tracking-tight">24/7</div>
            <div className="text-xs sm:text-sm text-ink-muted mt-2">Support coverage</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <Pricing />
      <About />
    </main>
  )
}
