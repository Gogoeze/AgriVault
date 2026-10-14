import { dateTime } from "@/lib/format"
import type { PaymentDetailRow } from "@/types/database"

/** jsPDF's built-in fonts have no ₦ glyph, so the PDF says NGN. */
const ngn = (kobo: number) => `NGN ${Math.round(kobo / 100).toLocaleString("en-NG")}`

const METHOD: Record<string, string> = {
  cash: "Cash",
  transfer: "Bank transfer",
  pos: "POS",
  card: "Card",
  ussd: "USSD",
}

/**
 * jsPDF and its canvas dependencies weigh more than the rest of the page put
 * together, so they are fetched only when someone actually asks for a receipt.
 */
export async function downloadReceipt(payment: PaymentDetailRow) {
  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF({ unit: "pt", format: "a5" })
  const left = 40
  const right = 380
  let y = 56

  const row = (label: string, value: string, strong = false) => {
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(113, 113, 125)
    doc.text(label, left, y)
    doc
      .setFont("helvetica", strong ? "bold" : "normal")
      .setFontSize(10)
      .setTextColor(24, 24, 28)
    doc.text(value, right, y, { align: "right" })
    y += 22
  }

  const rule = () => {
    doc.setDrawColor(232, 232, 236).line(left, y, right, y)
    y += 20
  }

  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(106, 58, 140)
  doc.text("AgriVault", left, y)
  y += 20

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(24, 24, 28)
  doc.text("Receipt", left, y)
  y += 16

  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(113, 113, 125)
  doc.text("Official record of this storage payment", left, y)
  y += 32

  row("Receipt no.", payment.receipt_no)
  row("Date", payment.paid_at ? dateTime(payment.paid_at) : "Not yet paid")
  row("Method", payment.method ? (METHOD[payment.method] ?? payment.method) : "—")
  row("Paid by", payment.farmer_name)
  row("Phone", payment.farmer_phone ?? "—")
  row("Batch", payment.batch_reference ?? "—")
  if (payment.transaction_ref) row("Transaction ref.", payment.transaction_ref)

  rule()

  row(
    `Storage · ${payment.tonnes.toFixed(1)}t x ${payment.months} mo x ${ngn(payment.rate_kobo)}`,
    ngn(payment.amount_kobo),
  )
  row("Amount paid", ngn(payment.paid_kobo), true)
  row("Balance", ngn(payment.balance_kobo))

  y += 8
  doc.setFontSize(8).setTextColor(161, 161, 172)
  doc.text(`Recorded by ${payment.recorded_by_name ?? "—"}`, left, y)

  doc.save(`${payment.receipt_no}.pdf`)
}
