import { StatusBadge } from "@/shared/components/StatusBadge";
import type { StorageBatch } from "@/features/farmer/dashboard/data";

type Props = { batch: StorageBatch; onViewQr: () => void; onWithdraw: () => void };

export function StorageBatchCard({ batch, onViewQr, onWithdraw }: Props) {
  const daysLeft = batch.totalDays - batch.dayNumber;
  const progress = Math.min(100, Math.round((batch.dayNumber / batch.totalDays) * 100));

  return (
    <section className="rounded-lg bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {batch.id}
            <span className="text-brand-purple-40"> • </span>
            {batch.product}
          </h2>
          <p className="text-sm text-secondary-grey">
            {batch.tonnes} t • {batch.location}
          </p>
        </div>
        <StatusBadge status="active" />
      </div>

      <div className="mt-4 grid grid-cols-3 text-sm text-brand-purple-30">
        <div>
          <p>Dropped off</p>
          <p>{batch.droppedOff}</p>
        </div>
        <div className="text-center">
          <p>Today</p>
          <p>
            Day {batch.dayNumber} of {batch.totalDays}
          </p>
        </div>
        <div className="text-right">
          <p>Storage ends</p>
          <p>{batch.endsOn}</p>
        </div>
      </div>

      <div className="mt-2 h-2 rounded-full bg-secondary-grey/20">
        <div className="h-full rounded-full bg-brand-amber-10" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg text-brand-amber-30">
          {daysLeft} day{daysLeft === 1 ? "" : "s"} left
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onViewQr}
            className="rounded-lg border border-brand-purple-30 px-5 py-2 text-sm text-brand-purple-40 hover:bg-brand-purple-10"
          >
            View QR tag
          </button>
          <button
            type="button"
            onClick={onWithdraw}
            className="rounded-lg bg-brand-purple-40 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-purple-50"
          >
            Record withdrawal
          </button>
        </div>
      </div>
    </section>
  );
}