import { Link } from "react-router-dom"

import { adminNav } from "@/app/routes/nav"
import { AppShell } from "@/components/layout/app-shell"
import { SeverityBadge } from "@/components/ui/badge"
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { EmptyState } from "@/components/ui/table"
import { useFacilityOverview, useFacilitySettings } from "@/features/facility/queries"
import { ClimateChart } from "@/features/monitoring/climate-chart"
import { useLiveClimate, useOpenAlerts, useReadingSeries } from "@/features/monitoring/queries"
import { useWithdrawals } from "@/features/withdrawals/queries"
import { kilograms, percent, relativeDateTime, tonnes } from "@/lib/format"

export default function AdminDashboardPage() {
  useLiveClimate()

  const { data: overview } = useFacilityOverview()
  const { data: settings } = useFacilitySettings()
  const { data: readings = [] } = useReadingSeries(24)
  const { data: alerts = [], isLoading: alertsLoading } = useOpenAlerts(5)
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useWithdrawals("pending", 5)

  const capacity = overview?.capacity_kg ?? 0
  const stored = overview?.stored_kg ?? 0

  return (
    <AppShell nav={adminNav} title="Dashboard" subtitle="Storage overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active farmers" value={String(overview?.active_farmers ?? 0)} icon="group" />
        <Stat label="In storage" value={tonnes(stored)} icon="inventory_2" />
        <Stat label="Open alerts" value={String(overview?.open_alerts ?? 0)} icon="warning" />
        <Stat
          label="Pending withdrawals"
          value={String(overview?.pending_withdrawals ?? 0)}
          icon="outbox"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title="Temperature"
              description="Last 24 hours, against the configured band"
              action={
                <Link
                  to="/admin/monitoring"
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View monitoring
                </Link>
              }
            />
            <CardBody>
              {readings.length === 0 ? (
                <EmptyState
                  title="No readings yet"
                  description="Readings appear here once a sensor reports in."
                  icon="sensors_off"
                />
              ) : (
                <ClimateChart
                  readings={readings}
                  metric="temperature"
                  band={
                    settings
                      ? {
                          min: Number(settings.temperature_min_c),
                          max: Number(settings.temperature_max_c),
                        }
                      : undefined
                  }
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Active alerts" description="Anything still open" />
            <CardBody className="p-0">
              {alertsLoading ? (
                <div className="p-4 text-xs text-ink-muted">Loading…</div>
              ) : alerts.length === 0 ? (
                <EmptyState
                  title="All clear"
                  description="Every cold room is inside its band."
                  icon="check_circle"
                />
              ) : (
                <ul>
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0"
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
                          alert.severity === "critical"
                            ? "bg-critical-soft text-critical"
                            : "bg-warn-soft text-warn"
                        }`}
                      >
                        <Icon name="thermostat" className="text-base" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{alert.title}</p>
                        <p className="mono text-2xs text-ink-subtle">
                          {relativeDateTime(alert.raised_at)}
                        </p>
                      </div>
                      <SeverityBadge level={alert.severity} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Chamber capacity" />
            <CardBody className="flex items-center gap-4">
              <CapacityDial used={stored} total={capacity} />
              <dl className="mono text-xs text-ink-muted">
                <div className="flex gap-2">
                  <dt className="w-10">Used</dt>
                  <dd className="font-semibold text-ink">{tonnes(stored)}</dd>
                </div>
                <div className="flex gap-2 pt-1">
                  <dt className="w-10">Free</dt>
                  <dd className="font-semibold text-ink">
                    {tonnes(Math.max(0, capacity - stored))}
                  </dd>
                </div>
                <div className="flex gap-2 pt-1">
                  <dt className="w-10">Total</dt>
                  <dd className="font-semibold text-ink">{tonnes(capacity)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Withdrawal requests"
              action={
                <Link
                  to="/admin/inventory"
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Review
                </Link>
              }
            />
            <CardBody className="p-0">
              {withdrawalsLoading ? (
                <div className="p-4 text-xs text-ink-muted">Loading…</div>
              ) : withdrawals.length === 0 ? (
                <EmptyState title="Nothing waiting" icon="task_alt" />
              ) : (
                <ul>
                  {withdrawals.map((request) => (
                    <li
                      key={request.id}
                      className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm">{request.farmer?.full_name ?? "—"}</p>
                        <p className="mono text-2xs text-ink-subtle">
                          {request.batch?.reference ?? "—"}
                        </p>
                      </div>
                      <span className="mono shrink-0 text-xs font-medium">
                        {kilograms(request.quantity_kg)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

/** A single ring. One brand colour, no gradient, no second accent. */
function CapacityDial({ used, total }: { used: number; total: number }) {
  const fraction = total > 0 ? Math.min(1, used / total) : 0
  const radius = 54
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#EFE4F6" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#6A3A8C"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${fraction * circumference} ${circumference}`}
        />
      </svg>
      <span className="mono absolute inset-0 flex items-center justify-center text-lg font-semibold text-brand-600">
        {percent(fraction * 100)}
      </span>
    </div>
  )
}
