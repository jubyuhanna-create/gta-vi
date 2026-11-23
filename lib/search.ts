import { z } from "zod";
import { collectionKeys, getCollection, isCollectionKey, type CollectionKey } from "@/lib/collections";
import { QueryError, scoreMatch } from "@/lib/query";

export const SearchQuerySchema = z.object({
  q: z.string().trim().min(2, "must be at least 2 characters").max(100),
  types: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return collectionKeys;
      const list = v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const invalid = list.filter((s) => !isCollectionKey(s));
      if (invalid.length) {
        ctx.addIssue({
          code: "custom",
          message: `unknown type(s): ${invalid.join(", ")}. Valid: ${collectionKeys.join(", ")}`,
        });
        return z.NEVER;
      }
      return list as CollectionKey[];
    }),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export interface SearchHit {
  id: string;
  name: string;
  type: CollectionKey;
  summary: string;
  verified: boolean;
  score: number;
  url: string;
}

export function parseSearchQuery(params: URLSearchParams) {
  const parsed = SearchQuerySchema.safeParse(Object.fromEntries(params));
  if (!parsed.success) {
    throw new QueryError("Invalid query parameters.", z.flattenError(parsed.error).fieldErrors);
  }
  return parsed.data;
}

/** Search every requested collection and group hits by collection, best match first. */
export function globalSearch(q: string, types: CollectionKey[], limitPerType: number) {
  const groups: Partial<Record<CollectionKey, { total: number; results: SearchHit[] }>> = {};
  let total = 0;

  for (const type of types) {
    const collection = getCollection(type);
    const hits: SearchHit[] = collection.items
      .map((item) => ({ item, score: scoreMatch(item, collection, q) }))
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
      .map(({ item, score }) => ({
        id: item.id,
        name: item.name,
        type,
        summary: collection.summary(item),
        verified: item.verified,
        score,
        url: `/api/v1/${collection.path}/${item.id}`,
      }));

    total += hits.length;
    if (hits.length) groups[type] = { total: hits.length, results: hits.slice(0, limitPerType) };
  }

  return { total, groups };
}
