"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { History, LayoutGrid } from "lucide-react";
import { BridgeCard } from "./BridgeCard";
import { TransactionHistory } from "./TransactionHistory";

function TransferPanelInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "history" ? "history" : "home";

  function setTab(next: "home" | "history") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "home") params.delete("tab");
    else params.set("tab", "history");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div
      className={`w-full ${tab === "history" ? "lg:min-w-0 lg:max-w-none" : "max-w-lg"}`}
    >
      <div className="mb-3 inline-flex rounded-xl border border-border bg-card/80 p-1 shadow-[0_0_40px_hsl(var(--primary)/0.06)]">
        <button
          type="button"
          onClick={() => setTab("home")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "home"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Home
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "history"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          History
        </button>
      </div>

      {tab === "home" ? (
        <BridgeCard onConfirmed={() => setTab("history")} />
      ) : (
        <TransactionHistory embedded />
      )}
    </div>
  );
}

export function TransferPanel() {
  return (
    <Suspense
      fallback={
        <div className="h-[28rem] w-full max-w-lg animate-pulse rounded-2xl border border-card-border bg-card/60" />
      }
    >
      <TransferPanelInner />
    </Suspense>
  );
}
