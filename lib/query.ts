import { z } from "zod";
import type { BaseItem, CollectionDefinition } from "@/lib/collections";

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Normalise a value for slug-insensitive comparison: "Sports Classic" === "sports-classic". */
export function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokenize(query: string): string[] {
  return query
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter(Boolean);
}

export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  search: z.string().trim().min(1).max(100).optional(),
  verified: z.enum(["true", "false"]).optional(),
  sort: z.enum(["name", "id"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type ListQuery = z.infer<typeof ListQuerySchema>;

export class QueryError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "QueryError";
  }
}

export function parseListQuery<T extends BaseItem>(
  params: URLSearchParams,
  collection: CollectionDefinition<T>,
): { query: ListQuery; filters: Record<string, string[]> } {
  const raw: Record<string, string> = {};
  const filters: Record<string, string[]> = {};
  const known = new Set(Object.keys(ListQuerySchema.shape));

  for (const [key, value] of params) {
    // `q` is accepted as an alias for `search`.
    const k = key === "q" ? "search" : key;
    if (known.has(k)) {
      raw[k] = value;
    } else if (k in collection.filters) {
      // Support both `?category=a,b` and `?category=a&category=b` (OR semantics).
      const values = value.split(",").map(normalize).filter(Boolean);
      filters[k] = [...(filters[k] ?? []), ...values];
    } else {
      const allowed = [...known, "q", ...Object.keys(collection.filters)].sort();
      throw new QueryError(`Unknown query parameter "${key}".`, { allowed });
    }
  }

  const parsed = ListQuerySchema.safeParse(raw);
  if (!parsed.success) {
    throw new QueryError("Invalid query parameters.", z.flattenError(parsed.error).fieldErrors);
  }
  return { query: parsed.data, filters };
}

/** Returns a relevance score (> 0 = match) for `item` against a free-text query. */
export function scoreMatch<T extends BaseItem>(
  item: T,
  collection: CollectionDefinition<T>,
  search: string,
): number {
  const tokens = tokenize(search);
  if (tokens.length === 0) return 0;

  const name = item.name.toLowerCase();
  const haystack = [item.id, ...collection.searchText(item)]
    .filter((v): v is string => typeof v === "string")
    .join(" \u0000 ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (!haystack.includes(token)) return 0; // every token must match somewhere
    score += name.includes(token) ? 10 : 1;
    // Small term-frequency bonus (capped) so the most "central" entry wins ties.
    score += Math.min(haystack.split(token).length - 1, 5);
  }
  const phrase = search.trim().toLowerCase();
  if (name === phrase) score += 100;
  else if (name.startsWith(phrase)) score += 25;
  return score;
}

export function applyListQuery<T extends BaseItem>(
  collection: CollectionDefinition<T>,
  query: ListQuery,
  filters: Record<string, string[]>,
) {
  let results = collection.items.filter((item) => {
    if (query.verified && String(item.verified) !== query.verified) return false;
    for (const [key, wanted] of Object.entries(filters)) {
      const accessor = collection.filters[key];
      if (!accessor) continue;
      const raw = accessor(item);
      const values = (Array.isArray(raw) ? raw : [raw])
        .filter((v): v is string => typeof v === "string")
        .map(normalize);
      if (!wanted.some((w) => values.includes(w))) return false;
    }
    return true;
  });

  if (query.search) {
    const scored = results
      .map((item) => ({ item, score: scoreMatch(item, collection, query.search!) }))
      .filter((r) => r.score > 0);
    // Relevance first, then the requested sort as tiebreaker.
    scored.sort((a, b) => b.score - a.score || compare(a.item, b.item, query));
    results = scored.map((r) => r.item);
  } else {
    results = [...results].sort((a, b) => compare(a, b, query));
  }

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const start = (query.page - 1) * query.limit;
  return {
    data: results.slice(start, start + query.limit),
    total,
    totalPages,
  };
}

function compare<T extends BaseItem>(a: T, b: T, query: ListQuery): number {
  const diff = a[query.sort].localeCompare(b[query.sort]);
  return query.order === "asc" ? diff : -diff;
}
