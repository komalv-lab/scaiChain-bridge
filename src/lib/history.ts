"use client";

import { useSyncExternalStore } from "react";
import { shortenAddress } from "./tokens";

export type TxStatus = "pending" | "completed" | "failed";

export type BridgeTransaction = {
  id: string;
  createdAt: number;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  sendAmount: string;
  receiveAmount: string;
  wallet: string;
  status: TxStatus;
  hash: string;
};

const STORAGE_KEY = "scai-bridge-tx-history-v2";

let records: BridgeTransaction[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function fakeHash() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function seed(): BridgeTransaction[] {
  const now = Date.now();
  const walletA = "0x8f21A9c0bE44d1aC3e91F4d9c7b2a1Ee90c4d001";
  const walletB = "0x4c77E2b18dA91Ff01e2c44a8d91Aa0bC90e11220";
  const rows: Array<Omit<BridgeTransaction, "id" | "hash">> = [
    {
      createdAt: now - 12 * 60 * 1000,
      fromChain: "Ethereum",
      toChain: "SCAI Mainnet",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "1,200",
      receiveAmount: "960",
      wallet: walletA,
      status: "completed",
    },
    {
      createdAt: now - 40 * 60 * 1000,
      fromChain: "SCAI Mainnet",
      toChain: "BNB Smart Chain",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "4,500",
      receiveAmount: "4,500",
      wallet: walletA,
      status: "pending",
    },
    {
      createdAt: now - 3 * 60 * 60 * 1000,
      fromChain: "BNB Smart Chain",
      toChain: "SCAI Mainnet",
      fromToken: "USDT",
      toToken: "USDT",
      sendAmount: "250",
      receiveAmount: "237.5",
      wallet: walletB,
      status: "completed",
    },
    {
      createdAt: now - 8 * 60 * 60 * 1000,
      fromChain: "Polygon",
      toChain: "Base",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "800",
      receiveAmount: "640",
      wallet: walletB,
      status: "completed",
    },
    {
      createdAt: now - 16 * 60 * 60 * 1000,
      fromChain: "Base",
      toChain: "Ethereum",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "320",
      receiveAmount: "256",
      wallet: walletA,
      status: "completed",
    },
    {
      createdAt: now - 28 * 60 * 60 * 1000,
      fromChain: "SCAI Mainnet",
      toChain: "BNB Smart Chain",
      fromToken: "USDT",
      toToken: "USDT",
      sendAmount: "90",
      receiveAmount: "85.5",
      wallet: walletB,
      status: "failed",
    },
    {
      createdAt: now - 40 * 60 * 60 * 1000,
      fromChain: "BNB Smart Chain",
      toChain: "Polygon",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "2,000",
      receiveAmount: "1,600",
      wallet: walletA,
      status: "completed",
    },
    {
      createdAt: now - 52 * 60 * 60 * 1000,
      fromChain: "Ethereum",
      toChain: "Base",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "75",
      receiveAmount: "60",
      wallet: walletB,
      status: "pending",
    },
    {
      createdAt: now - 70 * 60 * 60 * 1000,
      fromChain: "Polygon",
      toChain: "SCAI Mainnet",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "11,000",
      receiveAmount: "8,800",
      wallet: walletA,
      status: "completed",
    },
    {
      createdAt: now - 90 * 60 * 60 * 1000,
      fromChain: "BNB Smart Chain",
      toChain: "SCAI Mainnet",
      fromToken: "USDT",
      toToken: "USDT",
      sendAmount: "1,040",
      receiveAmount: "988",
      wallet: walletB,
      status: "completed",
    },
    {
      createdAt: now - 110 * 60 * 60 * 1000,
      fromChain: "SCAI Mainnet",
      toChain: "Ethereum",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "600",
      receiveAmount: "600",
      wallet: walletA,
      status: "completed",
    },
    {
      createdAt: now - 140 * 60 * 60 * 1000,
      fromChain: "Base",
      toChain: "Polygon",
      fromToken: "SCAI",
      toToken: "SCAI",
      sendAmount: "210",
      receiveAmount: "168",
      wallet: walletB,
      status: "completed",
    },
  ];

  return rows.map((row, index) => ({
    ...row,
    id: `seed-${index + 1}`,
    hash: fakeHash(),
  }));
}

let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BridgeTransaction[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        records = parsed;
        return;
      }
    }
  } catch {
    records = [];
  }
  records = seed();
  persist();
}

export function getHistorySnapshot() {
  load();
  return records;
}

export function subscribeHistory(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addBridgeTransaction(
  entry: Omit<BridgeTransaction, "id" | "hash" | "createdAt" | "status"> & {
    status?: TxStatus;
    hash?: string;
  },
) {
  const next: BridgeTransaction = {
    ...entry,
    id: crypto.randomUUID(),
    hash: entry.hash ?? fakeHash(),
    createdAt: Date.now(),
    status: entry.status ?? "pending",
  };
  records = [next, ...records];
  persist();
  emit();
  return next;
}

export function useBridgeHistory() {
  return useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    () => [] as BridgeTransaction[],
  );
}

export function formatTxTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function displayWallet(address: string) {
  return shortenAddress(address);
}
