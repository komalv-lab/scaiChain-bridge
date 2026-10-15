"use client";

import dynamic from "next/dynamic";
import { Shield } from "lucide-react";

const WalletBar = dynamic(
  () => import("./WalletBar").then((mod) => mod.WalletBar),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-36 animate-pulse rounded-lg bg-secondary" />
    ),
  },
);

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
            <Shield className="h-5 w-5 text-primary" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[11px] font-semibold tracking-[0.22em] text-primary">
              SECURECHAIN.AI
            </span>
            <span className="mt-1 font-display text-sm font-bold tracking-wide text-foreground">
              Bridge
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a className="text-foreground" href="/">
            Transfer
          </a>
          <a className="transition hover:text-foreground" href="/?tab=history">
            History
          </a>
          <a
            className="transition hover:text-foreground"
            href="https://securechain.ai/"
            target="_blank"
            rel="noreferrer"
          >
            Ecosystem
          </a>
          <a
            className="transition hover:text-foreground"
            href="https://explorer.securechain.ai"
            target="_blank"
            rel="noreferrer"
          >
            Explorer
          </a>
          <a
            className="transition hover:text-foreground"
            href="https://docs.securechain.ai"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </nav>

        <WalletBar />
      </div>
    </header>
  );
}
