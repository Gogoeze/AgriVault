import { adminNav } from "@/features/admin/nav"
import { useMemo, useState } from "react";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { Icon } from "@/shared/components/ui/Icon";
import { QrTagModal } from "@/shared/components/QrTagModal";


type Status = "active" | "inactive";

type InventoryItem = {
    id: string;
    code: string;
    farmer: string;
    weightKg: number;
    dateIn: string;
    status: Status;
};

const ITEMS: InventoryItem[] = [
    { id: "1", code: "ST-0412", farmer: "Amina Bello", weightKg: 3930, dateIn: "Sep 12", status: "inactive" },
    { id: "2", code: "ST-0398", farmer: "Kelechi Samuel", weightKg: 1570, dateIn: "Sep 20", status: "active" },
    { id: "3", code: "ST-0456", farmer: "Damilare Peter", weightKg: 2055, dateIn: "Sep 28", status: "active" },
    { id: "4", code: "ST-0377", farmer: "Mubarak Yusuf", weightKg: 3240, dateIn: "Sep 13", status: "active" },
    { id: "5", code: "ST-0315", farmer: "Jane Doe", weightKg: 5632, dateIn: "Oct 22", status: "inactive" },
    { id: "6", code: "ST-0316", farmer: "John Smith", weightKg: 5206, dateIn: "Oct 12", status: "inactive" },
];

const COLUMNS = ["ID", "Farmer", "Weight (kg)", "Date in", "Status", "Tag"];

function StatusBadge({ status }: { status: Status }) {
    const isActive = status === "active";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium ${isActive
                    ? "bg-accent-success/15 text-accent-success"
                    : "bg-accent-critical/10 text-accent-critical"
                }`}
        >
            <span className="size-1 rounded-full bg-current" />
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

export default function InventoryPage() {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [tagItem, setTagItem] = useState<InventoryItem | null>(null);


    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q
            ? ITEMS.filter((i) => i.farmer.toLowerCase().includes(q) || i.code.toLowerCase().includes(q))
            : ITEMS;
    }, [query]);

    const total = 24; // replace with server total
    const pageSize = 6;
    const pages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    const handleQrTag = (item: InventoryItem) => setTagItem(item);


    return (
        <div className="min-h-screen bg-app-bg p-6">
            <div className="mx-auto flex flex-col gap-6">
                <Header title="Storage & Inventory" subtitle="Each user's onions and quantities" />
                <div className="flex gap-[var(--content-gap)]">
                    <Sidebar items={adminNav} />
                    <main className="flex flex-1 flex-col gap-4 self-start rounded-xl bg-white p-4">
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

                            <button
                                type="button"
                                className="flex items-center gap-1 rounded-lg border border-secondary-grey/60 px-3 py-1.5 text-sm hover:bg-brand-purple-10"
                            >
                                <Icon name="filter_list" className="text-[18px]" />
                                Filter
                            </button>
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
                                    {filtered.map((i) => (
                                        <tr key={i.id} className="border-b border-brand-purple-30 last:border-b-0">
                                            <td className="px-4 py-4">{i.code}</td>
                                            <td className="px-4 py-4">{i.farmer}</td>
                                            <td className="px-4 py-4">{i.weightKg.toLocaleString("en-NG")}</td>
                                            <td className="px-4 py-4">{i.dateIn}</td>
                                            <td className="px-4 py-4">
                                                <StatusBadge status={i.status} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQrTag(i)}
                                                    className="rounded-md border border-brand-purple-40 px-3 py-1.5 text-sm text-brand-purple-50 hover:bg-brand-purple-10"
                                                >
                                                    QR tag
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={COLUMNS.length} className="px-4 py-10 text-secondary-grey">
                                                No inventory found
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
                    </main>
                </div>
            </div>
            {tagItem && (
                <QrTagModal
                    code={tagItem.code}
                    farmer={tagItem.farmer}
                    weightKg={tagItem.weightKg}
                    dateIn={tagItem.dateIn}
                    onClose={() => setTagItem(null)}
                />
            )}
        </div>
    );
}