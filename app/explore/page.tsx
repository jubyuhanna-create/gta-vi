import Link from "next/link";
import type { Metadata } from "next";
import { collectionKeys, collections, getStats } from "@/lib/collections";

export const metadata: Metadata = { title: "Explore", description: "Browse every dataset in the Leonida API." };

export default function ExplorePage() {
  const stats = getStats();
  return (
    <div className="container-x py-14">
      <h1 className="text-3xl font-black text-white sm:text-4xl">
        Explore <span className="neon-text">Leonida</span>
      </h1>
      <p className="mt-2 text-zinc-400">Every dataset, rendered straight from the JSON in /data.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collectionKeys.map((key) => {
          const c = collections[key];
          const s = stats.collections[key];
          return (
            <Link key={key} href={`/explore/${key}`} className="card group p-6 transition hover:border-neon-pink/50 hover:shadow-neon-pink">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-bold text-white group-hover:text-neon-pink">{c.label}</h2>
                <span className="font-mono text-sm text-zinc-500">{s.total}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{c.description}</p>
              <p className="mt-4 font-mono text-xs text-neon-cyan">/api/v1/{c.path}</p>
              <p className="mt-1 text-xs text-zinc-500">{s.verified} verified · {s.total - s.verified} unconfirmed</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
