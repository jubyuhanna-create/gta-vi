import { z } from "zod";
import vehiclesJson from "@/data/vehicles.json";
import locationsJson from "@/data/locations.json";
import charactersJson from "@/data/characters.json";
import weaponsJson from "@/data/weapons.json";
import radioJson from "@/data/radio-stations.json";
import collectiblesJson from "@/data/collectibles.json";
import {
  CharacterSchema,
  CollectibleSchema,
  LocationSchema,
  RadioStationSchema,
  VehicleSchema,
  WeaponSchema,
} from "@/lib/schemas";

/** Accessor returning the value(s) a query filter is matched against. */
type FilterAccessor<T> = (item: T) => string | null | undefined | (string | null | undefined)[];

/** Fields every dataset entry has (see BaseEntry in lib/schemas.ts). */
export interface BaseItem {
  id: string;
  name: string;
  verified: boolean;
  source: string;
  sourceUrl?: string;
}

export interface CollectionDefinition<T extends BaseItem> {
  /** URL segment under /api/v1 (e.g. `radio`). */
  path: string;
  /** Source file in /data. */
  file: string;
  label: string;
  description: string;
  schema: z.ZodType<T>;
  items: T[];
  /** Fields concatenated into the full-text search index. */
  searchText: (item: T) => (string | null | undefined)[];
  /** Exact-match (slug-insensitive) query-param filters, e.g. `?category=muscle`. */
  filters: Record<string, FilterAccessor<T>>;
  /** Short one-line summary used in global search results. */
  summary: (item: T) => string;
}

function parseDataset<T>(file: string, schema: z.ZodType<T>, raw: unknown): T[] {
  const result = z.array(schema).safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid dataset data/${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

function define<T extends BaseItem>(
  def: Omit<CollectionDefinition<T>, "items"> & { raw: unknown },
): CollectionDefinition<T> {
  const { raw, ...rest } = def;
  const items = parseDataset(def.file, def.schema, raw).sort((a, b) => a.name.localeCompare(b.name));
  return { ...rest, items };
}

export const collections = {
  vehicles: define({
    path: "vehicles",
    file: "vehicles.json",
    label: "Vehicles",
    description: "Cars, bikes, boats and aircraft spotted across Leonida.",
    schema: VehicleSchema,
    raw: vehiclesJson,
    searchText: (v) => [v.name, v.manufacturer, v.category, v.realWorldInspiration, v.description, ...v.customizationNotes],
    filters: {
      category: (v) => v.category,
      manufacturer: (v) => v.manufacturer,
      appearance: (v) => v.trailerAppearances,
    },
    summary: (v) => `${v.manufacturer} · ${v.category}`,
  }),
  locations: define({
    path: "locations",
    file: "locations.json",
    label: "Locations",
    description: "Regions, cities, districts and landmarks of the state of Leonida.",
    schema: LocationSchema,
    raw: locationsJson,
    searchText: (l) => [l.name, l.type, l.region, l.description, l.realWorldInspiration, ...l.landmarks],
    filters: {
      region: (l) => l.region,
      type: (l) => l.type,
      appearance: (l) => l.trailerAppearances,
    },
    summary: (l) => `${l.type}${l.region && l.region !== l.id ? ` · ${l.region}` : ""}`,
  }),
  characters: define({
    path: "characters",
    file: "characters.json",
    label: "Characters",
    description: "Protagonists Lucia and Jason plus the supporting cast.",
    schema: CharacterSchema,
    raw: charactersJson,
    searchText: (c) => [c.name, c.role, c.bio, ...c.affiliation],
    filters: {
      role: (c) => c.role,
      affiliation: (c) => c.affiliation,
      location: (c) => c.homeLocation,
    },
    summary: (c) => c.role,
  }),
  weapons: define({
    path: "weapons",
    file: "weapons.json",
    label: "Weapons",
    description: "Firearms, throwables and melee weapons.",
    schema: WeaponSchema,
    raw: weaponsJson,
    searchText: (w) => [w.name, w.category, w.ammoType, w.description],
    filters: {
      category: (w) => w.category,
      ammo: (w) => w.ammoType,
    },
    summary: (w) => `${w.category} · ${w.ammoType}`,
  }),
  radio: define({
    path: "radio",
    file: "radio-stations.json",
    label: "Radio",
    description: "Radio stations, trailer soundtracks and notable tracks.",
    schema: RadioStationSchema,
    raw: radioJson,
    searchText: (r) => [
      r.name,
      r.genre,
      r.host,
      r.vibe,
      ...r.notableTracks.flatMap((t) => [t.title, t.artist]),
    ],
    filters: {
      genre: (r) => r.genre,
      type: (r) => r.type,
    },
    summary: (r) => `${r.type === "soundtrack" ? "Soundtrack" : "Station"} · ${r.genre}`,
  }),
  collectibles: define({
    path: "collectibles",
    file: "collectibles.json",
    label: "Collectibles",
    description: "Collectibles, hobbies and side activities.",
    schema: CollectibleSchema,
    raw: collectiblesJson,
    searchText: (c) => [c.name, c.category, c.region, c.description, c.reward],
    filters: {
      category: (c) => c.category,
      region: (c) => c.region,
    },
    summary: (c) => `${c.category}${c.region ? ` · ${c.region}` : ""}`,
  }),
};

export type Collections = typeof collections;
export type CollectionKey = keyof Collections;
export type CollectionItem<K extends CollectionKey> = Collections[K]["items"][number];

export const collectionKeys = Object.keys(collections) as CollectionKey[];

/** Type-erased access to a collection, for code that works across all datasets. */
export type AnyCollection = CollectionDefinition<BaseItem & Record<string, unknown>>;

export function getCollection(key: CollectionKey): AnyCollection {
  return collections[key] as unknown as AnyCollection;
}

export function isCollectionKey(value: string): value is CollectionKey {
  return Object.prototype.hasOwnProperty.call(collections, value);
}

export function getStats() {
  const perCollection = Object.fromEntries(
    collectionKeys.map((key) => {
      const items = getCollection(key).items;
      return [key, { total: items.length, verified: items.filter((i) => i.verified).length }];
    }),
  ) as Record<CollectionKey, { total: number; verified: number }>;

  const total = Object.values(perCollection).reduce((sum, c) => sum + c.total, 0);
  const verified = Object.values(perCollection).reduce((sum, c) => sum + c.verified, 0);
  return { total, verified, collections: perCollection };
}
