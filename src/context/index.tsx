"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppKitProvider, type CreateAppKit } from "@reown/appkit/react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { projectId, wagmiAdapter } from "@/config";
import { networks, scaiMainnet } from "@/config/networks";

const queryClient = new QueryClient();

const appKitConfig = {
  adapters: [wagmiAdapter],
  projectId: projectId!,
  networks: [scaiMainnet, ...networks.slice(1)] as CreateAppKit["networks"],
  defaultNetwork: scaiMainnet,
  metadata: {
    name: "Bridge.SecureChain.ai",
    description:
      "Cross-chain bridge for the SecureChain AI ecosystem — move assets with security evidence close at hand.",
    url:
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://bridge.securechain.ai"),
    icons: ["https://securechain.ai/favicon.png"],
  },
  themeMode: "dark" as const,
  themeVariables: {
    "--apkt-accent": "#0A84FF",
    "--apkt-font-family": "Inter, sans-serif",
    "--apkt-border-radius-master": "8",
    "--apkt-color-mix": "#120E24",
    "--apkt-color-mix-strength": 28,
  },
  features: {
    analytics: true,
    email: false,
    socials: false as const,
  },
};

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <ClientAppKit>{children}</ClientAppKit>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function ClientAppKit({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return children;

  return (
    <AppKitProvider {...appKitConfig}>
      {children}
    </AppKitProvider>
  );
}
