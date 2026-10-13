import { PAGE_SIZE, formatNaira, formatTonnes, type PaymentRecord } from "@/features/farmer/payments/data";

type Props = {
  records: PaymentRecord[];
  page: number;
  onPageChange: (p: number) => void;
  onViewReceipt: (record: PaymentRecord) => void;
};

const pillBtn =
  "rounded border border-gray-300 px-2 py-1 text-[10px] text-brand-purple-40 disabled:cursor-not-allowed disabled:text-gray-300";

export function PaymentHistory({ records, page, onPageChange, onViewReceipt }: Props) {
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = records.slice(start, start + PAGE_SIZE);
  const pages = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  return (
    <section className="rounded-lg bg-white p-3">
      <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold">Payment history</h3>

      <ul>
        {visible.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between border-b border-gray-100 py-2"
          >
            <div>
              <p className="text-xs font-medium">
                {r.id} <span aria-hidden>&bull;</span> {formatTonnes(r.tonnes)} x {r.months}mo
              </p>
              <p className="text-xs text-gray-300">
                {r.date} &middot; {formatNaira(r.amount)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onViewReceipt(r)}
              className="rounded-md border border-brand-purple-40 px-2 py-1 text-[10px] font-medium hover:bg-brand-purple-40/10"
            >
              View receipt
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between pt-3">
        <p className="text-[10px] text-gray-400">
          Showing {records.length === 0 ? 0 : start + 1}-{start + visible.length} of{" "}
          {records.length} history log
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={pillBtn}
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            &lsaquo; Previous
          </button>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "rounded bg-brand-purple-40 px-2 py-1 text-[10px] text-white"
                  : pillBtn
              }
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className={pillBtn}
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next &rsaquo;
          </button>
        </div>
      </div>
    </section>
  );
}