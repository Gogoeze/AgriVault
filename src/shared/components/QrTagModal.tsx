import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Icon } from "@/shared/components/ui/Icon";

type QrTagModalProps = {
  code: string;
  farmer: string;
  weightKg: number;
  dateIn: string;
  product?: string;
  onClose: () => void;
};

export function QrTagModal({
  code,
  farmer,
  weightKg,
  dateIn,
  product = "Onions",
  onClose,
}: QrTagModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // Replace with the real storage-record route
  const url = `${window.location.origin}/inventory/${code}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handlePrint = () => {
    const svg = qrRef.current?.innerHTML;
    if (!svg) return;
    const w = window.open("", "_blank", "width=400,height=500");
    if (!w) return;
    w.document.write(`
      <html><head><title>${code}</title>
      <style>
        body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px}
        svg{width:240px;height:240px}
        p{margin:0;font-size:14px}
      </style></head>
      <body>${svg}<p><b>${code}</b></p><p>${farmer} · ${product} · ${weightKg.toLocaleString("en-NG")} kg</p></body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const details = [
    { label: "Storage ID", value: code },
    { label: "Farmer", value: farmer },
    { label: "Product", value: product },
    { label: "Weight", value: `${weightKg.toLocaleString("en-NG")} kg` },
    { label: "Date in", value: dateIn },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-2xl flex-col gap-5 rounded-xl bg-white p-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="qr-title" className="text-base font-semibold text-brand-purple-50 border-b border-brand-purple-30 pb-2">
            Storage tag generated
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div
            ref={qrRef}
            className="rounded-2xl border-3 border-dashed border-brand-amber-10 p-3"
          >
            <QRCodeSVG value={url} size={160} level="M" />
          </div>

          <dl className="flex flex-col gap-1 text-sm">
            {details.map((d) => (
              <div key={d.label} className="flex gap-2">
                <dt className="w-20 text-secondary-grey">{d.label}</dt>
                <dd className="font-medium text-brand-purple-50">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-xs text-secondary-grey">
          Attach this tag to the crate. Scanning it opens the farmer&apos;s storage record.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg border border-brand-purple-30 px-8 py-2 text-sm text-brand-purple-40 hover:bg-brand-purple-10"
          >
            Print tag
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand-purple-40 px-10 py-2 text-sm font-semibold text-white hover:bg-brand-purple-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}