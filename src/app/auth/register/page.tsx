"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerSchema } from "@/lib/validations"

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

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
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-bg-surface border border-bg-border/60 rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center gap-2.5 mb-8 justify-center">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-lg font-semibold text-ink-primary tracking-tight">Trackflow</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-status-green-bg border border-status-green/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-status-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-ink-primary mb-2">Account created</h2>
            <p className="text-sm text-ink-secondary mb-6">
              Check your email for a confirmation link to complete your registration.
            </p>
            <Link href="/auth/login">
              <Button className="w-full">Sign in</Button>
            </Link>
          </div>
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

          <h2 className="text-xl font-semibold text-ink-primary mb-1 text-center">Create account</h2>
          <p className="text-sm text-ink-secondary mb-6 text-center">Start your 14-day free trial</p>

          {error && (
            <div className="p-3 bg-status-red-bg border border-status-red/20 rounded-lg text-xs text-status-red mb-4">
              {error}
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

            <Button type="submit" className="w-full" disabled={isLoading}>
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
