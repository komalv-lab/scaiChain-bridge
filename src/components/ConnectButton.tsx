"use client";

import dynamic from "next/dynamic";

export const ConnectButton = dynamic(
  () => import("./ConnectButtonLive").then((mod) => mod.ConnectButtonLive),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground opacity-80"
      >
        Connect Wallet
      </button>
    ),
  },
);
