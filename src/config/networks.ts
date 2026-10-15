import { defineChain } from "@reown/appkit/networks";
import { base, bsc, mainnet, polygon } from "@reown/appkit/networks";

export const scaiMainnet = defineChain({
  id: 34,
  caipNetworkId: "eip155:34",
  chainNamespace: "eip155",
  name: "SCAI Mainnet",
  nativeCurrency: {
    name: "SecureChain AI",
    symbol: "SCAI",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.scai.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "SCAI Explorer",
      url: "https://explorer.securechain.ai",
    },
  },
});

export const networks = [scaiMainnet, mainnet, bsc, polygon, base] as const;

export type SupportedNetwork = (typeof networks)[number];
