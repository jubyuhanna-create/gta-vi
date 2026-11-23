"use client";

import { useCallback, useEffect, useState } from "react";

const PRESETS = [
  "/api/v1",
  "/api/v1/vehicles?category=muscle&limit=5",
  "/api/v1/locations?type=region",
  "/api/v1/characters/lucia-caminos",
  "/api/v1/weapons?search=rifle",
  "/api/v1/radio?type=soundtrack",
  "/api/v1/search?q=vice",
];

export function Playground({ initial = "/api/v1/vehicles?limit=3" }: { initial?: string }) {
  const [path, setPath] = useState(initial);
  const [body, setBody] = useState<string>("");
  const [status, setStatus] = useState<{ code: number; ms: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (target: string) => {
    if (!target.startsWith("/api/")) {
      setBody('// Paths must start with "/api/"');
      setStatus(null);
      return;
    }
    setLoading(true);
    const started = performance.now();
    try {
      const res = await fetch(target, { headers: { accept: "application/json" } });
      const json = await res.json();
      setStatus({ code: res.status, ms: Math.round(performance.now() - started) });
      setBody(JSON.stringify(json, null, 2));
    } catch (err) {
      setStatus(null);
      setBody(`// Request failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void run(initial);
  }, [initial, run]);

  return (
    <div className="card overflow-hidden shadow-neon-cyan">
      <form
        className="flex flex-col gap-2 border-b border-white/10 p-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void run(path.trim());
        }}
      >
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3">
          <span className="method">GET</span>
          <input
            aria-label="API path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            spellCheck={false}
            className="w-full bg-transparent py-2 font-mono text-sm text-white outline-none"
          />
        </div>
        <button type="submit" className="btn-pink" disabled={loading}>
          {loading ? "Sending…" : "Send ▶"}
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPath(p);
              void run(p);
            }}
            className="rounded-md border border-white/10 px-2 py-1 font-mono text-[11px] text-zinc-400 transition hover:border-neon-pink/60 hover:text-neon-pink"
          >
            {p.replace("/api/v1", "") || "/"}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-3 text-xs text-zinc-500">
        <span>Response</span>
        {status && (
          <span>
            <span className={status.code < 400 ? "text-neon-cyan" : "text-neon-pink"}>{status.code}</span> · {status.ms} ms
          </span>
        )}
      </div>
      <pre className="m-3 mt-2 max-h-[420px] overflow-auto rounded-lg bg-black/60 p-4 font-mono text-[12.5px] leading-relaxed text-zinc-300">
        {body || "…"}
      </pre>
    </div>
  );
}
