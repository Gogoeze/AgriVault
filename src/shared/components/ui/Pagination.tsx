type PaginationProps = {
  page: number;
  pages: number;
  start: number;
  end: number;
  total: number;
  noun: string;
  onChange: (page: number) => void;
};

export function Pagination({ page, pages, start, end, total, noun, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between text-xs text-secondary-grey">
      <span>
        Showing {start}-{end} of {total} {noun}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="rounded border border-secondary-grey/60 px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(pages, 3) }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
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
          onClick={() => onChange(page + 1)}
          className="rounded border border-secondary-grey/60 px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}