import { NextResponse } from "next/server";
import { CACHE_HEADERS, CORS_HEADERS, options } from "@/lib/http";
import { buildOpenApi } from "@/lib/openapi";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildOpenApi(), { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } });
}

export const OPTIONS = options;
