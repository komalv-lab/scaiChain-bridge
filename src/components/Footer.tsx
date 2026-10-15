export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/80 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>Bridge.SecureChain.ai — part of the SecureChain AI ecosystem.</p>
        <div className="flex gap-5">
          <a
            className="hover:text-foreground"
            href="https://securechain.ai/"
            target="_blank"
            rel="noreferrer"
          >
            securechain.ai
          </a>
          <a
            className="hover:text-foreground"
            href="https://docs.securechain.ai"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
          <a
            className="hover:text-foreground"
            href="https://explorer.securechain.ai"
            target="_blank"
            rel="noreferrer"
          >
            Explorer
          </a>
        </div>
      </div>
    </footer>
  );
}
