import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as index } from "@/app/api/v1/route";
import { GET as listVehicles, OPTIONS } from "@/app/api/v1/vehicles/route";
import { GET as getVehicle } from "@/app/api/v1/vehicles/[id]/route";
import { GET as listLocations } from "@/app/api/v1/locations/route";
import { GET as search } from "@/app/api/v1/search/route";
import { GET as openapi } from "@/app/api/v1/openapi.json/route";

const req = (path: string) => new NextRequest(new URL(path, "http://localhost"));
const json = async (res: Response) => (await res.json()) as any;

describe("GET /api/v1", () => {
  it("returns overview with stats and endpoints", async () => {
    const res = index();
    const body = await json(res);
    expect(body.success).toBe(true);
    expect(body.meta.version).toBe("1.0.0");
    expect(body.data.stats.total).toBeGreaterThan(0);
    expect(body.data.endpoints.length).toBeGreaterThan(10);
  });
});

describe("list endpoints", () => {
  it("returns the envelope with CORS and cache headers", async () => {
    const res = await listVehicles(req("/api/v1/vehicles"));
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    const body = await json(res);
    expect(body).toMatchObject({ success: true, meta: { page: 1, limit: 20, version: "1.0.0" } });
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("filters by category (slug-insensitive)", async () => {
    const body = await json(await listVehicles(req("/api/v1/vehicles?category=MUSCLE")));
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((v: any) => v.category === "Muscle")).toBe(true);
    const multi = await json(await listVehicles(req("/api/v1/vehicles?category=muscle,bikes")));
    expect(multi.meta.total).toBeGreaterThan(body.meta.total);
  });

  it("paginates", async () => {
    const p1 = await json(await listVehicles(req("/api/v1/vehicles?limit=2&page=1")));
    const p2 = await json(await listVehicles(req("/api/v1/vehicles?limit=2&page=2")));
    expect(p1.data).toHaveLength(2);
    expect(p1.meta.totalPages).toBe(Math.ceil(p1.meta.total / 2));
    expect(p1.data[0].id).not.toBe(p2.data[0].id);
  });

  it("searches and ranks by relevance", async () => {
    const body = await json(await listVehicles(req("/api/v1/vehicles?search=banshee")));
    expect(body.data[0].id).toBe("bravado-banshee");
  });

  it("filters locations by region", async () => {
    const body = await json(await listLocations(req("/api/v1/locations?region=vice-city")));
    expect(body.data.length).toBeGreaterThan(1);
    expect(body.data.every((l: any) => l.region === "vice-city")).toBe(true);
  });

  it("filters by verified", async () => {
    const body = await json(await listLocations(req("/api/v1/locations?verified=true")));
    expect(body.data.every((l: any) => l.verified)).toBe(true);
  });

  it("rejects invalid and unknown params with 400", async () => {
    const bad = await listVehicles(req("/api/v1/vehicles?limit=1000"));
    expect(bad.status).toBe(400);
    expect((await json(bad)).success).toBe(false);
    const unknown = await listVehicles(req("/api/v1/vehicles?colour=red"));
    expect(unknown.status).toBe(400);
  });

  it("answers CORS preflight", () => {
    const res = OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });
});

describe("detail endpoints", () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

  it("returns a single entry", async () => {
    const body = await json(await getVehicle(req("/api/v1/vehicles/bravado-banshee"), ctx("bravado-banshee")));
    expect(body.data.name).toBe("Bravado Banshee");
    expect(body.meta.total).toBe(1);
  });

  it("returns 404 for unknown ids", async () => {
    const res = await getVehicle(req("/api/v1/vehicles/nope"), ctx("nope"));
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe("NOT_FOUND");
  });
});

describe("GET /api/v1/search", () => {
  it("groups results by collection", async () => {
    const body = await json(await search(req("/api/v1/search?q=vice")));
    expect(body.success).toBe(true);
    expect(body.data.locations.results[0].id).toBe("vice-city");
    expect(body.data.locations.results[0].score).toBeGreaterThanOrEqual(body.data.locations.results.at(-1).score);
    expect(body.meta.total).toBeGreaterThan(0);
  });

  it("restricts to types", async () => {
    const body = await json(await search(req("/api/v1/search?q=vice&types=locations")));
    expect(Object.keys(body.data)).toEqual(["locations"]);
  });

  it("validates q and types", async () => {
    expect((await search(req("/api/v1/search?q=a"))).status).toBe(400);
    expect((await search(req("/api/v1/search?q=vice&types=cars"))).status).toBe(400);
  });
});

describe("GET /api/v1/openapi.json", () => {
  it("generates a valid-looking OpenAPI document", async () => {
    const body = await json(openapi());
    expect(body.openapi).toBe("3.1.0");
    expect(body.paths["/api/v1/vehicles"]).toBeDefined();
    expect(body.components.schemas.Vehicles.properties.category.enum).toContain("Muscle");
  });
});
