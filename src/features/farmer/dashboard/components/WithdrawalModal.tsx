import { useEffect, useState } from "react";

type Collection = "partial" | "full";
export type WithdrawalPayload = { collection: Collection; kg: number };

type Props = {
  batchId: string;
  availableKg: number;
  onClose: () => void;
  onSubmit: (payload: WithdrawalPayload) => void;
};

export function WithdrawalModal({ batchId, availableKg, onClose, onSubmit }: Props) {
  const [collection, setCollection] = useState<Collection>("partial");
  const [qty, setQty] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const kg = collection === "full" ? availableKg : Number(qty);
  const canSubmit = kg > 0 && kg <= availableKg;
  const error =
    collection === "partial" && qty !== "" && !canSubmit
      ? `Enter a quantity between 1 and ${availableKg} kg`
      : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-5"
      >
        <div className="border-b border-brand-purple-30 pb-2">
          <h2 id="withdrawal-title" className="text-sm font-semibold">
            Request withdrawal <span className="text-brand-purple-40">•</span> {batchId}
          </h2>
          <p className="text-xs text-brand-purple-40">{availableKg} kg available</p>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-secondary-grey">Collection</span>
          <select
            value={collection}
            onChange={(e) => setCollection(e.target.value as Collection)}
            className="rounded-lg border border-brand-purple-30 px-3 py-2 text-sm"
          >
            <option value="partial">Partial</option>
            <option value="full">Full</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-secondary-grey">Quantity (kg, partial)</span>
          <input
            type="number"
            min={1}
            max={availableKg}
            disabled={collection === "full"}
            value={collection === "full" ? availableKg : qty}
            onChange={(e) => setQty(e.target.value)}
            className="rounded-lg border border-brand-purple-30 px-3 py-2 text-sm disabled:bg-secondary-grey/10"
          />
          {error ? (
            <span className="text-xs text-destructive">{error}</span>
          ) : (
            <span className="text-xs text-secondary-grey">
              The facility reviews your request before collection
            </span>
          )}
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-brand-purple-30 px-6 py-2 text-sm text-brand-purple-40 hover:bg-brand-purple-10"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit({ collection, kg })}
            className="rounded-lg bg-brand-purple-40 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-purple-50 disabled:opacity-50"
          >
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}