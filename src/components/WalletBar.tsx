"use client";

import { AppKitNetworkButton } from "@reown/appkit/react";
import { ConnectButton } from "./ConnectButton";

export function WalletBar() {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block [&_w3m-network-button]:scale-90 [&_appkit-network-button]:scale-90">
        <AppKitNetworkButton />
      </div>
      <ConnectButton />
    </div>
  );
}
