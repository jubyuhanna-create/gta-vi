import Link from "next/link";
import { Playground } from "@/components/playground";
import { collectionKeys, collections, getStats } from "@/lib/collections";
import { site } from "@/lib/site";

const snippets = {
  curl: `curl "https://YOUR-DEPLOYMENT/api/v1/vehicles?category=muscle&limit=5"`,
  js: `const res = await fetch("https://YOUR-DEPLOYMENT/api/v1/search?q=vice");
const { data, meta } = await res.json();

console.log(meta.total, data.locations?.results);`,
  discord: `// discord.js slash command: /gta character lucia-caminos
const { data } = await fetch(\`\${API}/api/v1/characters/\${id}\`).then(r => r.json());
await interaction.reply(\`**\${data.name}** — \${data.role}\\n\${data.bio}\`);`,
};

export default function Home() {
  const stats = getStats();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid-fade pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-neon-pink/20 blur-[120px]" />
        <div className="pointer-events-none absolute -top-20 right-0 h-[300px] w-[500px] rounded-full bg-neon-cyan/10 blur-[100px]" />

        <div className="container-x relative pb-16 pt-20 sm:pt-28">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-pink/40 bg-neon-pink/10 px-3 py-1 text-xs font-medium text-neon-pink">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-pink" />
            v1.0 · Open source · No API key required
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            The open <span className="neon-text">GTA VI</span> database
            <br className="hidden sm:block" /> for <span className="glow-cyan text-neon-cyan">Leonida</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/docs" className="btn-pink">
              Read the docs →
            </Link>
            <Link href="/explore" className="btn-ghost">
              Explore the data
            </Link>
            <a href={site.repo} target="_blank" rel="noreferrer" className="btn border border-white/10 text-zinc-300 hover:bg-white/5">
              ★ Star on GitHub
            </a>
          </div>

          {/* Stats */}
          <dl className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <div className="card col-span-2 p-4">
              <dt className="text-xs uppercase tracking-widest text-zinc-500">Total entries</dt>
              <dd className="mt-1 text-3xl font-black text-white">{stats.total}</dd>
              <dd className="text-xs text-neon-cyan">{stats.verified} verified by official sources</dd>
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

      {/* Playground */}
      <section className="container-x py-12">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Try it <span className="text-neon-pink">live</span>
            </h2>
            <p className="mt-1 text-zinc-400">Hit the real API from your browser. CORS is open — call it from anywhere.</p>
          </div>
          <Link href="/docs" className="text-sm text-neon-cyan hover:underline">
            Full endpoint reference →
          </Link>
        </div>
        <Playground />
      </section>

      {/* Features */}
      <section className="container-x grid gap-4 py-12 md:grid-cols-3">
        {[
          {
            title: "Zod-validated data",
            body: "Every JSON entry is checked against a strict schema plus cross-reference rules. Broken PRs fail CI — never production.",
            accent: "text-neon-pink",
          },
          {
            title: "Edge-cached & free",
            body: "Plain JSON files, zero database. Deploys to Vercel in one click and serves from the CDN with stale-while-revalidate.",
            accent: "text-neon-cyan",
          },
          {
            title: "Credibility built in",
            body: "Every entry carries `verified` and `source`, so your app can show only officially confirmed facts — or everything.",
            accent: "text-neon-purple",
          },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className={`text-lg font-bold ${f.accent}`}>{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Snippets */}
      <section className="container-x py-12">
        <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
          Build <span className="text-neon-cyan">anything</span>
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["cURL", snippets.curl],
            ["JavaScript", snippets.js],
            ["Discord bot", snippets.discord],
          ].map(([title, code]) => (
            <div key={title} className="card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{title}</p>
              <pre className="code whitespace-pre-wrap break-all">{code}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* Contribute */}
      <section className="container-x py-12">
        <div className="card relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neon-pink/20 blur-3xl" />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Spotted something in Leonida?</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Add a vehicle, fix a bio, or verify a rumor with a source. Edit a JSON file in <code className="text-neon-cyan">/data</code>,
            run <code className="text-neon-cyan">npm run validate</code>, and open a pull request. That&apos;s it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`${site.repo}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="btn-pink">
              Contribution guide
            </a>
            <a href={`${site.repo}/tree/main/data`} target="_blank" rel="noreferrer" className="btn-ghost">
              Browse /data
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
