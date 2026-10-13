import { adminNav } from "@/features/admin/nav"
import { useMemo, useState } from "react";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { Icon } from "@/shared/components/ui/Icon";

type UserStatus = "active" | "inactive";

type User = {
  id: string;
  name: string;
  phone: string;
  unit: string;
  stored: number;
  balance: number;
  status: UserStatus;
};

const USERS: User[] = [
  { id: "1", name: "Amina Bello", phone: "081158463185", unit: "U-1", stored: 3.9, balance: 0, status: "inactive" },
  { id: "2", name: "Kelechi Samuel", phone: "081158463185", unit: "U-1", stored: 1.6, balance: 10000, status: "active" },
  { id: "3", name: "Damilare Peter", phone: "081158463185", unit: "U-2", stored: 2.1, balance: 31500, status: "active" },
  { id: "4", name: "Mubarak Yusuf", phone: "081158463185", unit: "U-2", stored: 3.2, balance: 24000, status: "active" },
  { id: "5", name: "Jane Doe", phone: "081158463185", unit: "U-3", stored: 5.5, balance: 0, status: "inactive" },
  { id: "6", name: "John Smith", phone: "081158463185", unit: "U-3", stored: 2.0, balance: 0, status: "inactive" },
];

const COLUMNS = ["Name", "Phone", "Unit", "Stored (t)", "Balance", "Status"];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function StatusBadge({ status }: { status: UserStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium ${
        isActive
          ? "bg-accent-success/15 text-accent-success"
          : "bg-accent-critical/10 text-accent-critical"
      }`}
    >
      <span className="size-1 rounded-full bg-current" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? USERS.filter((u) => u.name.toLowerCase().includes(q) || u.phone.includes(q))
      : USERS;
  }, [query]);

  const total = 24; // replace with server total
  const pageSize = 6;
  const pages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex flex-col gap-6">
        <Header title="Users" subtitle="Register and manage users" />
        <div className="flex gap-[var(--content-gap)]">
          <Sidebar items={adminNav} />
          <main className="flex flex-1 flex-col gap-4 rounded-xl bg-white p-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
              <label className="relative w-full max-w-xs">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-secondary-grey"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full rounded-md border border-secondary-grey/60 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-purple-40"
                />  
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-brand-purple-30 px-3 py-1.5 text-sm hover:bg-brand-purple-10"
                >
                  <Icon name="filter_list" className="text-[18px]" />
                  Filter
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-brand-purple-40 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-purple-50"
                >
                  <Icon name="add" className="text-[20px]" />
                  Register user
                </button>
              </div>
            </div>

            {/* Table */}
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
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-brand-purple-30 last:border-b-0">
                      <td className="px-4 py-4">{u.name}</td>
                      <td className="px-4 py-4">{u.phone}</td>
                      <td className="px-4 py-4">{u.unit}</td>
                      <td className="px-4 py-4">{u.stored.toFixed(1)}</td>
                      <td className="px-4 py-4">{naira(u.balance)}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={u.status} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-4 py-10 text-secondary-grey">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-secondary-grey border-t border-brand-purple-30 pt-2">
              <span>
                Showing {start}-{end} of {total} users
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
                    className={`size-7 rounded border ${
                      page === n
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
          </main>
        </div>
      </div>
    </div>
  );
}