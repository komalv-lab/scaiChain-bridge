import { useMemo, useState } from "react";
import {
  ArrowDownUp, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown,
  CircleHelp, Clock3, Copy, Flame, Gauge, LockKeyhole,
  Network, ShieldCheck, Wallet, X,
} from "lucide-react";
import "./_group.css";

const networks = [
  { name: "BNB Chain", code: "BSC", color: "#e6ae3a", mark: "B" },
  { name: "Ethereum", code: "ETH", color: "#9aa9cb", mark: "Ξ" },
  { name: "Polygon", code: "POL", color: "#a879ec", mark: "P" },
  { name: "Base", code: "BASE", color: "#5a9eff", mark: "B" },
  { name: "Optimism", code: "OP", color: "#ff6468", mark: "O" },
  { name: "Arbitrum", code: "ARB", color: "#83a8c8", mark: "A" },
  { name: "Avalanche", code: "AVAX", color: "#ee696d", mark: "A" },
  { name: "SCAI Network", code: "SCAI", color: "#e5a741", mark: "S" },
];

export function BridgeTransfer() {
  const [from, setFrom] = useState("BSC");
  const [to, setTo] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [review, setReview] = useState(false);
  const [copied, setCopied] = useState(false);
  const source = networks.find((n) => n.code === from)!;
  const destination = networks.find((n) => n.code === to)!;
  const numericAmount = Number(amount) || 0;
  const validAmount = numericAmount >= 5000;
  const receive = useMemo(() => (numericAmount * 0.98).toLocaleString(undefined, { maximumFractionDigits: 4 }), [numericAmount]);

  const swap = () => { setFrom(to); setTo(from); };
  const connect = () => {
    if (wallet || connecting) return;
    setConnecting(true);
    window.setTimeout(() => { setConnecting(false); setWallet(true); }, 800);
  };
  const copyAddress = async () => {
    try { await navigator.clipboard.writeText("0x84c2...a91f"); } catch { /* clipboard can be unavailable in preview */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="sc-shell">
      <div className="sc-grid-texture" aria-hidden="true" />
      <header className="sc-header">
        <div className="sc-brand">
          <div className="sc-brand-mark"><ShieldCheck size={19} strokeWidth={1.8} /></div>
          <div><div className="sc-brand-name">SCAI<span>BRIDGE</span></div><div className="sc-brand-caption">SECURECHAIN AI</div></div>
        </div>
        <nav className="sc-nav" aria-label="Main navigation"><button className="active">Bridge</button><button disabled>Transfer history <span className="sc-soon">SOON</span></button></nav>
        <div className="sc-header-right"><span className="sc-network-status"><i /> All systems operational</span><button className={`sc-wallet-top ${wallet ? "connected" : ""}`} onClick={wallet ? copyAddress : connect}><Wallet size={15} />{connecting ? "Connecting…" : wallet ? <>{copied ? "Copied" : "0x84c2…a91f"} <Copy size={13} /></> : "Connect wallet"}</button></div>
      </header>

      <section className="sc-intro">
        <div className="sc-eyebrow"><span className="sc-eyebrow-line" /> CROSS-CHAIN SETTLEMENT <span className="sc-eyebrow-line" /></div>
        <h1>Move value.<br /><em>Keep control.</em></h1>
        <p>Lightning fast SCAI transfers, secured across eight networks.</p>
      </section>

      <section className="sc-stats" aria-label="Live SCAI network statistics">
        <div className="sc-stat"><span className="sc-stat-icon burn"><Flame size={15} /></span><div><small>TOTAL BURNED</small><strong>24,387,978 <b>SCAI</b></strong></div></div>
        <div className="sc-stat-separator" />
        <div className="sc-stat"><span className="sc-stat-icon price"><ArrowUpRight size={15} /></span><div><small>SCAI PRICE</small><strong>$0.000697</strong></div></div>
        <div className="sc-stat-separator" />
        <div className="sc-live"><i /> LIVE <span>NETWORK DATA</span></div>
      </section>

      <div className="sc-workspace">
        <section className="sc-transfer-card">
          <div className="sc-card-heading">
            <div><div className="sc-section-kicker">NEW TRANSFER <span>01 / 02</span></div><h2>Bridge assets</h2></div>
            <button className="sc-help" aria-label="About bridging" title="Your transfer is verified before it is submitted."><CircleHelp size={17} /></button>
          </div>

          <div className="sc-network-fields">
            <label className="sc-field-label" htmlFor="from-network">FROM NETWORK</label>
            <div className="sc-network-select-wrap">
              <span className="sc-chain-icon" style={{ "--chain-color": source.color } as React.CSSProperties}>{source.mark}</span>
              <select id="from-network" value={from} onChange={(e) => { setFrom(e.target.value); if (e.target.value === to) setTo(from); }}>
                {networks.map((n) => <option key={n.code} value={n.code}>{n.name}</option>)}
              </select><ChevronDown className="sc-select-chevron" size={16} />
              <span className="sc-network-code">{source.code}</span>
            </div>
            <div className="sc-swap-row"><span /><button className="sc-swap" onClick={swap} aria-label="Swap source and destination networks"><ArrowDownUp size={16} /></button><span /></div>
            <label className="sc-field-label" htmlFor="to-network">TO NETWORK</label>
            <div className="sc-network-select-wrap">
              <span className="sc-chain-icon" style={{ "--chain-color": destination.color } as React.CSSProperties}>{destination.mark}</span>
              <select id="to-network" value={to} onChange={(e) => { setTo(e.target.value); if (e.target.value === from) setFrom(to); }}>
                {networks.map((n) => <option key={n.code} value={n.code}>{n.name}</option>)}
              </select><ChevronDown className="sc-select-chevron" size={16} />
              <span className="sc-network-code">{destination.code}</span>
            </div>
          </div>

          <div className="sc-amount-head"><label className="sc-field-label" htmlFor="transfer-amount">YOU SEND</label><span>Balance <b>{wallet ? "18,420.00" : "—"} SCAI</b></span></div>
          <div className={`sc-amount-box ${amount && !validAmount ? "invalid" : ""}`}>
            <div className="sc-amount-input-row"><input id="transfer-amount" type="number" min="0" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} aria-describedby="amount-note" /><div className="sc-token-pill"><span className="sc-token-logo">S</span> SCAI</div></div>
            <div className="sc-amount-foot"><span id="amount-note">{amount && !validAmount ? "Minimum transfer is 5,000 SCAI" : "Minimum transfer · 5,000 SCAI"}</span><button onClick={() => wallet ? setAmount("18420") : connect()}>MAX</button></div>
          </div>

          <div className="sc-estimate">
            <div className="sc-estimate-label"><span>ESTIMATED RECEIVE</span><span className="sc-estimate-badge"><Check size={11} /> AFTER BURN</span></div>
            <div className="sc-estimate-value"><strong>{numericAmount ? receive : "—"}</strong><span>SCAI</span></div>
            <div className="sc-estimate-note"><span><Flame size={13} /> 2% protocol burn</span><span>{numericAmount ? `${(numericAmount * 0.02).toLocaleString(undefined, { maximumFractionDigits: 4 })} SCAI` : "—"}</span></div>
          </div>

          <button className={`sc-primary-action ${wallet && validAmount ? "ready" : ""}`} onClick={() => wallet ? validAmount && setReview(true) : connect()} disabled={wallet && !validAmount}>
            {connecting ? <><span className="sc-button-loader" /> Establishing secure connection…</> : wallet ? validAmount ? <>Review transfer <ArrowRight size={16} /></> : <>Enter at least 5,000 SCAI <ArrowRight size={16} /></> : <><Wallet size={16} /> Connect wallet</>}
          </button>
          <div className="sc-secure-note"><LockKeyhole size={12} /> Non-custodial · You remain in control</div>
        </section>

        <aside className="sc-route-panel">
          <div className="sc-route-top"><div><div className="sc-section-kicker">ROUTE INTELLIGENCE</div><h2>Transfer route</h2></div><span className="sc-route-live"><i /> VERIFIED</span></div>
          <div className="sc-route-visual">
            <div className="sc-route-node"><span className="sc-chain-icon large" style={{ "--chain-color": source.color } as React.CSSProperties}>{source.mark}</span><div><small>SOURCE</small><strong>{source.name}</strong></div><span className="sc-node-code">{source.code}</span></div>
            <div className="sc-route-connector"><span className="sc-route-line" /><span className="sc-route-mid"><Network size={14} /></span><span className="sc-route-line" /></div>
            <div className="sc-route-node"><span className="sc-chain-icon large" style={{ "--chain-color": destination.color } as React.CSSProperties}>{destination.mark}</span><div><small>DESTINATION</small><strong>{destination.name}</strong></div><span className="sc-node-code">{destination.code}</span></div>
          </div>
          <div className="sc-route-details">
            <div className="sc-detail-row"><span><Clock3 size={14} /> Estimated time</span><strong>~ 30 seconds</strong></div>
            <div className="sc-detail-row"><span><Flame size={14} /> Burn mechanism</span><strong>2% · permanent</strong></div>
            <div className="sc-detail-row"><span><Gauge size={14} /> Network fee</span><strong>Paid on source chain</strong></div>
          </div>
          <div className="sc-confidence">
            <div className="sc-confidence-icon"><ShieldCheck size={17} /></div>
            <div><strong>Route verified</strong><p>Bridge contracts are monitored by SecureChain AI.</p></div>
            <Check className="sc-confidence-check" size={15} />
          </div>
          <div className="sc-network-strip"><span>SUPPORTED NETWORKS</span><div>{networks.map((n) => <div key={n.code} className="sc-mini-chain" title={n.name} style={{ "--chain-color": n.color } as React.CSSProperties}>{n.mark}</div>)}</div><button onClick={() => document.getElementById("from-network")?.focus()}>8 networks <ArrowRight size={12} /></button></div>
        </aside>
      </div>

      <footer className="sc-footer"><span>SECURECHAIN AI <span className="sc-footer-dot">/</span> BRIDGE PROTOCOL</span><span><LockKeyhole size={11} /> AUDITED ROUTES <span className="sc-footer-dot">·</span> NON-CUSTODIAL</span><span>TRANSFER ROUTE · LIVE</span></footer>

      {review && <div className="sc-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setReview(false); }}><section className="sc-review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
        <button className="sc-modal-close" onClick={() => setReview(false)} aria-label="Close"><X size={18} /></button>
        <div className="sc-review-mark"><ShieldCheck size={23} /></div><div className="sc-section-kicker">TRANSFER REVIEW <span>02 / 02</span></div><h2 id="review-title">Ready to bridge</h2><p className="sc-review-sub">Review the route and amounts before continuing to your wallet.</p>
        <div className="sc-review-route"><span className="sc-chain-icon" style={{ "--chain-color": source.color } as React.CSSProperties}>{source.mark}</span><strong>{source.name}</strong><ArrowRight size={15} /><span className="sc-chain-icon" style={{ "--chain-color": destination.color } as React.CSSProperties}>{destination.mark}</span><strong>{destination.name}</strong></div>
        <div className="sc-review-amount"><span>YOU SEND</span><strong>{numericAmount.toLocaleString()} <small>SCAI</small></strong></div><div className="sc-review-amount receive"><span>ESTIMATED RECEIVE</span><strong>{receive} <small>SCAI</small></strong></div>
        <div className="sc-review-warning"><Flame size={14} /><span>2% burn ({(numericAmount * .02).toLocaleString(undefined, { maximumFractionDigits: 4 })} SCAI) is applied permanently. Network gas is paid separately.</span></div>
        <button className="sc-primary-action ready" onClick={() => setReview(false)}>Confirm in wallet <ArrowUpRight size={16} /></button>
        <button className="sc-review-back" onClick={() => setReview(false)}><ArrowLeft size={13} /> Back to transfer</button>
      </section></div>}
    </main>
  );
}
