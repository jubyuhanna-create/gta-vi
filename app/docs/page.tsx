import type { Metadata } from "next";
import Link from "next/link";
import { collectionKeys, collections } from "@/lib/collections";
import { API_VERSION } from "@/lib/http";
import { DEFAULT_LIMIT, MAX_LIMIT } from "@/lib/query";

export const metadata: Metadata = {
  title: "Docs",
  description: "Endpoint reference for the Leonida API (GTA VI open database).",
};

const envelope = `{
  "success": true,
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "version": "${API_VERSION}"
  },
  "data": [ ... ]
}`;

const errorEnvelope = `{
  "success": false,
  "meta": { "version": "${API_VERSION}" },
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid query parameters.",
    "details": { "limit": ["Too big: expected number to be <=100"] }
  }
}`;

const searchExample = `GET /api/v1/search?q=vice&types=locations,radio&limit=5

{
  "success": true,
  "meta": { "total": 8, "query": "vice", "types": ["locations", "radio"], "limit": 5, "version": "${API_VERSION}" },
  "data": {
    "locations": {
      "total": 5,
      "results": [
        { "id": "vice-city", "name": "Vice City", "type": "locations",
          "summary": "region", "verified": true, "score": 40, "url": "/api/v1/locations/vice-city" }
      ]
    },
    "radio": { "total": 3, "results": [ ... ] }
  }
}`;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-white/5 py-10">
      <h2 className="mb-4 text-2xl font-bold text-white">
        <a href={`#${id}`} className="hover:text-neon-pink">
          {title}
        </a>
      </h2>
      <div className="space-y-4 text-zinc-400">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-[200px_1fr]">
      <aside className="hidden lg:block">
        <nav className="sticky top-20 space-y-1 text-sm">
          {[
            ["overview", "Overview"],
            ["envelope", "Response envelope"],
            ["querying", "Filtering & pagination"],
            ["endpoints", "Endpoints"],
            ["search", "Global search"],
            ["errors", "Errors"],
            ["caching", "CORS & caching"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded px-2 py-1 text-zinc-500 hover:bg-white/5 hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <article className="min-w-0">
        <h1 className="text-4xl font-black text-white">
          API <span className="neon-text">Reference</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Version <span className="font-mono text-neon-cyan">{API_VERSION}</span> · Base path{" "}
          <span className="font-mono text-neon-cyan">/api/v1</span> · Read-only · No authentication
        </p>

        <Section id="overview" title="Overview">
          <p>
            Leonida API is a free, read-only JSON API for Grand Theft Auto VI. All data lives in version-controlled JSON
            files and is validated with Zod at build time. Every entry includes <code className="text-neon-cyan">verified</code>{" "}
            (confirmed by official Rockstar material) and <code className="text-neon-cyan">source</code>.
          </p>
          <p>
            A machine-readable <a className="text-neon-pink hover:underline" href="/api/v1/openapi.json">OpenAPI 3.1 spec</a>{" "}
            is generated from the same schemas — import it into Postman, Insomnia or a client generator.
          </p>
        </Section>

        <Section id="envelope" title="Response envelope">
          <p>Every successful response uses the same shape. Single-entry endpoints return an object in <code>data</code>.</p>
          <pre className="code">{envelope}</pre>
        </Section>

        <Section id="querying" title="Filtering, search & pagination">
          <p>All list endpoints accept these query parameters:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-2 pr-4">Param</th>
                  <th className="py-2 pr-4">Default</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["search / q", "—", "Full-text search. Every word must match; results ranked by relevance."],
                  ["page", "1", "Page number (1-based)."],
                  ["limit", String(DEFAULT_LIMIT), `Items per page, max ${MAX_LIMIT}.`],
                  ["sort", "name", "name | id"],
                  ["order", "asc", "asc | desc"],
                  ["verified", "—", "true | false — only officially confirmed (or unconfirmed) entries."],
                ].map(([p, d, desc]) => (
                  <tr key={p}>
                    <td className="py-2 pr-4 font-mono text-neon-cyan">{p}</td>
                    <td className="py-2 pr-4 font-mono">{d}</td>
                    <td className="py-2">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Dataset-specific filters (below) are case- and slug-insensitive: <code>?category=sports-classic</code> and{" "}
            <code>?category=Sports%20Classic</code> are equivalent. Comma-separate values for OR:{" "}
            <code>?category=muscle,super</code>. Unknown parameters return <code>400</code> so typos never fail silently.
          </p>
        </Section>

        <Section id="endpoints" title="Endpoints">
          <div className="card divide-y divide-white/5">
            <EndpointRow path="/api/v1" desc="API overview, routes and dataset statistics." />
            {collectionKeys.map((key) => {
              const c = collections[key];
              return (
                <div key={key}>
                  <EndpointRow
                    path={`/api/v1/${c.path}`}
                    desc={c.description}
                    filters={Object.keys(c.filters)}
                    example={`/api/v1/${c.path}?limit=5`}
                  />
                  <EndpointRow
                    path={`/api/v1/${c.path}/{id}`}
                    desc={`Single entry by id, e.g. ${c.items[0]?.id ?? "…"}`}
                    example={`/api/v1/${c.path}/${c.items[0]?.id ?? ""}`}
                  />
                </div>
              );
            })}
            <EndpointRow path="/api/v1/search?q=" desc="Global search grouped by dataset." example="/api/v1/search?q=vice" />
            <EndpointRow path="/api/v1/openapi.json" desc="OpenAPI 3.1 document." example="/api/v1/openapi.json" />
          </div>
        </Section>

        <Section id="search" title="Global search">
          <p>
            <code>q</code> (required, ≥ 2 chars), <code>types</code> (comma-separated subset of{" "}
            <code>{collectionKeys.join(", ")}</code>) and <code>limit</code> (results per group, default 10, max 50).
            Only groups with matches are returned; <code>meta.total</code> counts all hits.
          </p>
          <pre className="code">{searchExample}</pre>
        </Section>

        <Section id="errors" title="Errors">
          <p>
            Errors share an envelope with <code>success: false</code>. Status codes: <code>400</code> invalid params,{" "}
            <code>404</code> unknown id, <code>500</code> unexpected.
          </p>
          <pre className="code">{errorEnvelope}</pre>
        </Section>

        <Section id="caching" title="CORS & caching">
          <p>
            All responses send <code>Access-Control-Allow-Origin: *</code>, so you can call the API directly from browsers,
            bots and serverless functions. Responses are cached at the edge for 24h with a 7-day{" "}
            <code>stale-while-revalidate</code> window; data only changes on deploy.
          </p>
          <p>
            Want to self-host? <Link href="/" className="text-neon-pink hover:underline">Deploy your own copy to Vercel</Link>{" "}
            in one click — no database required.
          </p>
        </Section>
      </article>
    </div>
  );
}

function EndpointRow({ path, desc, filters, example }: { path: string; desc: string; filters?: string[]; example?: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-2">
          <span className="method">GET</span>
          <code className="break-all text-sm text-white">{path}</code>
        </p>
        <p className="mt-1 text-sm text-zinc-500">{desc}</p>
        {filters && filters.length > 0 && (
          <p className="mt-1 text-xs text-zinc-500">
            Filters:{" "}
            {filters.map((f) => (
              <code key={f} className="mr-1.5 text-neon-cyan">
                {f}
              </code>
            ))}
          </p>
        )}
      </div>
      {example && (
        <a href={example} className="shrink-0 font-mono text-xs text-neon-pink hover:underline">
          try ↗
        </a>
      )}
    </div>
  );
}
