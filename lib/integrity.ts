import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import {
  CharacterSchema,
  CollectibleSchema,
  LocationSchema,
  RadioStationSchema,
  VehicleSchema,
  WeaponSchema,
} from "@/lib/schemas";

/**
 * Data integrity checks shared by `npm run validate` and the test-suite.
 * Reads the JSON from disk (rather than importing it) so it reports precise,
 * file-level errors that are friendly to first-time contributors.
 */

export const DATASETS = {
  "vehicles.json": VehicleSchema,
  "locations.json": LocationSchema,
  "characters.json": CharacterSchema,
  "weapons.json": WeaponSchema,
  "radio-stations.json": RadioStationSchema,
  "collectibles.json": CollectibleSchema,
} as const;

export type DatasetFile = keyof typeof DATASETS;

export interface IntegrityReport {
  errors: string[];
  counts: Record<string, number>;
}

export function checkIntegrity(dataDir = path.join(process.cwd(), "data")): IntegrityReport {
  const errors: string[] = [];
  const counts: Record<string, number> = {};
  const parsed: Partial<Record<DatasetFile, Array<Record<string, unknown>>>> = {};

  for (const [file, schema] of Object.entries(DATASETS) as [DatasetFile, z.ZodType][]) {
    const fullPath = path.join(dataDir, file);
    let json: unknown;
    try {
      json = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (err) {
      errors.push(`${file}: could not read/parse JSON — ${(err as Error).message}`);
      continue;
    }
    if (!Array.isArray(json)) {
      errors.push(`${file}: top-level value must be an array`);
      continue;
    }

    const ok: Array<Record<string, unknown>> = [];
    json.forEach((entry, index) => {
      const label = `${file}[${index}]${entry && typeof entry === "object" && "id" in entry ? ` (id: "${String(entry.id)}")` : ""}`;
      const result = schema.safeParse(entry);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const at = issue.path.length ? issue.path.join(".") : "(entry)";
          errors.push(`${label} → ${at}: ${issue.message}`);
        }
      } else {
        ok.push(result.data as Record<string, unknown>);
      }
    });

    // Unique ids & names within a dataset.
    const seenIds = new Map<string, number>();
    json.forEach((entry, index) => {
      const id = entry && typeof entry === "object" ? (entry as { id?: unknown }).id : undefined;
      if (typeof id !== "string") return;
      if (seenIds.has(id)) errors.push(`${file}: duplicate id "${id}" at indexes ${seenIds.get(id)} and ${index}`);
      else seenIds.set(id, index);
    });

    parsed[file] = ok;
    counts[file] = json.length;
  }

  // Cross-references.
  const locations = parsed["locations.json"] ?? [];
  const locationIds = new Set(locations.map((l) => l.id as string));
  const regionIds = new Set(locations.filter((l) => l.type === "region").map((l) => l.id as string));
  const characterIds = new Set((parsed["characters.json"] ?? []).map((c) => c.id as string));

  for (const loc of locations) {
    const region = loc.region as string | null;
    if (region && !regionIds.has(region)) {
      errors.push(`locations.json (id: "${loc.id}") → region: "${region}" is not a location with type "region"`);
    }
    if (loc.type === "region" && region !== loc.id) {
      errors.push(`locations.json (id: "${loc.id}") → region: a region's "region" must equal its own id`);
    }
  }

  for (const c of parsed["characters.json"] ?? []) {
    const home = c.homeLocation as string | null;
    if (home && !locationIds.has(home)) {
      errors.push(`characters.json (id: "${c.id}") → homeLocation: unknown location "${home}"`);
    }
    for (const rel of (c.relationships as { characterId: string }[]) ?? []) {
      if (!characterIds.has(rel.characterId)) {
        errors.push(`characters.json (id: "${c.id}") → relationships: unknown character "${rel.characterId}"`);
      }
      if (rel.characterId === c.id) {
        errors.push(`characters.json (id: "${c.id}") → relationships: a character cannot relate to itself`);
      }
    }
  }

  for (const c of parsed["collectibles.json"] ?? []) {
    const region = c.region as string | null;
    if (region && !locationIds.has(region)) {
      errors.push(`collectibles.json (id: "${c.id}") → region: unknown location "${region}"`);
    }
  }

  return { errors, counts };
}
