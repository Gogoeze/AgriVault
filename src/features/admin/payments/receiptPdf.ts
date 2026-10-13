import { jsPDF } from "jspdf"
import type { Receipt } from "@/features/admin/payments/components/ReceiptModal"

// jsPDF's built-in fonts have no ₦ glyph, so use "NGN" in the PDF
const ngn = (n: number) => `NGN ${n.toLocaleString("en-NG")}`

export function downloadReceiptPdf(r: Receipt) {
  const doc = new jsPDF({ unit: "pt", format: "a5" })
  const L = 40
  const R = 380
  let y = 50

  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(120)
    doc.text(label, L, y)
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(10).setTextColor(20)
    doc.text(value, R, y, { align: "right" })
    y += 22
  }

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(20).text("Receipt", L, y)
  y += 16
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(120)
  doc.text("Official payment record for this storage transaction", L, y)
  y += 36

  row("Receipt no.", r.receiptNo)
  row("Transaction ID", r.transactionId)
  row("Date & time", r.dateTime)
  row("Payment method", r.paymentMethod)
  row("Paid by", r.paidBy)
  row("Phone", r.phone)
  row("Batch", r.batch)
  row("Storage", r.storage)

  y += 6
  doc.setDrawColor(220).line(L, y, R, y)
  y += 24

  row(r.feeLabel.replace("₦", "NGN "), ngn(r.amountPaid))
  row("Total paid", ngn(r.amountPaid), true)
  row("Balance after payment", ngn(r.balanceAfter))

  y += 10
  doc.setFontSize(8).setTextColor(120).text(`Recorded by ${r.recordedBy}`, L, y)

  doc.save(`${r.receiptNo}.pdf`)
}