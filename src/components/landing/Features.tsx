import { Package, Users, Plug } from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Real-time tracking",
    description: "Live updates on every shipment across all carriers. Know where everything is, right now.",
  },
  {
    icon: Users,
    title: "Team management",
    description: "Roles, permissions, and activity logs built for logistics teams of any size.",
  },
  {
    icon: Plug,
    title: "CRM integrations",
    description: "Bitrix24 & amoCRM integration out of the box plus 1C for enterprise customers. — coming soon. ",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-bg-border/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight mb-3">
            Everything you need
          </h2>
          <p className="text-base text-ink-secondary max-w-lg mx-auto">
            Purpose-built for logistics teams who need visibility, not guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 sm:p-7 bg-bg-surface border border-bg-border/60 rounded-xl transition-all duration-200 hover:border-bg-border-hover hover:bg-bg-elevated/50"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-accent-subtle border border-accent/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-ink-primary mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
