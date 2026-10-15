"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import {
  useBalance,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import {
  ArrowDownUp,
  ChevronDown,
  Clock3,
  Info,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { networks } from "@/config/networks";
import {
  BRIDGE_ADDRESS,
  bridgeAbi,
  explorerAddressUrl,
  explorerTxUrl,
  isNativeSCAI,
  tokenAddressOnChain,
} from "@/lib/contracts";
import { addBridgeTransaction } from "@/lib/history";
import {
  ESTIMATED_MINUTES,
  assetLabel,
  destinationsFor,
  formatAmount,
  getToken,
  isValidPair,
  quoteReceive,
  tokensOnChain,
  type TokenId,
} from "@/lib/tokens";
import { ConnectButton } from "./ConnectButton";

function NetworkMark({ name }: { name: string }) {
  const letter = name.replace("SCAI ", "S").slice(0, 1).toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary ring-1 ring-primary/30">
      {letter}
    </span>
  );
}

export function BridgeCard({ onConfirmed }: { onConfirmed?: () => void }) {
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [fromId, setFromId] = useState<number>(34);
  const [toId, setToId] = useState<number>(1);
  const [tokenId, setTokenId] = useState<TokenId>("SCAI");
  const [amount, setAmount] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [step, setStep] = useState<"idle" | "approve" | "bridge">("idle");
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient({ chainId: fromId });

  const fromNetwork = networks.find((n) => n.id === fromId) ?? networks[0];
  const toNetwork = networks.find((n) => n.id === toId) ?? networks[1];
  const token = getToken(tokenId);
  const sourceTokens = tokensOnChain(fromId);
  const destChains = destinationsFor(tokenId, fromId);
  const fromNetworks = networks.filter((n) =>
    getToken(tokenId).chainIds.includes(n.id),
  );
  const toNetworks = networks.filter((n) => destChains.includes(n.id));

  const native = isNativeSCAI(tokenId, fromId);
  const inputToken = native ? undefined : tokenAddressOnChain(tokenId, fromId);
  const outputToken = tokenAddressOnChain(tokenId, toId);

  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: fromId,
    token: inputToken,
    query: { enabled: Boolean(address) },
  });

  const { data: allowance } = useReadContract({
    address: inputToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && inputToken ? [address as `0x${string}`, BRIDGE_ADDRESS] : undefined,
    chainId: fromId,
    query: { enabled: Boolean(address) && Boolean(inputToken) },
  });

  const { data: burnFee } = useReadContract({
    address: BRIDGE_ADDRESS,
    abi: bridgeAbi,
    functionName: "scaiBurnFeePercentage",
    chainId: fromId,
    query: { enabled: tokenId === "SCAI" },
  });

  const { data: pegFee } = useReadContract({
    address: BRIDGE_ADDRESS,
    abi: bridgeAbi,
    functionName: "peggedTokenFeePercentage",
    chainId: fromId,
    query: { enabled: tokenId === "USDT" },
  });

  const feePercent = Number(
    tokenId === "USDT" ? (pegFee ?? BigInt(5)) : (burnFee ?? BigInt(0)),
  );
  const parsedAmount = Number(amount);
  const receive = quoteReceive(parsedAmount, feePercent);
  const feeAmount = Number.isFinite(parsedAmount)
    ? Math.max(parsedAmount - receive, 0)
    : 0;
  const pairOk = isValidPair(tokenId, fromId, toId);
  const amountOk = parsedAmount > 0 && pairOk;
  const needsSwitch = isConnected && Number(chainId) !== fromId;
  const balanceOk =
    !balance || !amountOk ? true : parsedAmount <= Number(balance.formatted);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  });

  const status = useMemo(() => {
    if (!isConnected) return "connect" as const;
    if (needsSwitch) return "switch" as const;
    if (!pairOk) return "pair" as const;
    if (!amountOk) return "amount" as const;
    if (!balanceOk) return "balance" as const;
    if (isWriting || isConfirming || step !== "idle") return "pending" as const;
    return "ready" as const;
  }, [
    isConnected,
    needsSwitch,
    pairOk,
    amountOk,
    balanceOk,
    isWriting,
    isConfirming,
    step,
  ]);

  function applyFromChain(next: number) {
    setFromId(next);
    const available = tokensOnChain(next);
    const nextToken = available.some((t) => t.id === tokenId)
      ? tokenId
      : (available[0]?.id ?? "SCAI");
    setTokenId(nextToken);
    const dests = destinationsFor(nextToken, next);
    setToId(dests.includes(toId) ? toId : (dests[0] ?? 1));
  }

  function applyToken(next: TokenId) {
    setTokenId(next);
    const src = getToken(next).chainIds.includes(fromId)
      ? fromId
      : getToken(next).chainIds[0];
    if (src !== fromId) setFromId(src);
    const dests = destinationsFor(next, src);
    setToId(dests.includes(toId) && toId !== src ? toId : (dests[0] ?? src));
  }

  function flip() {
    const dests = destinationsFor(tokenId, toId);
    if (!dests.includes(fromId) && dests[0] !== undefined) {
      setFromId(toId);
      setToId(dests[0]);
      return;
    }
    setFromId(toId);
    setToId(fromId);
  }

  async function confirmBridge() {
    if (!address) return;
    setError(null);
    try {
      const value = parseUnits(amount, token.decimals);
      let hash: `0x${string}`;

      if (native) {
        setStep("bridge");
        hash = await writeContractAsync({
          address: BRIDGE_ADDRESS,
          abi: bridgeAbi,
          functionName: "coinIn",
          args: [BigInt(toId), outputToken],
          value,
          chainId: fromId,
        });
      } else {
        if (!inputToken) throw new Error("Missing token address");
        const currentAllowance = allowance ?? BigInt(0);
        if (currentAllowance < value) {
          setStep("approve");
          const approveHash = await writeContractAsync({
            address: inputToken,
            abi: erc20Abi,
            functionName: "approve",
            args: [BRIDGE_ADDRESS, value],
            chainId: fromId,
          });
          setTxHash(approveHash);
          if (publicClient) {
            await publicClient.waitForTransactionReceipt({ hash: approveHash });
          }
        }
        setStep("bridge");
        hash = await writeContractAsync({
          address: BRIDGE_ADDRESS,
          abi: bridgeAbi,
          functionName: "tokenIn",
          args: [inputToken, value, BigInt(toId), outputToken],
          chainId: fromId,
        });
      }

      setTxHash(hash);
      addBridgeTransaction({
        fromChain: fromNetwork.name,
        toChain: toNetwork.name,
        fromToken: token.symbol,
        toToken: token.symbol,
        sendAmount: formatAmount(parsedAmount),
        receiveAmount: formatAmount(receive),
        wallet: address,
        status: "pending",
        hash,
      });
      setReviewOpen(false);
      setAmount("");
      onConfirmed?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Transaction failed";
      setError(message.split("Version: viem")[0]?.trim() ?? message);
    } finally {
      setStep("idle");
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-card-border bg-card/80 p-5 shadow-[0_0_80px_hsl(var(--primary)/0.08)] backdrop-blur-md sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-primary">
              OFFICIAL PAIRS
            </p>
            <h2 className="mt-1 font-display text-xl font-bold tracking-wide">
              Transfer assets
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-accent-foreground ring-1 ring-primary/25">
            <ShieldCheck className="h-3.5 w-3.5" />
            5-chain SCAI + USDT
          </span>
        </div>

        <Lane
          label="From"
          chainId={fromId}
          chainOptions={fromNetworks}
          onChainChange={applyFromChain}
          tokenId={tokenId}
          tokens={sourceTokens}
          onTokenChange={applyToken}
          amount={amount}
          onAmountChange={setAmount}
          balanceLabel={
            balance
              ? `${formatAmount(Number(balance.formatted), 4)} ${balance.symbol}`
              : isConnected
                ? "—"
                : "Connect to see balance"
          }
          onMax={() => {
            if (balance) setAmount(balance.formatted);
          }}
        />

        <div className="relative z-10 -my-2 flex justify-center">
          <button
            type="button"
            onClick={flip}
            className="rounded-xl border border-border bg-secondary p-2 text-foreground transition hover:border-primary/50 hover:bg-accent"
            aria-label="Swap direction"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        <Lane
          label="To"
          chainId={toId}
          chainOptions={toNetworks}
          onChainChange={setToId}
          tokenId={tokenId}
          tokens={[token]}
          amount={amountOk ? formatAmount(receive) : "0"}
          readOnly
          hint={`Receive ${assetLabel(tokenId, toId)} on ${toNetwork.name}`}
        />

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm">
          <Row label="Pair" value={`${token.symbol} → ${token.symbol}`} />
          <Row
            label="On-chain fee"
            value={`${feePercent}% · ${formatAmount(feeAmount)} ${token.symbol}`}
          />
          <Row
            label="Bridge"
            value={
              <a
                className="text-accent-foreground hover:underline"
                href={explorerAddressUrl(fromId, BRIDGE_ADDRESS)}
                target="_blank"
                rel="noreferrer"
              >
                {BRIDGE_ADDRESS.slice(0, 6)}…{BRIDGE_ADDRESS.slice(-4)}
              </a>
            }
          />
          <Row
            label="Est. time"
            value={
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5 text-primary" />
                ~{ESTIMATED_MINUTES} min
              </span>
            }
          />
        </dl>

        <div className="mt-4">
          {status === "connect" && (
            <ConnectButton
              className="w-full justify-center py-3"
              label="Connect wallet to bridge"
            />
          )}
          {status === "switch" && (
            <button
              type="button"
              onClick={() => switchNetwork(fromNetwork)}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Switch to {fromNetwork.name}
            </button>
          )}
          {status === "pair" && (
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-secondary py-3 text-sm font-semibold text-muted-foreground"
            >
              Choose a supported destination
            </button>
          )}
          {status === "amount" && (
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-secondary py-3 text-sm font-semibold text-muted-foreground"
            >
              Enter an amount
            </button>
          )}
          {status === "balance" && (
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-secondary py-3 text-sm font-semibold text-muted-foreground"
            >
              Insufficient {token.symbol} balance
            </button>
          )}
          {status === "pending" && (
            <button
              type="button"
              disabled
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/80 py-3 text-sm font-semibold text-primary-foreground"
            >
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {step === "approve" ? "Approve in wallet…" : "Confirm in wallet…"}
            </button>
          )}
          {status === "ready" && (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.35)]"
            >
              Review bridge
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        {txHash && (
          <a
            className="mt-3 block text-xs text-accent-foreground hover:underline"
            href={explorerTxUrl(fromId, txHash)}
            target="_blank"
            rel="noreferrer"
          >
            {isSuccess ? "View confirmed tx" : "View pending tx"}: {txHash.slice(0, 10)}…
          </a>
        )}

        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          SCAI moves across SCAI Mainnet, Ethereum, BNB Chain, Polygon, and Base.
          USDT is BSC ↔ SCAI Mainnet only. Destination mint is completed by the
          bridge after your deposit.
        </p>
      </div>

      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold">Confirm transfer</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatAmount(parsedAmount)} {token.symbol} on {fromNetwork.name} →{" "}
              {formatAmount(receive)} {token.symbol} on {toNetwork.name}.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row
                label="You send"
                value={`${formatAmount(parsedAmount)} ${token.symbol}`}
              />
              <Row
                label="You receive"
                value={`${formatAmount(receive)} ${token.symbol}`}
              />
              <Row label="Method" value={native ? "coinIn" : "tokenIn"} />
            </dl>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBridge}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Confirm
              </button>
            </div>
            <div className="mt-3 flex justify-center">
              <ConnectButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Lane({
  label,
  chainId,
  chainOptions,
  onChainChange,
  tokenId,
  tokens,
  onTokenChange,
  amount,
  onAmountChange,
  balanceLabel,
  onMax,
  readOnly,
  hint,
}: {
  label: string;
  chainId: number;
  chainOptions: Array<(typeof networks)[number]>;
  onChainChange: (id: number) => void;
  tokenId: TokenId;
  tokens: ReturnType<typeof tokensOnChain>;
  onTokenChange?: (id: TokenId) => void;
  amount: string;
  onAmountChange?: (v: string) => void;
  balanceLabel?: string;
  onMax?: () => void;
  readOnly?: boolean;
  hint?: string;
}) {
  const network = chainOptions.find((n) => n.id === chainId) ??
    networks.find((n) => n.id === chainId);

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3.5">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {balanceLabel && <span>Bal: {balanceLabel}</span>}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
          <NetworkMark name={network?.name ?? "N"} />
          <select
            className="w-full min-w-0 appearance-none bg-transparent pr-6 text-sm font-medium outline-none"
            value={chainId}
            onChange={(e) => onChainChange(Number(e.target.value))}
          >
            {chainOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-muted-foreground" />
        </label>

        {onTokenChange && tokens.length > 1 ? (
          <label className="relative w-28 shrink-0">
            <select
              className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2.5 pr-7 text-sm font-semibold outline-none"
              value={tokenId}
              onChange={(e) => onTokenChange(e.target.value as TokenId)}
            >
              {tokens.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.symbol}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>
        ) : (
          <span className="w-24 shrink-0 rounded-lg border border-border bg-card px-3 py-2.5 text-center text-sm font-semibold">
            {getToken(tokenId).symbol}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
          inputMode="decimal"
          placeholder="0.0"
          readOnly={readOnly}
          value={amount}
          onChange={(e) => {
            const next = e.target.value.replace(/[^0-9.]/g, "");
            onAmountChange?.(next);
          }}
        />
        {onMax && (
          <button
            type="button"
            onClick={onMax}
            className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary"
          >
            MAX
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
