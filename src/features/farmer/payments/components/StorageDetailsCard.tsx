import { durationOptions, paymentMethods } from "@/features/farmer/payments/data";

type Props = {
  quantityKg: string;
  months: number;
  method: string;
  onQuantityChange: (v: string) => void;
  onMonthsChange: (v: number) => void;
  onMethodChange: (v: string) => void;
};

const fieldClass =
  "w-full rounded-lg border border-brand-purple-40 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple-40/30";

export function StorageDetailsCard({
  quantityKg,
  months,
  method,
  onQuantityChange,
  onMonthsChange,
  onMethodChange,
}: Props) {
  return (
    <section className="flex h-full flex-col rounded-lg bg-white p-3 pb-4">
      <h3 className="border-b border-gray-200 pb-1 text-sm font-semibold">Storage details</h3>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Quantity (kg)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={quantityKg}
            onChange={(e) => onQuantityChange(e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Storage duration</span>
          <select
            value={months}
            onChange={(e) => onMonthsChange(Number(e.target.value))}
            className={fieldClass}
          >
            {durationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Payment method</span>
          <select
            value={method}
            onChange={(e) => onMethodChange(e.target.value)}
            className={fieldClass}
          >
            {paymentMethods.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}