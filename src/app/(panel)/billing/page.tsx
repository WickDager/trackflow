"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, AlertTriangle } from "lucide-react";
import type { Organization } from "@/types";
import { getAllPlans } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BillingPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await fetch("/api/organization");
        const result = await res.json();
        if (result.error) {
          setError(result.error);
        } else {
          setOrg(result.data);
        }
      } catch {
        setError("Failed to load subscription info");
      } finally {
        setLoading(false);
      }
    }
    void fetchOrg();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-ink-secondary">Loading...</p>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="rounded-lg bg-status-red-bg p-4 text-status-red border border-status-red/10">
        {error ?? "No organization found. Only organization owners can manage billing."}
      </div>
    );
  }

  const isExpired = org.subscription_status === "expired";
  const plans = getAllPlans();
  const currentPlan = org.plan;

  const statusBadge = () => {
    switch (org.subscription_status) {
      case "active":
        return <Badge className="bg-status-green-bg text-status-green border-status-green/10">Active</Badge>;
      case "past_due":
        return <Badge className="bg-status-amber-bg text-status-amber border-status-amber/10">Past Due</Badge>;
      case "canceled":
        return <Badge className="bg-status-red-bg text-status-red border-status-red/10">Canceled</Badge>;
      case "expired":
        return <Badge className="bg-status-red-bg text-status-red border-status-red/10">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">Billing & Plans</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Manage your subscription and plan.
        </p>
      </div>

      {isExpired && (
        <div className="rounded-lg bg-status-amber-bg border border-status-amber/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-status-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink-primary">Subscription Expired</p>
            <p className="text-sm text-ink-secondary mt-1">
              Your subscription has expired. Choose a plan below to reactivate.
            </p>
          </div>
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-xl border border-bg-border/60 bg-bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-secondary">Current Plan</p>
            <p className="text-lg font-semibold text-ink-primary capitalize">
              {currentPlan}
            </p>
          </div>
          <div className="text-right">
            {statusBadge()}
            {org.subscription_expires_at && (
              <p className="text-xs text-ink-muted mt-1">
                {org.subscription_status === "active" ? "Renews" : "Expires"}:{" "}
                {new Date(org.subscription_expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-secondary">Team members</span>
          <span className="text-ink-primary font-medium">
            {session?.user ? `${org.max_users} allowed` : ""}
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan;
          return (
            <div
              key={plan.name}
              className={`rounded-xl border p-5 sm:p-6 ${
                isCurrent
                  ? "border-accent/40 bg-bg-surface ring-1 ring-accent/20"
                  : "border-bg-border/60 bg-bg-surface"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink-primary">{plan.name}</h3>
                {isCurrent && (
                  <Badge className="bg-accent-subtle text-accent border-accent/10 text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-ink-primary mb-1">
                {plan.price}
              </p>
              <p className="text-xs text-ink-muted mb-4">per month</p>

              <ul className="space-y-2 mb-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Check className="h-4 w-4 text-status-green shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent}
              >
                {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-muted text-center">
        To change your plan, contact support or use the Stripe customer portal.
        Payment integration coming soon.
      </p>
    </div>
  );
}
