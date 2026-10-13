import { StatusBadge } from "@/shared/components/StatusBadge";
import type { Booking } from "@/features/farmer/dashboard/data";

export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <section className="rounded-lg bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {booking.id}
            <span className="text-brand-purple-40"> • </span>
            {booking.product}
          </h2>
          <p className="text-sm text-secondary-grey">
            {booking.kgBooked.toLocaleString("en-NG")} kg booked • {booking.months} month
            {booking.months === 1 ? "" : "s"}
            {booking.paid ? " • paid" : ""}
          </p>
        </div>
        <StatusBadge status="active" />
      </div>
      <p className="mt-3 text-sm text-brand-purple-50">
        Bring your produce with the QR code from your payment. Storage starts when it is received.
      </p>
    </section>
  );
}