import { BRIDGE_CHAIN_IDS, CHAIN, tokenAddressOnChain } from "./contracts";

export type TokenId = "SCAI" | "USDT";

export type Token = {
  id: TokenId;
  symbol: string;
  name: string;
  decimals: number;
  chainIds: number[];
};

export const TOKENS: Token[] = [
  {
    id: "SCAI",
    symbol: "SCAI",
    name: "SecureChain AI",
    decimals: 18,
    chainIds: [...BRIDGE_CHAIN_IDS],
  },
  {
    id: "USDT",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 18,
    chainIds: [CHAIN.BSC, CHAIN.SCAI],
  },
];

export const FEE_BPS_FALLBACK = 0;
export const ESTIMATED_MINUTES = 3;

export function getToken(tokenId: TokenId) {
  return TOKENS.find((token) => token.id === tokenId) ?? TOKENS[0];
}

export function tokensOnChain(chainId: number) {
  return TOKENS.filter((token) => token.chainIds.includes(chainId));
}

export function destinationsFor(tokenId: TokenId, fromChainId: number) {
  return getToken(tokenId).chainIds.filter((id) => id !== fromChainId);
}

export function isValidPair(
  tokenId: TokenId,
  fromChainId: number,
  toChainId: number,
) {
  if (fromChainId === toChainId) return false;
  const token = getToken(tokenId);
  return (
    token.chainIds.includes(fromChainId) && token.chainIds.includes(toChainId)
  );
}

export function quoteReceive(amount: number, feePercent: number) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const pct = Number.isFinite(feePercent) ? Math.max(feePercent, 0) : 0;
  return amount * (1 - pct / 100);
}

export function formatAmount(value: number, digits = 6) {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (value < 0.000001) return "<0.000001";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function shortenAddress(address: string) {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function assetLabel(tokenId: TokenId, chainId: number) {
  const token = getToken(tokenId);
  if (tokenId === "SCAI" && chainId === CHAIN.SCAI) return "SCAI (native)";
  return token.symbol;
}

export function tokenContract(tokenId: TokenId, chainId: number) {
  return tokenAddressOnChain(tokenId, chainId);
}
