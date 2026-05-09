import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    features: ["Up to 5 users", "100 shipments/mo", "Email support"],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    features: ["Up to 25 users", "Unlimited shipments", "Priority support"],
    cta: "Get started",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Unlimited users", "SLA + dedicated CSM", "On-prem option"],
    cta: "Contact sales",
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-bg-border/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-ink-secondary max-w-lg mx-auto">
            Start free for 14 days. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 sm:p-7 bg-bg-surface border rounded-xl transition-all duration-200 hover:border-bg-border-hover ${
                plan.featured
                  ? "border-accent/40 ring-1 ring-accent/20 shadow-lg shadow-accent/5"
                  : "border-bg-border/60"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-[#1F1810] text-xs font-semibold tracking-wide">
                  Most popular
                </div>
              )}

              <div className="text-sm font-semibold text-ink-secondary mb-2 uppercase tracking-wider">
                {plan.name}
              </div>

              <div className="text-3xl sm:text-4xl font-bold text-ink-primary mb-6 tracking-tight">
                {plan.price}
                {plan.period && (
                  <span className="text-base font-normal text-ink-muted">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-ink-secondary">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/auth/register">
                <Button
                  variant={plan.featured ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
