export const RATE_PER_TONNE_MONTH = 15000;

export const durationOptions = [1, 2, 3, 6, 12].map((m) => ({
  value: m,
  label: `${m} month${m > 1 ? "s" : ""}`,
}));

export const paymentMethods = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "ussd", label: "USSD" },
];

export type PaymentRecord = {
  id: string;
  tonnes: number;
  months: number;
  date: string;
  amount: number;
};

export const PAGE_SIZE = 2;

export const paymentHistory: PaymentRecord[] = Array.from({ length: 24 }, (_, i) => ({
  id: i % 2 === 0 ? `ST-${String(412 - i).padStart(4, "0")}` : `BK-${String(21 - i).padStart(3, "0")}`,
  tonnes: i % 2 === 0 ? 4 : 2,
  months: 2,
  date: "Oct 1",
  amount: 120000,
}));

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export const formatTonnes = (t: number) => `${Number.isInteger(t) ? t.toFixed(1) : t}t`;

export const endDate = (months: number, from = new Date()) => {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
