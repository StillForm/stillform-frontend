import { WalletConnect } from "./wallet-connect";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              Tangible
            </span>
          </a>
          <nav className="flex items-center gap-6 text-sm">
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/explore"
            >
              Explore
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/creator/studio"
            >
              Create
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/profile"
            >
              Profile
            </a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
