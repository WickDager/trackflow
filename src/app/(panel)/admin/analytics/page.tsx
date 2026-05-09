"use client";

import { useMemo } from "react";
import { useShipments } from "@/hooks/useShipments";
import { getStatusColor, getStatusLabel, timeAgo } from "@/lib/utils";
import type { ShipmentStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  CheckCircle2,
  Truck,
  AlertTriangle,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
}

function StatCard({ label, value, subtitle, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-ink-muted">
            {label}
          </CardTitle>
          <Icon className="w-4 h-4 text-ink-muted opacity-60" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-ink-primary tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusBarProps {
  status: ShipmentStatus;
  count: number;
  total: number;
}

function StatusBar({ status, count, total }: StatusBarProps) {
  const colors = getStatusColor(status);
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const label = getStatusLabel(status);

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-ink-secondary">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className={`h-3 rounded-full transition-all ${colors.dot}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-16 text-right text-sm text-ink-secondary">
        {count} ({percentage}%)
      </span>
    </div>
  );
}

interface TopRoute {
  route: string;
  count: number;
}

function TopRoutesTable({ routes }: { routes: TopRoute[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {routes.map((route, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-elevated text-xs text-ink-muted font-medium">
                  {i + 1}
                </span>
                <span className="text-sm text-ink-primary">{route.route}</span>
              </div>
              <span className="text-sm text-ink-secondary">
                {route.count} shipments
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { shipments, loading, error } = useShipments({ status: "all" });

  const stats = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter(
      (s) => s.status === "delivered"
    ).length;
    const inTransit = shipments.filter(
      (s) => s.status === "in_transit"
    ).length;
    const failed = shipments.filter((s) => s.status === "failed").length;
    const pending = shipments.filter((s) => s.status === "pending").length;

    return {
      total,
      delivered,
      inTransit,
      failed,
      pending,
      deliveredPercentage:
        total > 0 ? Math.round((delivered / total) * 100) : 0,
      failedPercentage: total > 0 ? Math.round((failed / total) * 100) : 0,
    };
  }, [shipments]);

  const topRoutes = useMemo(() => {
    const routeMap = new Map<string, number>();
    shipments.forEach((s) => {
      const route = `${s.origin} → ${s.destination}`;
      routeMap.set(route, (routeMap.get(route) ?? 0) + 1);
    });

    return Array.from(routeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));
  }, [shipments]);

  const recentActivity = useMemo(() => {
    return [...shipments]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);
  }, [shipments]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-status-red-bg p-4 text-status-red border border-status-red/10">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Shipments"
          value={stats.total}
          icon={Package}
        />
        <StatCard
          label="Delivered"
          value={`${stats.deliveredPercentage}%`}
          subtitle={`${stats.delivered} of ${stats.total}`}
          icon={CheckCircle2}
        />
        <StatCard
          label="In Transit"
          value={stats.inTransit}
          icon={Truck}
        />
        <StatCard
          label="Failed"
          value={`${stats.failedPercentage}%`}
          subtitle={`${stats.failed} of ${stats.total}`}
          icon={AlertTriangle}
        />
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            ["delivered", "in_transit", "pending", "failed"] as ShipmentStatus[]
          ).map((status) => (
            <StatusBar
              key={status}
              status={status}
              count={
                status === "delivered"
                  ? stats.delivered
                  : status === "in_transit"
                    ? stats.inTransit
                    : status === "pending"
                      ? stats.pending
                      : stats.failed
              }
              total={stats.total}
            />
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((shipment) => {
                const colors = getStatusColor(shipment.status);
                return (
                  <div
                    key={shipment.id}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${colors.dot}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm tracking-wide text-ink-primary">
                          {shipment.tracking_number}
                        </span>
                        <span className={`text-xs ${colors.text}`}>
                          {getStatusLabel(shipment.status)}
                        </span>
                      </div>
                      <p className="text-xs text-ink-secondary">
                        {shipment.origin} → {shipment.destination}
                      </p>
                    </div>
                    <span className="text-xs text-ink-muted">
                      {timeAgo(shipment.created_at)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-sm text-ink-secondary">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Routes */}
      {topRoutes.length > 0 && <TopRoutesTable routes={topRoutes} />}
    </div>
  );
}
