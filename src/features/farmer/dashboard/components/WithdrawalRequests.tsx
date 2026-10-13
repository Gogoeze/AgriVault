import { useState } from "react";
import { Pagination } from "@/shared/components/ui/Pagination";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { WithdrawalRequest } from "@/features/farmer/dashboard/data";

const PAGE_SIZE = 4;

export function WithdrawalRequests({ items }: { items: WithdrawalRequest[] }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;
  const rows = items.slice(offset, offset + PAGE_SIZE);

  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="border-b border-brand-purple-30 pb-3 text-sm text-brand-purple-50">
        Withdrawal requests
      </h2>
      <ul className="mt-3 flex flex-col">
        {rows.map((w) => (
          <li
            key={w.id}
            className="flex items-center justify-between border-b border-brand-purple-30 py-3 last:border-0"
          >
            <div>
              <p className="text-sm">
                <span className="font-mono">{w.id}</span>{" "}
                <span className="text-secondary-grey">•</span>{" "}
                <span className="font-mono">{w.storageId}</span>
              </p>
              <p className="font-mono text-xs text-secondary-grey">{w.kg} kg</p>
            </div>
            <StatusBadge status={w.status} />
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        pages={pages}
        start={items.length ? offset + 1 : 0}
        end={offset + rows.length}
        total={items.length}
        noun="requests"
        onChange={setPage}
      />
    </section>
  );
}