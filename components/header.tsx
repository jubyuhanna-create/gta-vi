import Link from "next/link";
import { site } from "@/lib/site";

const nav = [
  { href: "/docs", label: "Docs" },
  { href: "/explore", label: "Explore" },
  { href: "/api/v1", label: "API" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/80 backdrop-blur">
      <div className="container-x flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-sunset text-xs font-black text-ink">L</span>
          <span>
            Leonida<span className="text-neon-pink">API</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white">
              {item.label}
            </Link>
          ))}
          <a href={site.repo} target="_blank" rel="noreferrer" className="btn-ghost ml-2 hidden !py-1.5 sm:inline-flex">
            ★ Star on GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
