import Navbar from "@/components/landing/Navbar"
import { auth } from "@/auth"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar isAuthenticated={!!session} />
      {children}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-bg-border/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm font-medium text-ink-muted">Trackflow</span>
          </div>
          <div className="flex gap-8 text-sm text-ink-muted">
            <a href="#" className="hover:text-ink-secondary transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-ink-secondary transition-colors duration-200">Terms</a>
          </div>
          <p className="text-sm text-ink-muted">© 2026 Trackflow</p>
        </div>
      </footer>
    </div>
  )
}
