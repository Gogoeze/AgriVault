import { useState } from "react";
import { farmerNav } from "@/features/farmer/nav";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { StatCard } from "@/shared/components/StatCard";
import { QrTagModal } from "@/shared/components/QrTagModal";
import { Icon } from "@/shared/components/ui/Icon";
import tonnes from "@/shared/assets/icons/tonnes.svg";
import { BookingCard } from "@/features/farmer/dashboard/components/BookingCard";
import { StorageBatchCard } from "@/features/farmer/dashboard/components/StorageBatchCard";
import { WithdrawalRequests } from "@/features/farmer/dashboard/components/WithdrawalRequests";
import {
  WithdrawalModal,
  type WithdrawalPayload,
} from "@/features/farmer/dashboard/components/WithdrawalModal";
import { batch, booking, farmer, initialWithdrawals, stats } from "@/features/farmer/dashboard/data";

export default function DashboardPage() {
  const [requests, setRequests] = useState(initialWithdrawals);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const handleSubmit = (p: WithdrawalPayload) => {
    setRequests((prev) => [
      {
        id: `WD-${String(prev.length + 1).padStart(2, "0")}`,
        storageId: batch.id,
        kg: p.kg,
        status: "pending",
      },
      ...prev,
    ]);
    setWithdrawOpen(false);
  };

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex flex-col gap-6">
        <Header title="Dashboard" showUser={false} />
        <div className="flex gap-[var(--content-gap)]">
          <Sidebar items={farmerNav} user={{ name: farmer.name, role: farmer.role }} />
          <main className="flex flex-1 flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Hello, {farmer.firstName}</h2>
                <p className="text-sm">Your stored goods at a glance</p>
              </div>
              {/* TODO: opens the Book storage flow once it is designed */}
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-brand-purple-40 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-purple-50"
              >
                <Icon name="add" className="text-[18px]" />
                Book storage
              </button>
            </div>

            {/* TODO: swap for batches.svg and clock.svg exported from Figma */}
            <div className="flex gap-4">
              <StatCard label="Batches in storage" value={stats.batches} icon={tonnes} />
              <StatCard label="Total stored" value={stats.totalStored} icon={tonnes} />
              <StatCard label="Next storage end" value={stats.nextEnd} icon={tonnes} />
            </div>

            <BookingCard booking={booking} />
            <StorageBatchCard
              batch={batch}
              onViewQr={() => setQrOpen(true)}
              onWithdraw={() => setWithdrawOpen(true)}
            />
            <WithdrawalRequests items={requests} />
          </main>
        </div>
      </div>

      {withdrawOpen && (
        <WithdrawalModal
          batchId={batch.id}
          availableKg={batch.availableKg}
          onClose={() => setWithdrawOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
      {qrOpen && (
        <QrTagModal
          code={batch.id}
          farmer={farmer.name}
          weightKg={batch.tonnes * 1000}
          dateIn={batch.droppedOff}
          product={batch.product}
          onClose={() => setQrOpen(false)}
        />
      )}
    </div>
  );
}