export function ChamberCapacity({ used, total }: { used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-sm text-brand-purple-50 border-b border-brand-purple-30 pb-2">Chamber capacity</h2>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative size-[180px] shrink-0">
          <svg viewBox="0 0 180 180" className="-rotate-90">
            <circle cx="90" cy="90" r="84" fill="none" stroke="#D8A7FF" strokeWidth="1" />
            <circle cx="90" cy="90" r={r} fill="none" stroke="#F9F2FF" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={r} fill="none" stroke="#FFBE9C" strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * c} ${c}`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-semibold text-brand-purple-50">
            {pct}%
          </span>
        </div>
        <div className="font-mono text-xs font-semibold text-brand-purple-50">
          <p>Used {used}t</p>
          <p>Free {(total - used).toFixed(1)}t</p>
          <p>of {total}t</p>
        </div>
      </div>
    </section>
  );
}