"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  isAuthenticated: boolean
}

export default function Navbar({ isAuthenticated }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-surface/85 backdrop-blur-xl border-b border-bg-border/60 shadow-md"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-3 h-3 rounded-full bg-accent group-hover:shadow-[0_0_12px_rgba(232,168,64,0.5)] transition-shadow duration-300" />
            <span className="text-lg font-semibold text-ink-primary tracking-tight">Trackflow</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-ink-secondary hover:text-ink-primary transition-colors duration-200">
              Features
            </a>
            <a href="#pricing" className="text-sm text-ink-secondary hover:text-ink-primary transition-colors duration-200">
              Pricing
            </a>
            <a href="#about" className="text-sm text-ink-secondary hover:text-ink-primary transition-colors duration-200">
              About
            </a>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/app">
                <Button variant="ghost" className="text-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-ink-primary rounded-lg hover:bg-bg-surface transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-bg-border/60 bg-bg-surface/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            <a
              href="#features"
              className="block text-sm text-ink-secondary hover:text-ink-primary transition-colors py-2.5 px-2 rounded-lg hover:bg-bg-elevated"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-sm text-ink-secondary hover:text-ink-primary transition-colors py-2.5 px-2 rounded-lg hover:bg-bg-elevated"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#about"
              className="block text-sm text-ink-secondary hover:text-ink-primary transition-colors py-2.5 px-2 rounded-lg hover:bg-bg-elevated"
              onClick={() => setMobileOpen(false)}
            >
              About
            </a>
            <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-bg-border/60">
              {isAuthenticated ? (
                <Link href="/app" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full text-sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full text-sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full text-sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
