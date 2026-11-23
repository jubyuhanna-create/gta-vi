import { NextResponse, type NextRequest } from "next/server";
import { getCollection, type CollectionKey } from "@/lib/collections";
import { applyListQuery, parseListQuery, QueryError } from "@/lib/query";

export const API_VERSION = "1.0.0";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

/**
 * Data only changes on deploy, so let Vercel's CDN cache aggressively and
 * serve stale while revalidating. Browsers revalidate after 5 minutes.
 */
export const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
  "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
} as const;

export interface Meta {
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  version: string;
  [key: string]: unknown;
}

export function ok<T>(data: T, meta: Omit<Meta, "version">, init?: { status?: number }) {
  return NextResponse.json(
    { success: true, meta: { ...meta, version: API_VERSION }, data },
    { status: init?.status ?? 200, headers: { ...CORS_HEADERS, ...CACHE_HEADERS } },
  );
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      meta: { version: API_VERSION },
      error: { code, message, ...(details !== undefined ? { details } : {}) },
    },
    {
      status,
      headers: {
        ...CORS_HEADERS,
        // Errors are cheap to recompute; cache them briefly only.
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    },
  );
}

export function options() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Wrap a handler so thrown QueryErrors become 400s and anything else a 500. */
export function handle(fn: (req: NextRequest) => Response | Promise<Response>) {
  return async (req: NextRequest) => {
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof QueryError) return fail(400, "BAD_REQUEST", err.message, err.details);
      console.error(err);
      return fail(500, "INTERNAL_ERROR", "Something went wrong.");
    }
  };
}

/** Route handlers for `GET /api/v1/<collection>`. */
export function listRoute(key: CollectionKey) {
  const c = getCollection(key);
  return {
    GET: handle((req) => {
      const { query, filters } = parseListQuery(req.nextUrl.searchParams, c);
      const { data, total, totalPages } = applyListQuery(c, query, filters);
      return ok(data, {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        ...(query.search ? { search: query.search } : {}),
        ...(Object.keys(filters).length ? { filters } : {}),
      });
    }),
    OPTIONS: options,
  };
}

/** Route handlers for `GET /api/v1/<collection>/[id]`. */
export function detailRoute(key: CollectionKey) {
  const collection = getCollection(key);
  return {
    GET: async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
      const { id } = await ctx.params;
      const item = collection.items.find((i) => i.id === id.toLowerCase());
      if (!item) {
        return fail(404, "NOT_FOUND", `No ${key} entry with id "${id}".`, {
          hint: `GET /api/v1/${collection.path} lists all valid ids.`,
        });
      }
      return ok(item, { total: 1 });
    },
    OPTIONS: options,
  };
}
