"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Wallet } from "lucide-react";
import { shortenAddress } from "@/lib/tokens";

export function ConnectButtonLive({
  label = "Connect Wallet",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  return (
    <button
      type="button"
      onClick={() => open()}
      className={`inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)] transition hover:brightness-110 ${className}`}
    >
      <Wallet className="h-4 w-4" />
      {isConnected && address ? shortenAddress(address) : label}
    </button>
  );
}
