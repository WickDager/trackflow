"use client"

import { useEffect, useState, useRef } from "react"
import { Package, Truck, CheckCircle2, LayoutDashboard, BarChart3, Menu } from "lucide-react"

function useCountUp(end: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let frame: number
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * end))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [end, duration, start])

  return value
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
  delay,
  visible,
}: {
  label: string
  value: number
  note: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  delay: number
  visible: boolean
}) {
  const count = useCountUp(value, 1800, visible)

  return (
    <div
      className="bg-bg-elevated border border-bg-border/60 rounded-lg p-3 sm:p-4 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] sm:text-xs text-ink-muted">{label}</span>
        <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${accent} opacity-60`} />
      </div>
      <div className="text-lg sm:text-xl font-bold text-ink-primary tracking-tight">{count}</div>
      <p className="text-[10px] sm:text-xs text-ink-muted mt-0.5">{note}</p>
    </div>
  )
}

const shipments = [
  { id: "SADC-001", origin: "Johannesburg, ZA", dest: "Lusaka, ZM", status: "in_transit" as const },
  { id: "SADC-002", origin: "Durban, ZA", dest: "Harare, ZW", status: "delivered" as const },
  { id: "SADC-003", origin: "Maputo, MZ", dest: "Beira, MZ", status: "pending" as const },
]

const statusConfig: Record<string, { label: string; classes: string; dot: string }> = {
  in_transit: {
    label: "In transit",
    classes: "bg-status-blue-bg text-status-blue border border-status-blue/10",
    dot: "bg-status-blue",
  },
  delivered: {
    label: "Delivered",
    classes: "bg-status-green-bg text-status-green border border-status-green/10",
    dot: "bg-status-green",
  },
  pending: {
    label: "Pending",
    classes: "bg-status-amber-bg text-status-amber border border-status-amber/10",
    dot: "bg-status-amber",
  },
}

export default function HeroDashboard() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="p-4 sm:p-6 bg-bg-surface border border-bg-border/60 rounded-2xl shadow-lg select-none overflow-hidden"
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Mini sidebar */}
        <div className="hidden sm:flex flex-col w-10 lg:w-12 flex-shrink-0 bg-bg-base/60 backdrop-blur-sm border border-bg-border/60 rounded-xl py-3 px-1 items-center gap-2.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(232,168,64,0.4)] flex-shrink-0 mb-1" />
          <div className="w-4 h-4 rounded-md bg-accent-subtle flex items-center justify-center">
            <LayoutDashboard className="w-2.5 h-2.5 text-accent" />
          </div>
          <div className="w-4 h-4 rounded-md flex items-center justify-center opacity-40">
            <Package className="w-2.5 h-2.5 text-ink-muted" />
          </div>
          <div className="w-4 h-4 rounded-md flex items-center justify-center opacity-40">
            <BarChart3 className="w-2.5 h-2.5 text-ink-muted" />
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="flex sm:hidden items-center gap-2 w-full bg-bg-base/60 backdrop-blur-sm border border-bg-border/60 rounded-lg px-3 py-1.5 mb-3">
          <Menu className="w-3 h-3 text-ink-muted" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(232,168,64,0.4)]" />
          <span className="text-[10px] font-semibold text-ink-primary">Trackflow</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div
            className="mb-3 sm:mb-4 transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transitionDelay: "100ms",
            }}
          >
            <h3 className="text-xs sm:text-sm font-bold text-ink-primary">Dashboard</h3>
            <p className="text-[10px] sm:text-xs text-ink-muted mt-0.5">Overview of your shipments</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <StatCard
              label="Total shipments"
              value={142}
              note="+12 this week"
              icon={Package}
              accent="text-ink-primary"
              delay={250}
              visible={visible}
            />
            <StatCard
              label="In transit"
              value={38}
              note="+3 today"
              icon={Truck}
              accent="text-status-blue"
              delay={400}
              visible={visible}
            />
            <StatCard
              label="Delivered"
              value={97}
              note="+8 this week"
              icon={CheckCircle2}
              accent="text-status-green"
              delay={550}
              visible={visible}
            />
          </div>

          {/* Mini table */}
          <div
            className="bg-bg-elevated border border-bg-border/60 rounded-lg overflow-hidden transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transitionDelay: "600ms",
            }}
          >
            <div className="px-3 py-2 border-b border-bg-border/40 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-ink-primary">Recent Shipments</span>
              <span className="text-[9px] sm:text-[10px] text-ink-muted">3 of 142</span>
            </div>
            <table className="w-full text-[10px] sm:text-xs">
              <thead>
                <tr className="border-b border-bg-border/40">
                  <th className="w-[25%] text-left py-1.5 pl-2 sm:pl-3 pr-1 text-ink-muted font-medium uppercase tracking-wider text-[8px] sm:text-[10px]">
                    Tracking #
                  </th>
                  <th className="w-[25%] text-left py-1.5 px-1 text-ink-muted font-medium uppercase tracking-wider text-[8px] sm:text-[10px]">
                    Origin
                  </th>
                  <th className="w-[25%] text-left py-1.5 px-1 text-ink-muted font-medium uppercase tracking-wider text-[8px] sm:text-[10px]">
                    Destination
                  </th>
                  <th className="w-[25%] text-left py-1.5 pl-1 pr-2 sm:pr-3 text-ink-muted font-medium uppercase tracking-wider text-[8px] sm:text-[10px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, i) => {
                  const status = statusConfig[s.status]
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-bg-border/30 last:border-0 transition-all duration-500"
                      style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateX(0)" : "translateX(-8px)",
                        transitionDelay: `${800 + i * 120}ms`,
                      }}
                    >
                      <td className="w-[25%] py-1.5 pl-2 sm:pl-3 pr-1 text-ink-primary font-mono text-[9px] sm:text-[10px] tracking-wide truncate">
                        {s.id}
                      </td>
                      <td className="w-[25%] py-1.5 px-1 text-ink-secondary text-[9px] sm:text-[10px] truncate">{s.origin}</td>
                      <td className="w-[25%] py-1.5 px-1 text-ink-secondary text-[9px] sm:text-[10px] truncate">{s.dest}</td>
                      <td className="w-[25%] py-1.5 pl-1 pr-2 sm:pr-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] sm:text-[10px] font-medium whitespace-nowrap ${status.classes}`}
                        >
                          <span
                            className={`inline-block w-1 h-1 rounded-full flex-shrink-0 ${status.dot} ${
                              s.status === "in_transit" ? "animate-pulse" : ""
                            }`}
                          />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
