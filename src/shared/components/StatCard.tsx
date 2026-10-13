
export function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-1 items-center justify-between rounded-lg bg-white p-4">
      <div>
        <p className="text-sm text-brand-purple-50">{label}</p>
        <p className="font-mono text-2xl font-semibold text-brand-purple-50">{value}</p>
      </div>
      <div className="flex size-8 items-center justify-center rounded-lg bg-brand-purple-50 text-white">
        <img src={icon} alt="" className="size-4" />
      </div>
    </div>
  );
}