import Link from "next/link";
import { Playground } from "@/components/playground";
import { collectionKeys, collections, getStats } from "@/lib/collections";
import { site } from "@/lib/site";

const example = `const res = await fetch("/api/v1/characters?role=protagonist");
const { meta, data } = await res.json();
// meta.total === 2, data[0].name === "Jason Duval"`;

export default function Home() {
  const stats = getStats();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid-fade pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-neon-pink/15 blur-[120px]" />

        <div className="container-x relative pb-14 pt-20 sm:pt-24">
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
            A free JSON API for <span className="neon-text">GTA VI</span> data.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-400">
            Characters, places, vehicles and more from Leonida, pulled from the trailers and Rockstar&apos;s site. Every entry
            says whether it&apos;s officially confirmed and where it came from. No key, no sign-up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/docs" className="btn-pink">
              Docs
            </Link>
            <Link href="/explore" className="btn-ghost">
              Browse the data
            </Link>
            <a href={site.repo} target="_blank" rel="noreferrer" className="btn border border-white/10 text-zinc-300 hover:bg-white/5">
              Source on GitHub
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <div className="card col-span-2 p-4">
              <dt className="text-xs uppercase tracking-widest text-zinc-500">Entries</dt>
              <dd className="mt-1 text-3xl font-black text-white">{stats.total}</dd>
              <dd className="text-xs text-zinc-400">
                <span className="text-neon-cyan">{stats.verified}</span> confirmed by Rockstar
              </dd>
            </div>
            {collectionKeys.map((key) => (
              <Link key={key} href={`/explore/${key}`} className="card group p-4 transition hover:border-neon-pink/50">
                <dt className="text-xs uppercase tracking-widest text-zinc-500 group-hover:text-neon-pink">
                  {collections[key].label}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-white">{stats.collections[key].total}</dd>
              </Link>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x py-10">
        <h2 className="mb-1 text-2xl font-bold text-white">Try a request</h2>
        <p className="mb-5 text-zinc-400">These hit the real endpoints. CORS is open, so the same calls work from your own site or bot.</p>
        <Playground />
      </section>

      <section className="container-x grid min-w-0 gap-8 py-10 lg:grid-cols-2">
        <div className="space-y-4 text-zinc-400">
          <h2 className="text-2xl font-bold text-white">How it works</h2>
          <p>
            The data is a handful of JSON files in the repo. A Zod schema checks every entry on each build and pull request,
            so a typo in a PR fails CI instead of breaking the API.
          </p>
          <p>
            Anything marked <code className="whitespace-nowrap text-neon-cyan">verified: true</code> is in an official trailer or on
            rockstargames.com. Everything else (most vehicle names, for example) is a community guess and is labelled as one.
            Pass <code className="whitespace-nowrap text-neon-cyan">?verified=true</code> if you only want the confirmed stuff.
          </p>
          <p>
            It&apos;s early: there&apos;s only so much you can know about a game from two trailers. If you spot something wrong
            or have a source for something missing, a PR is the fastest way to fix it.
          </p>
          <a href={`${site.repo}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="inline-block text-neon-pink hover:underline">
            How to contribute →
          </a>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Example</p>
          <pre className="code whitespace-pre-wrap break-words">{example}</pre>
        </div>
      </section>
    </>
  );
}
