import type { ReactNode } from "react";
import { ArrowRight, Radar, Server, Shield } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TransferPanel } from "@/components/TransferPanel";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-grid">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:py-16">
        <section className="flex-1 pt-2">
          <p className="font-display text-xs font-semibold tracking-[0.28em] text-primary">
            BRIDGE.SECURECHAIN.AI
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-bold leading-tight tracking-wide sm:text-5xl">
            Move assets across chains. Keep security close at hand.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Official bridge pairs: SCAI across SCAI Mainnet, Ethereum, BNB
            Chain, Polygon, and Base — plus USDT from BNB Chain to SCAI
            Mainnet. Connect, deposit, then track it in history.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Feature
              icon={<Server className="h-4 w-4" />}
              title="EVM standard"
              body="Same Solidity tooling. SCAI Mainnet is chain ID 34."
            />
            <Feature
              icon={<Radar className="h-4 w-4" />}
              title="Inspectable"
              body="Routes stay transparent — evidence, not a black box."
            />
            <Feature
              icon={<Shield className="h-4 w-4" />}
              title="Wallet-first"
              body="Reown AppKit for WalletConnect, injected, and more."
            />
          </div>

          <a
            href="https://securechain.ai/"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent-foreground hover:text-primary"
          >
            Explore the ecosystem
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <section className="flex w-full justify-center lg:min-w-0 lg:flex-1 lg:justify-end">
          <TransferPanel />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
