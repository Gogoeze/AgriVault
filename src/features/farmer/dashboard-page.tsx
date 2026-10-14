import { useState } from "react"

import { farmerNav } from "@/app/routes/nav"
import { AppShell } from "@/components/layout/app-shell"
import { BatchBadge, WithdrawalBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/card"
import { Field, Input, Select } from "@/components/ui/field"
import { Modal } from "@/components/ui/modal"
import { EmptyState } from "@/components/ui/table"
import { useAuth } from "@/features/auth/auth-context"
import { useMyBatches } from "@/features/inventory/queries"
import { QrTagModal } from "@/features/inventory/qr-tag-modal"
import { useMyWithdrawals, useRequestWithdrawal } from "@/features/withdrawals/queries"
import { cn } from "@/lib/cn"
import { date, dateShort, kilograms, tonnes } from "@/lib/format"
import { toMessage } from "@/lib/supabase"
import type { BatchDetailRow } from "@/types/database"

export default function FarmerDashboardPage() {
  const { profile } = useAuth()

  const { data: batches = [], isLoading } = useMyBatches()
  const { data: withdrawals = [] } = useMyWithdrawals()

  const [tagged, setTagged] = useState<BatchDetailRow | null>(null)
  const [withdrawing, setWithdrawing] = useState<BatchDetailRow | null>(null)

  const storedKg = batches.reduce((sum, batch) => sum + Number(batch.available_kg), 0)
  const soonest = batches.reduce<BatchDetailRow | null>(
    (earliest, batch) =>
      !earliest || new Date(batch.expires_at) < new Date(earliest.expires_at) ? batch : earliest,
    null,
  )

  const firstName = profile?.full_name.split(/\s+/)[0] ?? "there"

  return (
    <AppShell
      nav={farmerNav}
      title={`Hello, ${firstName}`}
      subtitle="Your stored produce at a glance"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Batches in storage" value={String(batches.length)} icon="inventory_2" />
        <Stat label="Total stored" value={tonnes(storedKg)} icon="scale" />
        <Stat
          label="Next storage ends"
          value={
            soonest
              ? soonest.days_remaining <= 0
                ? "Overdue"
                : `${soonest.days_remaining} days`
              : "—"
          }
          hint={soonest ? dateShort(soonest.expires_at) : undefined}
          icon="schedule"
        />
      </div>

      <Card>
        <CardHeader title="Your storage" description="Everything currently with the facility" />
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-4 text-xs text-ink-muted">Loading…</div>
          ) : batches.length === 0 ? (
            <EmptyState
              title="Nothing in storage"
              description="Batches appear here once the facility takes in your produce."
              icon="inventory"
            />
          ) : (
            <ul>
              {batches.map((batch) => (
                <li key={batch.id} className="border-b border-line p-4 last:border-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="mono text-sm font-semibold">{batch.reference}</span>
                        <BatchBadge status={batch.status} />
                      </div>
                      <p className="pt-1 text-xs text-ink-muted">
                        {batch.produce_name ?? "Produce"} · {batch.unit_code} · in{" "}
                        {dateShort(batch.stored_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon="qr_code_2"
                        onClick={() => setTagged(batch)}
                      >
                        Tag
                      </Button>
                      <Button
                        size="sm"
                        icon="outbox"
                        disabled={Number(batch.available_kg) <= 0}
                        onClick={() => setWithdrawing(batch)}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4">
                    <Metric label="Available" value={kilograms(batch.available_kg)} />
                    <Metric label="Taken in" value={kilograms(batch.intake_kg)} />
                    <Metric
                      label="Ends"
                      value={date(batch.expires_at)}
                      tone={batch.days_remaining <= 3 ? "critical" : undefined}
                    />
                    <Metric
                      label="Days left"
                      value={batch.days_remaining <= 0 ? "Overdue" : String(batch.days_remaining)}
                      tone={batch.days_remaining <= 3 ? "critical" : undefined}
                    />
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        batch.days_remaining <= 3 ? "bg-critical" : "bg-brand-600",
                      )}
                      style={{
                        width: `${Math.min(100, Math.max(0, (Number(batch.available_kg) / Number(batch.intake_kg)) * 100))}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Withdrawal requests" description="What you have asked to collect" />
        <CardBody className="p-0">
          {withdrawals.length === 0 ? (
            <EmptyState title="No requests yet" icon="outbox" />
          ) : (
            <ul>
              {withdrawals.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="mono text-sm">{request.reference}</p>
                    <p className="mono text-2xs text-ink-subtle">
                      {request.batch?.reference ?? "—"} · {kilograms(request.quantity_kg)}
                    </p>
                  </div>
                  <WithdrawalBadge status={request.status} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <QrTagModal batch={tagged} onClose={() => setTagged(null)} />
      <WithdrawalModal
        batch={withdrawing}
        farmerId={profile?.id ?? ""}
        onClose={() => setWithdrawing(null)}
      />
    </AppShell>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "critical" }) {
  return (
    <div>
      <p className="text-2xs text-ink-muted">{label}</p>
      <p className={cn("mono pt-1 text-sm font-medium", tone === "critical" && "text-critical")}>
        {value}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function WithdrawalModal({
  batch,
  farmerId,
  onClose,
}: {
  batch: BatchDetailRow | null
  farmerId: string
  onClose: () => void
}) {
  const request = useRequestWithdrawal()

  const [collection, setCollection] = useState<"partial" | "full">("partial")
  const [quantity, setQuantity] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!batch) return null

  const available = Number(batch.available_kg)
  const kg = collection === "full" ? available : Number(quantity)
  const valid = kg > 0 && kg <= available

  async function handleSubmit() {
    if (!batch || !valid) {
      setError(`Enter a quantity between 1 and ${Math.floor(available)} kg.`)
      return
    }

    setError(null)
    try {
      await request.mutateAsync({ batchId: batch.id, farmerId, quantityKg: kg })
      setQuantity("")
      setCollection("partial")
      onClose()
    } catch (cause) {
      setError(toMessage(cause))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Request withdrawal · ${batch.reference}`}
      description={`${kilograms(available)} available`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={request.isPending} onClick={() => void handleSubmit()}>
            Submit request
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Collection">
          {(props) => (
            <Select
              {...props}
              value={collection}
              onChange={(event) => {
                setCollection(event.target.value as "partial" | "full")
                setError(null)
              }}
              options={[
                { value: "partial", label: "Part of this batch" },
                { value: "full", label: "Everything available" },
              ]}
            />
          )}
        </Field>

        <Field
          label="Quantity"
          hint="The facility reviews your request before collection."
          error={error ?? undefined}
        >
          {(props) => (
            <Input
              {...props}
              type="number"
              min={1}
              max={available}
              numeric
              suffix="kg"
              disabled={collection === "full"}
              value={collection === "full" ? String(Math.floor(available)) : quantity}
              onChange={(event) => {
                setQuantity(event.target.value)
                setError(null)
              }}
            />
          )}
        </Field>
      </div>
    </Modal>
  )
}
