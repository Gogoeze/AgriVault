export type BadgeStatus = "active" | "pending" | "approved";

// Change colours here only. Check the Success tokens exist in theme.css.
const STYLES: Record<BadgeStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-Success/26 text-Success" },
  pending: { label: "Pending", className: "bg-Warning/26 text-brand-amber-30" },
  approved: { label: "Approved", className: "bg-Success/26 text-Success" },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const { label, className } = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-lg px-3 py-1 text-sm ${className}`}>
      {label}
    </span>
  );
}