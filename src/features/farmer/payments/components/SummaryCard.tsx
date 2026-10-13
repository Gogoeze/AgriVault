import {
  RATE_PER_TONNE_MONTH,
  endDate,
  formatNaira,
  formatTonnes,
} from "@/features/farmer/payments/data";

type Props = {
  tonnes: number;
  months: number;
  total: number;
  disabled?: boolean;
  onPay: () => void;
};

export function SummaryCard({ tonnes, months, total, disabled, onPay }: Props) {
  const rows = [
    { label: "Quantity", value: formatTonnes(tonnes) },
    { label: "Duration", value: `${months} month${months > 1 ? "s" : ""}` },
    { label: "Rate", value: `${formatNaira(RATE_PER_TONNE_MONTH)}/ t /month` },
    { label: "Ends (if received today)", value: endDate(months) },
  ];

  return (
    <section className="h-full rounded-lg bg-white p-3">
      <h3 className="border-b border-gray-200 pb-1 text-sm font-semibold">Summary</h3>

      <dl className="mt-1">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between border-b border-gray-100 py-2 text-xs"
          >
            <dt className="text-gray-400">{r.label}</dt>
            <dd className="text-sm font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between py-4">
        <span className="text-sm">Total</span>
        <span className="text-xl font-bold text-brand-purple-50">{formatNaira(total)}</span>
      </div>

      <button
        type="button"
        onClick={onPay}
        disabled={disabled}
        className="w-full rounded-full bg-brand-purple-40 py-3 text-sm font-semibold text-white hover:bg-brand-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Pay &amp; book storage
      </button>

      <p className="mt-2 text-[10px] text-gray-400">
        Your receipt and QR code are generated after payment. The storage period starts when your
        produce is received.
      </p>
    </section>
  );
}