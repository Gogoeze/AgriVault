import { adminNav } from "@/features/admin/nav"
import { useMemo, useState } from "react";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { Icon } from "@/shared/components/ui/Icon";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ReceiptModal, type Receipt } from "@/features/admin/payments/components/ReceiptModal";

type PaymentStatus = "paid" | "part-paid" | "due";
type Method = "cash" | "transfer" | "pos";

type Payment = {
  id: string;
  receipt: string;
  farmer: string;
  storageId: string;
  tonnes: number;
  months: number;
  amount: number;
  paid: number;
  method: Method | null;
  date: string; // ISO
  actions: string;
};

const PAYMENTS: Payment[] = [
  { id: "1", receipt: "RC-0101", farmer: "Amina Bello", storageId: "ST-0412", tonnes: 3.9, months: 2, amount: 78000, paid: 78000, method: "transfer", date: "2026-10-05", actions: "" },
  { id: "2", receipt: "RC-0102", farmer: "Kelechi Samuel", storageId: "ST-0398", tonnes: 1.6, months: 1, amount: 16000, paid: 6000, method: "cash", date: "2026-10-02", actions: "" },
  { id: "3", receipt: "RC-0103", farmer: "Damilare Peter", storageId: "ST-0456", tonnes: 2.1, months: 3, amount: 63000, paid: 0, method: null, date: "2026-09-28", actions: "" },
  { id: "4", receipt: "RC-0104", farmer: "Mubarak Yusuf", storageId: "ST-0377", tonnes: 3.2, months: 1, amount: 32000, paid: 32000, method: "pos", date: "2026-09-13", actions: "" },
  { id: "5", receipt: "RC-0105", farmer: "Jane Doe", storageId: "ST-0315", tonnes: 5.6, months: 2, amount: 112000, paid: 112000, method: "transfer", date: "2026-08-22", actions: "" },
  { id: "6", receipt: "RC-0106", farmer: "John Smith", storageId: "ST-0316", tonnes: 5.2, months: 1, amount: 52000, paid: 20000, method: "cash", date: "2026-08-12", actions: "" },
];

const COLUMNS = ["Receipt", "Farmer", "Storage ID", "Basis (t × months)", "Amount", "Paid", "Balance", "Date", "Status", "Actions"];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "part-paid", label: "Part-paid" },
  { value: "due", label: "Due" },
];

const RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "month", label: "This month" },
  { value: "30", label: "Last 30 days" },
];

const METHOD_LABEL: Record<Method, string> = { cash: "Cash", transfer: "Transfer", pos: "POS" };

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const statusOf = (p: Payment): PaymentStatus =>
  p.paid >= p.amount ? "paid" : p.paid > 0 ? "part-paid" : "due";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

function inRange(iso: string, range: string) {
  if (range === "all") return true;
  const d = new Date(iso);
  const now = new Date();
  if (range === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const days = Number(range);
  return now.getTime() - d.getTime() <= days * 86_400_000;
}

const BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-accent-success/15 text-accent-success rounded-full py-1 px-4" },
  "part-paid": { label: "Part-paid", cls: "bg-Warning/15 text-Warning rounded-full py-1 px-4" },
  due: { label: "Due", cls: "bg-accent-critical/10 text-accent-critical rounded-full py-1 px-4" },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const { label, cls } = BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      <span className="size-1 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl bg-white p-4">
      <span className="text-sm text-brand-purple-30">{label}</span>
      <span className="text-2xl font-semibold text-brand-purple-50">{value}</span>
    </div>
  );
}

