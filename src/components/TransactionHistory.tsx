"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import {
  displayWallet,
  formatTxTime,
  useBridgeHistory,
  type TxStatus,
} from "@/lib/history";
import { shortenAddress } from "@/lib/tokens";

const PAGE_SIZES = [5, 10, 20] as const;

function statusClass(status: TxStatus) {
  if (status === "completed") {
    return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
  }
  if (status === "pending") {
    return "bg-primary/15 text-accent-foreground ring-primary/30";
  }
  return "bg-red-500/15 text-red-300 ring-red-500/30";
}

function pageItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let n = start; n <= end; n += 1) items.push(n);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

export function TransactionHistory({ embedded = false }: { embedded?: boolean }) {
  const history = useBridgeHistory();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [statusFilter, setStatusFilter] = useState<"all" | TxStatus>("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return history;
    return history.filter((row) => row.status === statusFilter);
  }, [history, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  const fromRow = filtered.length === 0 ? 0 : start + 1;
  const toRow = Math.min(start + pageSize, filtered.length);

  function changePageSize(size: (typeof PAGE_SIZES)[number]) {
    setPageSize(size);
    setPage(1);
  }

  function changeFilter(next: "all" | TxStatus) {
    setStatusFilter(next);
    setPage(1);
  }

  return (
    <section
      id="history"
      className="scroll-mt-24 rounded-2xl border border-card-border bg-card/80 p-4 shadow-[0_0_80px_hsl(var(--primary)/0.06)] backdrop-blur-md sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 font-display text-xs font-semibold tracking-[0.2em] text-primary">
            <History className="h-3.5 w-3.5" />
            ACTIVITY
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-wide">
            {embedded ? "Your transfers" : "Transaction history"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Routes confirmed in this app, plus recent sample transfers.
          </p>
        </div>
        <label className="text-xs text-muted-foreground">
          Status
          <select
            className="mt-1 block rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none"
            value={statusFilter}
            onChange={(e) => changeFilter(e.target.value as "all" | TxStatus)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-muted/80 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">Wallet</th>
              <th className="px-4 py-3 font-medium">Tx hash</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No transactions in this view yet.
                </td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-border/80 odd:bg-transparent even:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatTxTime(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {row.sendAmount} {row.fromToken}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.fromChain}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {row.receiveAmount} {row.toToken}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.toChain}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {displayWallet(row.wallet)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-accent-foreground">
                    {shortenAddress(row.hash)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${statusClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Showing {fromRow}–{toRow} of {filtered.length}
          </span>
          <label className="inline-flex items-center gap-2">
            Rows
            <select
              className="rounded-md border border-border bg-muted px-2 py-1 text-foreground outline-none"
              value={pageSize}
              onChange={(e) =>
                changePageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])
              }
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageItems(safePage, totalPages).map((item, i) =>
            item === "…" ? (
              <span key={`e-${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm ${
                  item === safePage
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
