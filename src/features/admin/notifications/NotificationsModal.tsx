import { useEffect, useState } from "react";
import { Icon } from "@/shared/components/ui/Icon";

export type NotificationItem = {
  id: string;
  kind: "alert" | "reminder";
  icon: string;
  title: string;
  subject: string; // "Cold room" or "ST-0412 • 3.9t" etc.
  meta: string; // "Today, 14:05 • 4.8°C logged • allowed 7 to 13°C"
  read: boolean;
  status?: "critical" | "acknowledged"; // alerts only
  progress?: { value: number; tone: "warning" | "critical"; caption: string }; // reminders only
};

type Tab = "all" | "alert" | "reminder";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "alert", label: "Alerts" },
  { key: "reminder", label: "Reminders" },
];

const SEED: NotificationItem[] = [
  {
    id: "n1",
    kind: "alert",
    icon: "device_thermostat",
    title: "Temperature breach",
    subject: "Cold room",
    meta: "Today, 14:05 • 4.8°C logged • allowed 7 to 13°C",
    read: false,
    status: "critical",
  },
  {
    id: "n2",
    kind: "alert",
    icon: "humidity_percentage",
    title: "Humidity breach",
    subject: "Cold room",
    meta: "Today, 11:20 • 77% logged • allowed 65 to 75%",
    read: true,
    status: "acknowledged",
  },
  {
    id: "n3",
    kind: "reminder",
    icon: "schedule",
    title: "Storage ends in 3 days",
    subject: "Amina Bello • ST-0412 • 3.9t",
    meta: "",
    read: false,
    progress: { value: 95, tone: "warning", caption: "Day 57 of 60" },
  },
  {
    id: "n4",
    kind: "reminder",
    icon: "schedule",
    title: "Storage period ended",
    subject: "Musa Ibrahim • ST-0398 • 1.6t",
    meta: "",
    read: false,
    progress: { value: 100, tone: "critical", caption: "Ended 2 days ago" },
  },
];

const btnPrimary =
  "rounded-md bg-brand-purple-40 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple-40";
const btnOutline =
  "rounded-md border border-brand-purple-40 bg-white px-4 py-1.5 text-xs font-medium text-brand-purple-50 transition hover:bg-brand-purple-10/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple-40";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="border-t border-brand-purple-10 px-4 pt-1 text-[10px] uppercase tracking-wide text-secondary-grey">
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: "critical" | "acknowledged" }) {
  return status === "critical" ? (
    <span className="flex items-center gap-1 rounded-full bg-accent-critical/15 px-4 py-1 text-[12px] font-medium text-accent-critical">
      <Icon name="warning" className="text-[12px]" />
      Critical
    </span>
  ) : (
    <span className="flex items-center gap-1 rounded-full bg-accent-success/15 px-4 py-1 text-[12px] font-medium text-accent-success">
      <Icon name="check_circle" className="text-[12px]" />
      Acknowledged
    </span>
  );
}

type Handlers = {
  onAcknowledge?: (id: string) => void;
  onViewReadings?: (id: string) => void;
  onSendReminder?: (id: string) => void;
  onViewBatch?: (id: string) => void;
};

function Row({
  n,
  onViewReadings,
  onSendReminder,
  onViewBatch,
  acknowledge,
}: { n: NotificationItem; acknowledge: (id: string) => void } & Handlers) {
  return (
    <li className="flex gap-3 border-t border-brand-purple-10 px-6 py-4 first:border-t-0">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-purple-50 text-white">
        <Icon name={n.icon} className="text-[18px]" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {n.title}
              <span className="mx-1.5 inline-block size-1.5 rounded-full bg-brand-purple-50 align-middle" />
              <span className="font-semibold">{n.kind === "alert" ? n.subject : ""}</span>
            </p>
            <p className="text-[11px] text-secondary-grey">{n.kind === "alert" ? n.meta : n.subject}</p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {n.status && <StatusBadge status={n.status} />}
            <span
              aria-label={n.read ? "Read" : "Unread"}
              className={`size-1.5 rounded-full ${n.read ? "bg-transparent" : "bg-brand-purple-50"}`}
            />
          </div>
        </div>

        {n.progress && (
          <div>
            <div
              role="progressbar"
              aria-valuenow={n.progress.value}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-full bg-secondary-grey/25"
            >
              <div
                className={`h-full rounded-full ${n.progress.tone === "critical" ? "bg-accent-critical" : "bg-[#fdb08a]"}`}
                style={{ width: `${n.progress.value}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-secondary-grey">{n.progress.caption}</p>
          </div>
        )}

        <div className="flex gap-2">
          {n.kind === "alert" ? (
            <>
              {n.status === "critical" && (
                <button type="button" className={btnPrimary} onClick={() => acknowledge(n.id)}>
                  Acknowledge
                </button>
              )}
              <button type="button" className={btnOutline} onClick={() => onViewReadings?.(n.id)}>
                View readings
              </button>
            </>
          ) : (
            <>
              <button type="button" className={btnPrimary} onClick={() => onSendReminder?.(n.id)}>
                Send reminder
              </button>
              <button type="button" className={btnOutline} onClick={() => onViewBatch?.(n.id)}>
                View batch
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export function NotificationsModal({
  open,
  onClose,
  items: initial = SEED,
  ...handlers
}: {
  open: boolean;
  onClose: () => void;
  items?: NotificationItem[];
} & Handlers) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const unread = items.filter((i) => !i.read).length;
  const visible = items.filter((i) => tab === "all" || i.kind === tab);
  const alerts = visible.filter((i) => i.kind === "alert");
  const reminders = visible.filter((i) => i.kind === "reminder");

  const markAllRead = () => setItems((xs) => xs.map((x) => ({ ...x, read: true })));
  const acknowledge = (id: string) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "acknowledged" as const, read: true } : x)));
    handlers.onAcknowledge?.(id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-title"
        className="flex max-h-[calc(100vh-3rem)] w-full max-w-[600px] flex-col rounded-xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5">
          <div className="flex items-center gap-2">
            <h2 id="notif-title" className="text-base font-semibold">
              Notifications
            </h2>
            {unread > 0 && (
              <span className="rounded-full bg-brand-purple-10 px-2 py-0.5 text-[10px] font-medium text-brand-purple-50">
                {unread} new
              </span>
            )}
          </div>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close notifications"
            className="rounded p-0.5 hover:bg-brand-purple-10/60"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Tabs + mark all */}
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div role="tablist" className="flex gap-1 rounded-lg bg-brand-purple-10 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1 text-xs transition ${
                  tab === t.key ? "bg-brand-purple-40 text-white" : "text-brand-purple-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="rounded-md border border-brand-purple-40 px-3 py-1.5 text-xs font-medium text-brand-purple-50 hover:bg-brand-purple-10/50 disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pb-2">
          {visible.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-secondary-grey">You're all caught up.</p>
          )}

          {alerts.length > 0 && (
            <>
              <SectionLabel>Alerts</SectionLabel>
              <ul>
                {alerts.map((n) => (
                  <Row key={n.id} n={n} acknowledge={acknowledge} {...handlers} />
                ))}
              </ul>
            </>
          )}

          {reminders.length > 0 && (
            <>
              <SectionLabel>Reminders</SectionLabel>
              <ul>
                {reminders.map((n) => (
                  <Row key={n.id} n={n} acknowledge={acknowledge} {...handlers} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}