function downloadCsv(rows: Payment[]) {
  const header = ["Receipt", "Farmer", "Storage ID", "Tonnes", "Months", "Amount", "Paid", "Balance", "Method", "Date", "Status"];
  const lines = rows.map((p) =>
    [
      p.receipt, p.farmer, p.storageId, p.tonnes, p.months, p.amount, p.paid,
      p.amount - p.paid, p.method ?? "", p.date, statusOf(p),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function toReceipt(p: Payment): Receipt {
  const rate = Math.round(p.amount / (p.tonnes * p.months));
  return {
    receiptNo: p.receipt,
    transactionId: "—", // not in Payment yet
    dateTime: fmtDate(p.date),
    paymentMethod: p.method ? METHOD_LABEL[p.method] : "—",
    paidBy: p.farmer,
    phone: "—", // not in Payment yet
    batch: p.storageId,
    storage: "—", // not in Payment yet
    feeLabel: `Storage fee · ${p.tonnes.toFixed(1)}t x ${p.months}mo x ${naira(rate)}`,
    amountPaid: p.paid,
    balanceAfter: p.amount - p.paid,
    recordedBy: "—", // not in Payment yet
  };
}

export default function PaymentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const [page, setPage] = useState(1);

  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PAYMENTS.filter(
      (p) =>
        (!q ||
          p.farmer.toLowerCase().includes(q) ||
          p.receipt.toLowerCase().includes(q) ||
          p.storageId.toLowerCase().includes(q)) &&
        (status === "all" || statusOf(p) === status) &&
        inRange(p.date, range)
    );
  }, [query, status, range]);

  // Replace with server aggregates once paginated
  const stats = useMemo(() => {
    const now = new Date();
    return {
      collected: PAYMENTS.reduce((s, p) => s + p.paid, 0),
      outstanding: PAYMENTS.reduce((s, p) => s + (p.amount - p.paid), 0),
      month: PAYMENTS.filter((p) => inRange(p.date, "month")).reduce((s, p) => s + p.paid, 0),
      monthLabel: now.toLocaleDateString("en-NG", { month: "long" }),
    };
  }, []);

  const total = 24; // replace with server total
  const pageSize = 6;
  const pages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const selectCls =
    "rounded-lg border border-brand-purple-30 bg-white px-3 py-1.5 text-sm text-brand-purple-50 outline-none focus:border-brand-purple-40";

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex flex-col gap-6">
        <Header title="Payments" subtitle="Storage fees and receipts" />
        <div className="flex gap-[var(--content-gap)]">
          <Sidebar items={adminNav} />
          <main className="flex flex-1 flex-col gap-4">
            <div className="flex gap-4">
              <StatCard label="Total collected" value={naira(stats.collected)} />
              <StatCard label="Outstanding" value={naira(stats.outstanding)} />
              <StatCard label={`This month (${stats.monthLabel})`} value={naira(stats.month)} />
            </div>

            <div className="flex flex-col gap-4 rounded-xl bg-white p-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="relative w-64">
                    <Icon
                      name="search"
                      className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-secondary-grey"
                    />
                    <input
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                      placeholder="Search farmer, receipt, storage ID..."
                      className="w-full rounded-md border border-secondary-grey/60 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-purple-40"
                    />
                  </label>
                  <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectCls}>
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={range} onChange={(e) => { setRange(e.target.value); setPage(1); }} className={selectCls}>
                    {RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => downloadCsv(filtered)}
                  className="flex items-center gap-1 rounded-lg bg-brand-purple-40 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-purple-50"
                >
                  <Icon name="download" className="text-[20px]" />
                  Export CSV
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-sm">
                  <thead>
                    <tr className="bg-brand-purple-10">
                      {COLUMNS.map((c, i) => (
                        <th
                          key={c || i}
                          className="whitespace-nowrap border-r border-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-brand-purple-50 last:border-r-0"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const s = statusOf(p);
                      return (
                        <tr key={p.id} className="border-b border-secondary-grey/30 last:border-b-0">
                          <td className="px-4 py-4">{p.receipt}</td>
                          <td className="px-4 py-4">{p.farmer}</td>
                          <td className="px-4 py-4">{p.storageId}</td>
                          <td className="whitespace-nowrap px-4 py-4">{p.tonnes.toFixed(1)} t × {p.months} mo</td>
                          <td className="px-4 py-4">{naira(p.amount)}</td>
                          <td className="px-4 py-4">{naira(p.paid)}</td>
                          <td className="px-4 py-4">{naira(p.amount - p.paid)}</td>
                          <td className="whitespace-nowrap px-4 py-4">{fmtDate(p.date)}</td>
                          <td className="px-8 py-4"><StatusBadge status={s} /></td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => (s === "paid" ? setReceipt(toReceipt(p)) : console.log("record payment", p.receipt))}
                              className="whitespace-nowrap rounded-md border border-brand-purple-40 px-3 py-1 text-xs text-brand-purple-50 hover:bg-brand-purple-10"
                            >
                              {s === "paid" ? "View receipt" : "Record payment"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={COLUMNS.length} className="px-4 py-10 text-secondary-grey">
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination page={page} pages={pages} start={start} end={end} total={total} noun="payments" onChange={setPage} />
            </div>
            <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
          </main>
        </div>
      </div>
    </div>
  );
}