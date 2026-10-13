import { adminNav } from "@/features/admin/nav"
import { useState } from "react";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { Icon } from "@/shared/components/ui/Icon";
import { ReadingChart } from "@/features/admin/monitoring/components/ReadingChart";
import { useLatestReading } from "@/features/admin/monitoring/useLatestReading";


type Reading = { id: string; time: string; temp: number; humidity: number; status: "good" | "warning" };


const TEMP_DATA = [
  { label: "Jan", value: 2.5 },
  { label: "Feb", value: 4.5 },
  { label: "Mar", value: 5 },
  { label: "Apr", value: 5.8 },
  { label: "May", value: 7 },
  { label: "Jun", value: 6.6 },
  { label: "Jul", value: 7.5 },
];

const HUMIDITY_DATA = [
  { label: "Jan", value: 25 },
  { label: "Feb", value: 42 },
  { label: "Mar", value: 50 },
  { label: "Apr", value: 55 },
  { label: "May", value: 70 },
  { label: "Jun", value: 66 },
  { label: "Jul", value: 75 },
];

const READINGS: Reading[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  time: "Today 15:00",
  temp: 10,
  humidity: 73,
  status: "good",
}));

const COLUMNS = ["Temperature", "Humidity", "Time", "Status"];

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
}) {
  return (
    <div className="flex flex-1 items-start justify-between rounded-xl bg-white p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-brand-purple-30">{label}</span>
        <span className="text-2xl font-semibold text-brand-purple-50">{value}</span>
        <span className="text-[10px] text-brand-purple-30">{hint}</span>
      </div>
      <span className="flex size-8 items-center justify-center rounded-md bg-brand-purple-50 text-white">
        <Icon name={icon} className="text-[20px]" />
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: Reading["status"] }) {
  const good = status === "good";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-4 py-1 text-xs font-medium ${good ? "bg-accent-success/15 text-accent-success" : "bg-accent-critical/10 text-accent-critical"
        }`}
    >
      <Icon name={good ? "check_circle" : "warning"} className="text-[14px]" />
      {good ? "Good" : "Warning"}
    </span>
  );
}

export default function MonitoringPage() {

  const latest = useLatestReading("store_001/data");
  const settings = useLatestReading("store_001/settings");
  console.log(latest);

  const [page, setPage] = useState(1);

  const total = 24; // replace with server total
  const pageSize = 6;
  const pages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex flex-col gap-6">
        <Header title="Temperature & Humidity" subtitle="Cold room real time reading" />
        <div className="flex gap-[var(--content-gap)]">
          <Sidebar items={adminNav} />
          <main className="flex flex-1 flex-col gap-4">
            {/* Stat cards */}
            <div className="flex gap-4">
              <StatCard
                label="Temperature now"
                value={latest ? `${latest.temp}°C` : "--"}
                hint={settings ? `Allowed ${settings.lowTempThreshold} to ${settings.highTempThreshold}°C` : ""}
                icon="device_thermostat"
              />
              <StatCard
                label="Humidity now"
                value={latest ? `${latest.humidity}%` : "--"}
                hint={settings ? `Allowed ${settings.lowHumThreshold} to ${settings.highHumThreshold}%` : ""}
                icon="humidity_percentage"
              />
              <StatCard
                label="Last reading"
                value={latest?.timestamp ?? "--"}
                hint="Logged automatically" 
                icon="schedule"
              />
            </div>

            {/* Charts */}
            <div className="flex gap-4">
              <ReadingChart
                title="Temperature (°C)"
                data={TEMP_DATA}
                yDomain={[0, 10]}
                yTicks={[0, 2, 4, 6, 8, 10]}
                unit="°C"
                threshold={6}
              />
              <ReadingChart
                title="Humidity (%)"
                data={HUMIDITY_DATA}
                yDomain={[10, 100]}
                yTicks={[10, 20, 40, 60, 80, 100]}
                unit="%"
                threshold={60}
              />
            </div>

            {/* Latest readings */}
            <section className="flex flex-col gap-3 rounded-xl bg-white p-4">
              <h2 className="border-b border-brand-purple-30 pb-2 text-sm text-brand-purple-50">
                Latest readings
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-sm">
                  <thead>
                    <tr className="bg-brand-purple-10">
                      {COLUMNS.map((c) => (
                        <th
                          key={c}
                          className="border-r border-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-brand-purple-50 last:border-r-0"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {READINGS.map((r) => (
                      <tr key={r.id} className="border-b border-brand-purple-30 last:border-b-0">

                        <td className="px-4 py-4">{r.temp}°C</td>
                        <td className="px-4 py-4">{r.humidity}%</td>
                        <td className="px-4 py-4">{r.time}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-xs border-t border-brand-purple-30 pt-2 text-secondary-grey">
                <span>
                  Showing {start}-{end} of {total} readings
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded border border-secondary-grey/60 px-3 py-1 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(pages, 3) }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`size-7 rounded border ${page === n
                          ? "border-brand-purple-40 bg-brand-purple-40 text-white"
                          : "border-secondary-grey/60 text-brand-purple-50"
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded border border-secondary-grey/60 px-3 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}