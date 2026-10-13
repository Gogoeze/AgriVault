import type { BadgeStatus } from "@/shared/components/StatusBadge";

export type Booking = { id: string; product: string; kgBooked: number; months: number; paid: boolean };

export type StorageBatch = {
  id: string;
  product: string;
  tonnes: number;
  location: string;
  droppedOff: string;
  endsOn: string;
  dayNumber: number;
  totalDays: number;
  availableKg: number;
};

export type WithdrawalRequest = {
  id: string;
  storageId: string;
  kg: number;
  status: Exclude<BadgeStatus, "active">;
};

export const farmer = { name: "Joy Smith", firstName: "Joy", role: "Storage User" };

export const stats = { batches: "4", totalStored: "10.8t", nextEnd: "3 days" };

export const booking: Booking = { id: "BK-021", product: "Onions", kgBooked: 2000, months: 2, paid: true };

export const batch: StorageBatch = {
  id: "ST-0142",
  product: "Onions",
  tonnes: 3.9,
  location: "Cold room",
  droppedOff: "Aug 12",
  endsOn: "11 Oct",
  dayNumber: 57,
  totalDays: 60,
  availableKg: 3930,
};

export const initialWithdrawals: WithdrawalRequest[] = Array.from({ length: 10 }, (_, i) => ({
  id: `WD-${String(i + 1).padStart(2, "0")}`,
  storageId: "ST-0142",
  kg: 300,
  status: i === 1 ? "approved" : "pending",
}));