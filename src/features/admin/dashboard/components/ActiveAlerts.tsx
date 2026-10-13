import { Icon } from "@/shared/components/ui/Icon";
import warning from "@/shared/assets/icons/warning.svg";
import alert from "@/shared/assets/icons/alert.svg";


const alertIcons: Record<string, string> = {
  warning: warning,
  alert: alert,
};

export type AlertItem = {
  id: string; title: string; unit?: string; time: string;
  severity: "critical" | "alert"; icon: string;
};

export function ActiveAlerts({ items }: { items: AlertItem[] }) {
  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-sm text-brand-purple-50 border-b border-brand-purple-30 pb-3">Active alerts</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((a) => (
          <li key={a.id} className="flex items-center gap-3 border-b border-brand-purple-30 pb-3 last:border-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-purple-50 text-white">
              {alertIcons[a.icon] ? (
                <img src={alertIcons[a.icon]} alt="" className="size-5" />
              ) : (
                <Icon name={a.icon} className="text-[20px]" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                {a.title}
                {a.unit && <><span className=" text-secondary-grey"> • </span>{a.unit}</>}
              </p>
              <p className="text-xs text-secondary-grey">{a.time}</p>
            </div>
            <span
              className={`flex items-center gap-1 rounded-lg px-3 py-1 text-sm ${a.severity === "critical" ? "bg-Danger/26 text-accent-critical" : "bg-Warning/26 text-brand-amber-30"
                }`}
            >
              <img src={a.severity === "critical" ? alert : warning} alt="" className="size-3.5" />
              {a.severity === "critical" ? "Critical" : "Alert"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}