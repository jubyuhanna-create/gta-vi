import { z } from "zod";
import { collectionKeys, collections } from "@/lib/collections";
import { API_VERSION } from "@/lib/http";
import { DEFAULT_LIMIT, MAX_LIMIT } from "@/lib/query";

const schemaName = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

/** Builds an OpenAPI 3.1 document straight from the Zod schemas, so docs never drift. */
export function buildOpenApi() {
  const schemas: Record<string, unknown> = {};
  for (const key of collectionKeys) {
    schemas[schemaName(key)] = z.toJSONSchema(collections[key].schema as z.ZodType, { io: "output" });
  }
  schemas.Meta = {
    type: "object",
    required: ["total", "version"],
    properties: {
      total: { type: "integer" },
      page: { type: "integer" },
      limit: { type: "integer" },
      totalPages: { type: "integer" },
      version: { type: "string", example: API_VERSION },
    },
  };
  schemas.Error = {
    type: "object",
    required: ["success", "meta", "error"],
    properties: {
      success: { const: false },
      meta: { $ref: "#/components/schemas/Meta" },
      error: {
        type: "object",
        properties: { code: { type: "string" }, message: { type: "string" }, details: {} },
      },
    },
  };

  const envelope = (data: unknown) => ({
    type: "object",
    required: ["success", "meta", "data"],
    properties: { success: { const: true }, meta: { $ref: "#/components/schemas/Meta" }, data },
  });
  const errorResponse = (description: string) => ({
    description,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  });

  const common = [
    { name: "search", in: "query", schema: { type: "string" }, description: "Full-text search (alias: q)." },
    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
    { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: MAX_LIMIT, default: DEFAULT_LIMIT } },
    { name: "sort", in: "query", schema: { type: "string", enum: ["name", "id"], default: "name" } },
    { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
    { name: "verified", in: "query", schema: { type: "string", enum: ["true", "false"] } },
  ];

  const paths: Record<string, unknown> = {};
  for (const key of collectionKeys) {
    const c = collections[key];
    const ref = { $ref: `#/components/schemas/${schemaName(key)}` };
    paths[`/api/v1/${c.path}`] = {
      get: {
        tags: [c.label],
        summary: `List ${c.label.toLowerCase()}`,
        description: c.description,
        parameters: [
          ...common,
          ...Object.keys(c.filters).map((f) => ({
            name: f,
            in: "query",
            schema: { type: "string" },
            description: "Case/slug-insensitive exact match. Comma-separate values for OR.",
          })),
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: envelope({ type: "array", items: ref }) } } },
          "400": errorResponse("Invalid query parameters"),
        },
      },
    };
    paths[`/api/v1/${c.path}/{id}`] = {
      get: {
        tags: [c.label],
        summary: `Get a single ${key} entry`,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: envelope(ref) } } },
          "404": errorResponse("Not found"),
        },
      },
    };
  }

  paths["/api/v1/search"] = {
    get: {
      tags: ["Search"],
      summary: "Global search across all datasets",
      parameters: [
        { name: "q", in: "query", required: true, schema: { type: "string", minLength: 2 } },
        { name: "types", in: "query", schema: { type: "string" }, description: `Comma-separated subset of: ${collectionKeys.join(", ")}` },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 }, description: "Max results per group." },
      ],
      responses: {
        "200": { description: "Results grouped by dataset", content: { "application/json": { schema: envelope({ type: "object" }) } } },
        "400": errorResponse("Invalid query parameters"),
      },
    },
  };
  paths["/api/v1"] = {
    get: { tags: ["Meta"], summary: "API overview and dataset statistics", responses: { "200": { description: "OK" } } },
  };

  return {
    openapi: "3.1.0",
    info: {
      title: "Leonida API — GTA VI Open Database",
      version: API_VERSION,
      description:
        "Free, open, read-only REST API for Grand Theft Auto VI data. Fan project — not affiliated with Rockstar Games or Take-Two Interactive.",
      license: { name: "MIT", identifier: "MIT" },
    },
    servers: [{ url: "/" }],
    paths,
    components: { schemas },
  };
}
