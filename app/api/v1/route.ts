import { collectionKeys, collections, getStats } from "@/lib/collections";
import { ok, options } from "@/lib/http";

export const dynamic = "force-static";

export function GET() {
  const stats = getStats();
  const endpoints = [
    { method: "GET", path: "/api/v1", description: "API overview, routes and dataset statistics." },
    ...collectionKeys.flatMap((key) => {
      const c = collections[key];
      const params = ["search", "page", "limit", "sort", "order", "verified", ...Object.keys(c.filters)];
      return [
        {
          method: "GET",
          path: `/api/v1/${c.path}`,
          description: `List ${c.label.toLowerCase()}. ${c.description}`,
          params,
        },
        { method: "GET", path: `/api/v1/${c.path}/{id}`, description: `Fetch a single ${key} entry by id.` },
      ];
    }),
    {
      method: "GET",
      path: "/api/v1/search",
      description: "Global search across all datasets, grouped by type.",
      params: ["q", "types", "limit"],
    },
    { method: "GET", path: "/api/v1/openapi.json", description: "OpenAPI 3.1 specification." },
  ];

  return ok(
    {
      name: "Leonida API",
      description:
        "The open GTA VI database & REST API. Community-maintained, Zod-validated data for Leonida. Not affiliated with Rockstar Games or Take-Two Interactive.",
      docs: "/docs",
      repository: "https://github.com/jubyuhanna-create/gta-vi",
      stats,
      endpoints,
    },
    { total: stats.total },
  );
}

export const OPTIONS = options;
