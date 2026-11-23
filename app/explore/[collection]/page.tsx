import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Tag, VerifiedBadge } from "@/components/badge";
import { collectionKeys, collections, getCollection, isCollectionKey } from "@/lib/collections";
import { scoreMatch } from "@/lib/query";

type Params = { collection: string };
type Search = { q?: string; verified?: string };

export function generateStaticParams() {
  return collectionKeys.map((collection) => ({ collection }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { collection } = await params;
  if (!isCollectionKey(collection)) return {};
  return { title: collections[collection].label, description: collections[collection].description };
}

type AnyItem = ReturnType<typeof getCollection>["items"][number];

function primaryText(item: AnyItem): string {
  return String(item.description ?? item.bio ?? item.vibe ?? "");
}

function tags(item: AnyItem): string[] {
  const keys = ["category", "type", "role", "manufacturer", "genre", "ammoType", "region", "reward"];
  const out = keys.map((k) => item[k]).filter((v): v is string => typeof v === "string" && v.length > 0);
  if (typeof item.estimatedTopSpeedMph === "number") out.push(`~${item.estimatedTopSpeedMph} mph`);
  return [...new Set(out)];
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { collection } = await params;
  const { q = "", verified } = await searchParams;
  if (!isCollectionKey(collection)) notFound();

  const def = getCollection(collection);
  let items = def.items;
  if (verified === "true" || verified === "false") items = items.filter((i) => String(i.verified) === verified);
  if (q.trim()) items = items.filter((i) => scoreMatch(i, def, q) > 0);

  return (
    <div className="container-x py-14">
      <Link href="/explore" className="text-sm text-zinc-500 hover:text-neon-cyan">
        ← All datasets
      </Link>
      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">{def.label}</h1>
          <p className="mt-1 text-zinc-400">{def.description}</p>
        </div>
        <a href={`/api/v1/${def.path}?limit=100`} className="font-mono text-sm text-neon-cyan hover:underline">
          GET /api/v1/{def.path} ↗
        </a>
      </div>

      <form className="mt-6 flex flex-col gap-2 sm:flex-row" action={`/explore/${collection}`}>
        <input
          name="q"
          defaultValue={q}
          placeholder={`Search ${def.label.toLowerCase()}…`}
          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-neon-pink/60"
        />
        <select
          name="verified"
          defaultValue={verified ?? ""}
          className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-zinc-300"
        >
          <option value="">All entries</option>
          <option value="true">Verified only</option>
          <option value="false">Unconfirmed only</option>
        </select>
        <button className="btn-pink" type="submit">
          Filter
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-500">{items.length} result(s)</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} id={item.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-white">{item.name}</h2>
              <VerifiedBadge verified={item.verified} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags(item).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{primaryText(item)}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs">
              <span className="text-zinc-500">
                Source:{" "}
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-zinc-400 underline decoration-dotted hover:text-neon-cyan">
                    {item.source}
                  </a>
                ) : (
                  <span className="text-zinc-400">{item.source}</span>
                )}
              </span>
              <a href={`/api/v1/${def.path}/${item.id}`} className="font-mono text-neon-pink hover:underline">
                /{item.id}
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
