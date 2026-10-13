import { Icon } from "@/shared/components/ui/Icon";
import warning from "@/shared/assets/icons/warning.svg";

export type Withdrawal = { id: string; farmer: string; code: string; kg: number };

export function WithdrawalRequests({ items }: { items: Withdrawal[] }) {
  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-sm text-brand-purple-50 border-b border-brand-purple-30 pb-3">Withdrawal requests</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((w) => (
          <li key={w.id} className="flex items-center gap-3 border-b border-brand-purple-30 pb-3 last:border-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-purple-50 text-white">
              <Icon name="inventory_2" className="text-[20px]" />
            </div>
            <div className="flex-1">
              <p className="text-sm">
                {w.farmer} <span className="text-secondary-grey">•</span>{" "}
                <span className="font-mono">{w.code}</span>
              </p>
              <p className="font-mono text-xs text-secondary-grey">{w.kg}kg</p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-Warning/26 px-3 py-1 text-sm text-brand-amber-30">
              <img src={warning} alt="" className="size-3.5" />
              Pending
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}