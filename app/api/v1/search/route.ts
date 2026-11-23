import { handle, ok, options } from "@/lib/http";
import { globalSearch, parseSearchQuery } from "@/lib/search";

export const GET = handle((req) => {
  const { q, types, limit } = parseSearchQuery(req.nextUrl.searchParams);
  const { total, groups } = globalSearch(q, types, limit);
  return ok(groups, { total, query: q, types, limit });
});

export const OPTIONS = options;
