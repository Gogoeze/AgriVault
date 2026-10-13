import { useMemo, useState } from "react";
import { farmerNav } from "@/features/farmer/nav";
import { farmer } from "@/features/farmer/dashboard/data";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { StorageDetailsCard } from "@/features/farmer/payments/components/StorageDetailsCard";
import { SummaryCard } from "@/features/farmer/payments/components/SummaryCard";
import { PaymentHistory } from "@/features/farmer/payments/components/PaymentHistory";
import {
  RATE_PER_TONNE_MONTH,
  paymentHistory,
  type PaymentRecord,
} from "@/features/farmer/payments/data";

export default function PaymentsPage() {
  const [quantityKg, setQuantityKg] = useState("2000");
  const [months, setMonths] = useState(2);
  const [method, setMethod] = useState("bank_transfer");
  const [page, setPage] = useState(1);

  const tonnes = useMemo(() => (Number(quantityKg) || 0) / 1000, [quantityKg]);
  const total = tonnes * RATE_PER_TONNE_MONTH * months;

  const handlePay = () => {
    // TODO: call the payment endpoint, then show the receipt and QR code
    console.log("pay", { tonnes, months, method, total });
  };

  const handleViewReceipt = (record: PaymentRecord) => {
    // TODO: open the receipt modal once it is designed
    console.log("receipt", record.id);
  };

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex flex-col gap-6">
        <Header
          title="Storage payment"
          subtitle="Choose how long to store your produce, then pay"
          showUser={false}
        />
        <div className="flex gap-[var(--content-gap)]">
          <Sidebar items={farmerNav} user={{ name: farmer.name, role: farmer.role }} />
          <main className="flex flex-1 flex-col gap-4">
            <div className="grid grid-cols-2 items-stretch gap-4">
              <StorageDetailsCard
                quantityKg={quantityKg}
                months={months}
                method={method}
                onQuantityChange={setQuantityKg}
                onMonthsChange={setMonths}
                onMethodChange={setMethod}
              />
              <SummaryCard
                tonnes={tonnes}
                months={months}
                total={total}
                disabled={tonnes <= 0}
                onPay={handlePay}
              />
            </div>
            <PaymentHistory
              records={paymentHistory}
              page={page}
              onPageChange={setPage}
              onViewReceipt={handleViewReceipt}
            />
          </main>
        </div>
      </div>
    </div>
  );
}