import { adminNav } from "@/features/admin/nav"
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { StatCard } from "@/shared/components/StatCard";
import { ClimateChart } from "@/features/admin/dashboard/components/ClimateChart";
import { ChamberCapacity } from "@/features/admin/dashboard/components/ChamberCapacity";
import { WithdrawalRequests } from "@/features/admin/dashboard/components/WithdrawalRequests";
import { ActiveAlerts } from "@/features/admin/dashboard/components/ActiveAlerts";
import activeUsers from "@/shared/assets/icons/activeUsers.svg";
import tonnes from "@/shared/assets/icons/tonnes.svg";
import highTemperature from "@/shared/assets/icons/hightemperature.svg";



const withdrawals = [
  { id: "1", farmer: "Amina Bello", code: "ST-0398", kg: 500 },
  { id: "2", farmer: "Amina Bello", code: "ST-0398", kg: 500 },
  { id: "3", farmer: "Kelechi Samuel", code: "ST-1268", kg: 200 },
  { id: "4", farmer: "Damilare Peter", code: "ST-0002", kg: 30 },
  { id: "5", farmer: "Mubarak Yusuf", code: "ST-0265", kg: 20 },
];

const alerts = [
  { id: "1", title: "High temperature", unit: "Unit 2", time: "Today, 14:05", severity: "critical", icon: "device_thermostat" },
  { id: "2", title: "High humidity", unit: "Unit 1", time: "Today, 11:20", severity: "alert", icon: "humidity_high" },
  { id: "3", title: "Solar battery low", time: "Today, 09:42", severity: "alert", icon: "battery_alert" },
] as const;

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex flex-col gap-6">
        <Header title="Dashboard" subtitle="Storage overview" />
        <div className="flex gap-[var(--content-gap)]">
          <Sidebar items={adminNav} />
          <main className="flex flex-1 flex-col gap-4">
            <div className="flex gap-4">
              <StatCard label="Active Users" value="4" icon={activeUsers} />
              <StatCard label="Tonnes Stored" value="10.8t" icon={tonnes} />
              <StatCard label="Open Alerts" value="3" icon={highTemperature} />
            </div>
            <div className="grid grid-cols-[1fr_320px] gap-4">
              <div className="flex flex-col gap-4">
                <ClimateChart />
                <ActiveAlerts items={[...alerts]} />
              </div>
              <div className="flex flex-col gap-4">
                <ChamberCapacity used={10.8} total={175} />
                <WithdrawalRequests items={withdrawals} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}