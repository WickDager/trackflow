"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema } from "@/lib/validations"

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/app"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password.")
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError("Something went wrong. Please try again.")
        setIsLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-bg-surface border border-bg-border/60 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-lg font-semibold text-ink-primary tracking-tight">Trackflow</span>
          </div>

          <h2 className="text-xl font-semibold text-ink-primary mb-1">Welcome back</h2>
          <p className="text-sm text-ink-secondary mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-status-red focus-visible:border-status-red focus-visible:ring-status-red/30" : ""}
              />
              {errors.email && (
                <p className="text-xs text-status-red mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                className={errors.password ? "border-status-red focus-visible:border-status-red focus-visible:ring-status-red/30" : ""}
              />
              {errors.password && (
                <p className="text-xs text-status-red mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-status-red-bg border border-status-red/20 rounded-lg text-xs text-status-red">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            No account?{" "}
            <Link href="/auth/register" className="text-accent hover:text-accent-dim transition-colors duration-200 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="text-ink-muted">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
