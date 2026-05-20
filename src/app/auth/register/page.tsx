"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerSchema } from "@/lib/validations"

type RegisterFormValues = z.infer<typeof registerSchema>

function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [inviteValid, setInviteValid] = useState<boolean | null>(null)
  const [inviteChecking, setInviteChecking] = useState(false)

  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    if (!inviteToken) {
      setInviteValid(null)
      return
    }

    setInviteChecking(true)
    fetch(`/api/invites/validate?token=${encodeURIComponent(inviteToken)}`)
      .then((res) => res.json())
      .then((data) => {
        setInviteValid(data.valid)
        if (!data.valid) {
          setError(data.error ?? "Invalid invite link")
        }
      })
      .catch(() => {
        setInviteValid(false)
        setError("Failed to verify invite link")
      })
      .finally(() => setInviteChecking(false))
  }, [inviteToken])

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Registration is not available right now. Please try again later.")
        setIsLoading(false)
        return
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            ...(inviteToken ? { invite_token: inviteToken } : {}),
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      setRegisteredEmail(data.email)
      setSuccess(true)
      setIsLoading(false)
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  // Store email for the success screen
  const [registeredEmail, setRegisteredEmail] = useState("")

  // Resend confirmation email
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    if (!registeredEmail) return
    setResending(true)
    setResent(false)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!supabaseUrl || !supabaseAnonKey) return

      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: registeredEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      })

      if (!resendError) {
        setResent(true)
      }
    } finally {
      setResending(false)
    }
  }

  if (success) {
    const emailDisplay = registeredEmail
      ? `${registeredEmail.substring(0, 3)}***@${registeredEmail.split("@")[1]}`
      : "your inbox"

    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-bg-surface border border-bg-border/60 rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center gap-2.5 mb-8 justify-center">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-lg font-semibold text-ink-primary tracking-tight">Trackflow</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-ink-primary mb-2">Confirm your email</h2>
            <p className="text-sm text-ink-secondary mb-1">
              We sent a confirmation link to
            </p>
            <p className="text-sm font-medium text-ink-primary mb-6">
              {registeredEmail}
            </p>

            <div className="bg-bg-base rounded-xl p-4 mb-6 text-left space-y-3">
              <div className="flex gap-3">
                <span className="text-status-green shrink-0 mt-0.5 text-sm">1.</span>
                <p className="text-sm text-ink-secondary">
                  Open the email we sent to <span className="font-medium text-ink-primary">{emailDisplay}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-status-green shrink-0 mt-0.5 text-sm">2.</span>
                <p className="text-sm text-ink-secondary">
                  Click the <span className="font-medium text-ink-primary">confirm your email</span> button inside
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-status-green shrink-0 mt-0.5 text-sm">3.</span>
                <p className="text-sm text-ink-secondary">
                  Sign in to your account to get started
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 mb-6 text-left flex gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>
                Didn&apos;t see the email? Check your spam folder or try a <button onClick={handleResend} disabled={resending} className="underline font-medium hover:text-amber-800 disabled:opacity-50 disabled:no-underline cursor-pointer">resend</button>.
                {resent && <span className="block mt-1 text-amber-800 font-medium">Confirmation email resent!</span>}
              </span>
            </div>

            {inviteToken && (
              <p className="text-xs text-ink-muted mb-4">
                After confirming, you&apos;ll be added to the organization.
              </p>
            )}

            <Link href="/auth/login">
              <Button className="w-full" variant="outline">Go to sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (inviteChecking) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <p className="text-ink-secondary">Verifying invite link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-bg-surface border border-bg-border/60 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-lg font-semibold text-ink-primary tracking-tight">Trackflow</span>
          </div>

          <h2 className="text-xl font-semibold text-ink-primary mb-1 text-center">
            {inviteToken && inviteValid ? "Accept invitation" : "Create account"}
          </h2>
          <p className="text-sm text-ink-secondary mb-6 text-center">
            {inviteToken && inviteValid
              ? "You've been invited to join an organization"
              : "Start your 14-day free trial"}
          </p>

          {error && (
            <div className="p-3 bg-status-red-bg border border-status-red/20 rounded-lg text-xs text-status-red mb-4">
              {error}
            </div>
          )}

          {inviteToken && !inviteValid && !error && (
            <div className="p-3 bg-status-red-bg border border-status-red/20 rounded-lg text-xs text-status-red mb-4">
              This invite link is invalid or has expired. Please ask your admin for a new link.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                {...register("name")}
                className={errors.name ? "border-status-red focus-visible:border-status-red focus-visible:ring-status-red/30" : ""}
              />
              {errors.name && (
                <p className="text-xs text-status-red mt-1.5">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                {...register("email")}
                className={errors.email ? "border-status-red focus-visible:border-status-red focus-visible:ring-status-red/30" : ""}
              />
              {errors.email && (
                <p className="text-xs text-status-red mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  {...register("password")}
                  className={errors.password ? "border-status-red focus-visible:border-status-red focus-visible:ring-status-red/30 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-status-red mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-status-red focus-visible:border-status-red focus-visible:ring-status-red/30 pr-10" : "pr-10"}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-status-red mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (!!inviteToken && inviteValid === false)}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:text-accent-dim transition-colors duration-200 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            <p className="text-ink-secondary">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
