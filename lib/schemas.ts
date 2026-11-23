import { z } from "zod";

/**
 * Zod schemas for every dataset in /data.
 *
 * These schemas are the contract for contributors: `npm run validate` (and the
 * production build) fail if any JSON entry doesn't match. Keep them strict so
 * typos never reach the public API.
 */

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const Slug = z
  .string()
  .regex(SLUG_REGEX, "must be a lowercase kebab-case slug, e.g. `vice-city`");

/** Official/public materials an entry can be sourced from. */
export const Appearance = z.enum([
  "Trailer 1",
  "Trailer 2",
  "Official Website",
  "Official Screenshots",
  "Gameplay",
]);

/** Fields shared by every entry in every dataset. */
const BaseEntry = z.object({
  id: Slug,
  name: z.string().min(1).max(120),
  /** `true` only when confirmed by official Rockstar Games material. */
  verified: z.boolean(),
  /** Human-readable provenance, e.g. "Rockstar Games — GTA VI Trailer 2 (May 2025)". */
  source: z.string().min(3).max(300),
  /** Optional link to the primary source. */
  sourceUrl: z.url().optional(),
});

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

export const VehicleCategory = z.enum([
  "Super",
  "Sports",
  "Sports Classic",
  "Muscle",
  "Coupe",
  "Sedan",
  "SUV",
  "Off-Road",
  "Compact",
  "Van",
  "Truck",
  "Bikes",
  "Emergency",
  "Boat",
  "Aircraft",
  "Helicopter",
]);

export const VehicleSchema = BaseEntry.extend({
  category: VehicleCategory,
  /** In-universe manufacturer (Bravado, Declasse, Pegassi, ...). */
  manufacturer: z.string().min(1),
  /** Real-world vehicle the design appears to be based on. */
  realWorldInspiration: z.string().optional(),
  /** Estimated top speed in mph; `null` when no reasonable estimate exists. */
  estimatedTopSpeedMph: z.number().int().positive().max(400).nullable(),
  description: z.string().min(10),
  customizationNotes: z.array(z.string().min(3)).default([]),
  trailerAppearances: z.array(Appearance).default([]),
}).strict();

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export const LocationType = z.enum([
  "region",
  "city",
  "town",
  "district",
  "island-chain",
  "wetlands",
  "national-park",
  "landmark",
  "facility",
]);

export const LocationSchema = BaseEntry.extend({
  type: LocationType,
  /** Slug of the top-level region this location belongs to (a `type: "region"` entry). */
  region: Slug.nullable(),
  description: z.string().min(10),
  /**
   * Approximate relative map position on a 0–100 grid
   * (x: west → east, y: north → south). Community estimates, not game units.
   */
  coordinates: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
  landmarks: z.array(z.string().min(2)).default([]),
  realWorldInspiration: z.string().optional(),
  trailerAppearances: z.array(Appearance).default([]),
}).strict();

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

export const CharacterRole = z.enum(["Protagonist", "Supporting", "Antagonist", "Minor"]);

export const CharacterSchema = BaseEntry.extend({
  role: CharacterRole,
  affiliation: z.array(z.string().min(2)).default([]),
  bio: z.string().min(20),
  /** Slug of the location most associated with the character. */
  homeLocation: Slug.nullable(),
  relationships: z
    .array(
      z.object({
        characterId: Slug,
        relation: z.string().min(2),
      }).strict(),
    )
    .default([]),
  trailerAppearances: z.array(Appearance).default([]),
}).strict();

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

export const WeaponCategory = z.enum([
  "Handgun",
  "Shotgun",
  "SMG",
  "Assault Rifle",
  "Sniper Rifle",
  "Machine Gun",
  "Heavy",
  "Throwable",
  "Melee",
]);

export const WeaponSchema = BaseEntry.extend({
  category: WeaponCategory,
  ammoType: z.string().min(2),
  description: z.string().min(10),
  trailerAppearances: z.array(Appearance).default([]),
}).strict();

// ---------------------------------------------------------------------------
// Radio
// ---------------------------------------------------------------------------

export const TrackSchema = z
  .object({
    title: z.string().min(1),
    artist: z.string().min(1),
    /** `true` when the track is confirmed in official GTA VI material. */
    verified: z.boolean(),
    /** Where the track was heard, e.g. "Trailer 1" or "GTA Vice City (2002)". */
    context: z.string().min(2),
  })
  .strict();

export const RadioType = z.enum(["station", "soundtrack"]);

export const RadioStationSchema = BaseEntry.extend({
  type: RadioType,
  genre: z.string().min(2),
  host: z.string().nullable(),
  vibe: z.string().min(10),
  notableTracks: z.array(TrackSchema).default([]),
}).strict();

// ---------------------------------------------------------------------------
// Collectibles & activities
// ---------------------------------------------------------------------------

export const CollectibleCategory = z.enum([
  "Collectible",
  "Side Activity",
  "Mini-Game",
  "Hobby",
  "Social",
]);

export const CollectibleSchema = BaseEntry.extend({
  category: CollectibleCategory,
  /** Slug of a location (usually a region); `null` = map-wide or unknown. */
  region: Slug.nullable(),
  description: z.string().min(10),
  reward: z.string().min(2),
  trailerAppearances: z.array(Appearance).default([]),
}).strict();

export type Vehicle = z.infer<typeof VehicleSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Weapon = z.infer<typeof WeaponSchema>;
export type RadioStation = z.infer<typeof RadioStationSchema>;
export type Collectible = z.infer<typeof CollectibleSchema>;
