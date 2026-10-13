import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { downloadReceiptPdf } from "@/features/admin/payments/receiptPdf"


export type Receipt = {
  receiptNo: string
  transactionId: string
  dateTime: string
  paymentMethod: string
  paidBy: string
  phone: string
  batch: string
  storage: string
  feeLabel: string // e.g. "Storage fee · 4.0t x 2mo x ₦15,000"
  amountPaid: number
  balanceAfter: number
  recordedBy: string
}

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`

function Field({ label, value, mono, right }: { label: string; value: string; mono?: boolean; right?: boolean }) {
  return (
    <div className={right ? "text-right" : ""}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}

export function ReceiptModal({ receipt, onClose }: { receipt: Receipt | null; onClose: () => void }) {
  return (
    <Dialog open={!!receipt} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-4 p-6">
        {receipt && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Receipt</DialogTitle>
              <DialogDescription className="text-xs">
                Official payment record for this storage transaction
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md bg-[#F6F0E8] p-6 text-center">
              <p className="text-xs text-neutral-500">Amount paid</p>
              <p className="font-mono text-2xl font-semibold text-brand-purple-30">{naira(receipt.amountPaid)}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Receipt no." value={receipt.receiptNo} mono />
              <Field label="Transaction ID" value={receipt.transactionId} mono right />
              <Field label="Date & time" value={receipt.dateTime} />
              <Field label="Payment method" value={receipt.paymentMethod} right />
              <Field label="Paid by" value={receipt.paidBy} />
              <Field label="Phone" value={receipt.phone} mono right />
              <Field label="Batch" value={receipt.batch} mono />
              <Field label="Storage" value={receipt.storage} right />
            </div>

            <div className="space-y-2 bg-[repeating-linear-gradient(to_right,#B8BFBC_0,#B8BFBC_6px,transparent_6px,transparent_12px)] bg-[length:100%_1px] bg-top bg-no-repeat pt-3 text-sm">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>{receipt.feeLabel}</span>
                <span className="font-mono">{naira(receipt.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total paid</span>
                <span className="font-mono text-brand-purple-50">{naira(receipt.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Balance after payment</span>
                <span className="font-mono text-[#44B494]">{naira(receipt.balanceAfter)}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-500">Recorded by {receipt.recordedBy}</p>

            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <button type="button" className="rounded-md bg-brand-purple-40 px-4 py-2 text-sm text-white hover:bg-brand-purple-50" onClick={() => downloadReceiptPdf(receipt)}>
                Download PDF
              </button>
              <button type="button" className="rounded-md border border-brand-purple-40 px-4 py-2 text-sm text-brand-purple-50 hover:bg-brand-purple-10">
                Share
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-md border border-brand-purple-40 px-4 py-2 text-sm text-brand-purple-50 hover:bg-brand-purple-10"
              >
                Print
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}