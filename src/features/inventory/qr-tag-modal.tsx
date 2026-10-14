import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { dateShort, kilograms } from "@/lib/format"
import type { BatchDetailRow } from "@/types/database"

export interface QrTagModalProps {
  batch: BatchDetailRow | null
  onClose: () => void
}

/** The crate tag. Scanning it opens the batch record for that storage ID. */
export function QrTagModal({ batch, onClose }: QrTagModalProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  if (!batch) return null

  const url = `${window.location.origin}/batch/${batch.reference}`

  const details = [
    { label: "Storage ID", value: batch.reference, mono: true },
    { label: "Farmer", value: batch.farmer_name },
    { label: "Produce", value: batch.produce_name ?? "—" },
    { label: "Weight", value: kilograms(batch.available_kg), mono: true },
    { label: "Cold room", value: batch.unit_code, mono: true },
    { label: "Date in", value: dateShort(batch.stored_at) },
  ]

  function handlePrint() {
    const svg = qrRef.current?.innerHTML
    if (!svg || !batch) return

    const frame = document.createElement("iframe")
    frame.setAttribute("aria-hidden", "true")
    frame.style.position = "fixed"
    frame.style.right = "0"
    frame.style.bottom = "0"
    frame.style.width = "0"
    frame.style.height = "0"
    frame.style.border = "0"
    document.body.append(frame)

    const doc = frame.contentDocument
    if (!doc) return

    doc.open()
    doc.write(`<!doctype html><html><head><title>${batch.reference}</title>
      <style>
        @page { size: 80mm 100mm; margin: 6mm; }
        body { margin:0; font-family: Archivo, Arial, sans-serif; text-align:center; }
        svg { width: 56mm; height: 56mm; }
        .ref { font-family: 'IBM Plex Mono', monospace; font-size: 16px; font-weight: 600; margin-top: 8px; }
        .meta { font-size: 11px; color: #52525C; margin-top: 4px; }
      </style></head>
      <body>
        ${svg}
        <div class="ref">${batch.reference}</div>
        <div class="meta">${batch.farmer_name} · ${batch.produce_name ?? ""}</div>
        <div class="meta">${kilograms(batch.available_kg)} · ${dateShort(batch.stored_at)}</div>
      </body></html>`)
    doc.close()

    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    window.setTimeout(() => frame.remove(), 1000)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Storage tag"
      description="Attach this to the crate. Scanning it opens the storage record."
      size="lg"
      footer={
        <>
          <Button variant="outline" icon="print" onClick={handlePrint}>
            Print tag
          </Button>
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div ref={qrRef} className="rounded-lg border border-line-strong p-3">
          <QRCodeSVG value={url} size={152} level="M" />
        </div>

        <dl className="flex-1">
          {details.map((detail, index) => (
            <div
              key={detail.label}
              className={`flex justify-between gap-4 py-2 ${index ? "border-t border-line" : ""}`}
            >
              <dt className="text-xs text-ink-muted">{detail.label}</dt>
              <dd className={`text-sm font-medium ${detail.mono ? "mono" : ""}`}>{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Modal>
  )
}
