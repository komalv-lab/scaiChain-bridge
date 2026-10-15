import { zeroAddress, type Address } from "viem";

export const BRIDGE_ADDRESS =
  "0xBaa99A874716A10D3F22F42dDa75822ca60A37c1" as const;

export const SCAI_ERC20 =
  "0xC93134162FBE458B9D73ae25437041B335Cad911" as const;

export const USDT_BSC =
  "0x55d398326f99059fF775485246999027B3197955" as const;

export const USDT_SCAI =
  "0x7e94a7e1527a96f0c00760Df670772C9d027a573" as const;

export const CHAIN = {
  SCAI: 34,
  ETHEREUM: 1,
  BSC: 56,
  POLYGON: 137,
  BASE: 8453,
} as const;

export const BRIDGE_CHAIN_IDS = [
  CHAIN.SCAI,
  CHAIN.ETHEREUM,
  CHAIN.BSC,
  CHAIN.POLYGON,
  CHAIN.BASE,
] as const;

export const EXPLORERS: Record<number, string> = {
  [CHAIN.SCAI]: "https://explorer.securechain.ai",
  [CHAIN.ETHEREUM]: "https://etherscan.io",
  [CHAIN.BSC]: "https://bscscan.com",
  [CHAIN.POLYGON]: "https://polygonscan.com",
  [CHAIN.BASE]: "https://basescan.org",
};

export const bridgeAbi = [
  {
    type: "function",
    name: "coinIn",
    stateMutability: "payable",
    inputs: [
      { name: "outputChainID", type: "uint256" },
      { name: "outputCurrency", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "tokenIn",
    stateMutability: "nonpayable",
    inputs: [
      { name: "inputTokenAddress", type: "address" },
      { name: "tokenAmount", type: "uint256" },
      { name: "outputChainID", type: "uint256" },
      { name: "outputTokenAddress", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "peggedTokenFeePercentage",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "scaiBurnFeePercentage",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "bridgeStatus",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
] as const;

export function tokenAddressOnChain(
  token: "SCAI" | "USDT",
  chainId: number,
): Address {
  if (token === "SCAI") {
    return chainId === CHAIN.SCAI ? zeroAddress : SCAI_ERC20;
  }
  if (chainId === CHAIN.BSC) return USDT_BSC;
  if (chainId === CHAIN.SCAI) return USDT_SCAI;
  throw new Error("USDT is only available on BSC and SCAI Mainnet");
}

export function isNativeSCAI(token: "SCAI" | "USDT", chainId: number) {
  return token === "SCAI" && chainId === CHAIN.SCAI;
}

export function explorerTxUrl(chainId: number, hash: string) {
  const base = EXPLORERS[chainId] ?? EXPLORERS[CHAIN.SCAI];
  return `${base}/tx/${hash}`;
}

export function explorerAddressUrl(chainId: number, address: string) {
  const base = EXPLORERS[chainId] ?? EXPLORERS[CHAIN.SCAI];
  return `${base}/address/${address}`;
}
