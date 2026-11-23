# Contributing to Leonida API

Thanks for helping build the open GTA VI database! Most contributions are **data edits** — you don't need to touch any TypeScript.

## TL;DR

1. Fork the repo and edit a file in [`/data`](./data).
2. Run `npm install && npm run validate`.
3. Open a pull request using the template. CI re-runs validation, typecheck, tests and a production build.

## Ground rules for data

| Rule | Why |
| --- | --- |
| **`verified: true` only with an official source** — a Rockstar trailer, rockstargames.com, Rockstar Newswire, or the shipped game. Put the link in `sourceUrl`. | Credibility is the whole point of this dataset. |
| Rumors, community identifications and series staples are welcome, but **must be `verified: false`** and say so in `source`. | Apps can filter with `?verified=true`. |
| **No leaked, datamined-from-stolen-builds or pirated material.** | Legal safety for the project and its users. |
| Write descriptions in your own words. Short paraphrases of official bios are fine; don't paste long copyrighted text. | Copyright. |
| `id` is a unique, lowercase kebab-case slug and **never changes** once merged. | Ids are part of the public API — apps link to them. |

## Schema reference

The source of truth is [`lib/schemas.ts`](./lib/schemas.ts). Every entry shares:

```jsonc
{
  "id": "bravado-banshee",        // kebab-case, unique within the file
  "name": "Bravado Banshee",
  "verified": false,              // true ONLY with official confirmation
  "source": "Community identification from Trailer 1",
  "sourceUrl": "https://..."      // optional, must be a valid URL
}
```

| File | Extra fields |
| --- | --- |
| `vehicles.json` | `category` (enum: Super, Sports, Sports Classic, Muscle, Coupe, Sedan, SUV, Off-Road, Compact, Van, Truck, Bikes, Emergency, Boat, Aircraft, Helicopter), `manufacturer`, `realWorldInspiration?`, `estimatedTopSpeedMph` (int, or `null` unless there is an official or in-game figure), `description`, `customizationNotes[]`, `trailerAppearances[]` |
| `locations.json` | `type` (region, city, town, district, island-chain, wetlands, national-park, landmark, facility), `region` (id of a `type: "region"` location, or `null`), `description`, `coordinates {x, y}` (0–100 relative grid, x = west→east, y = north→south), `landmarks[]`, `realWorldInspiration?`, `trailerAppearances[]` |
| `characters.json` | `role` (Protagonist, Supporting, Antagonist, Minor), `affiliation[]`, `bio`, `homeLocation` (location id or `null`), `relationships[] {characterId, relation}`, `trailerAppearances[]` |
| `weapons.json` | `category` (Handgun, Shotgun, SMG, Assault Rifle, Sniper Rifle, Machine Gun, Heavy, Throwable, Melee), `ammoType`, `description`, `trailerAppearances[]` |
| `radio-stations.json` | `type` (station, soundtrack), `genre`, `host` (string or `null`), `vibe`, `notableTracks[] {title, artist, verified, context}` |
| `collectibles.json` | `category` (Collectible, Side Activity, Mini-Game, Hobby, Social), `region` (location id or `null`), `description`, `reward`, `trailerAppearances[]` |

`trailerAppearances` values: `Trailer 1`, `Trailer 2`, `Official Website`, `Official Screenshots`, `Gameplay`.

### Cross-reference checks

`npm run validate` also verifies that:

- ids are unique per file;
- every location `region` points to a `type: "region"` location (and regions point to themselves);
- character `homeLocation` and collectible `region` point to existing locations;
- character `relationships[].characterId` point to existing characters.

Errors are printed with file, index, id and field, e.g.:

```
✖ Data validation failed with 1 error(s):
  - vehicles.json[3] (id: "vapid-dominator") → category: Invalid option: expected one of "Super"|"Sports"|...
```

## Adding a new enum value or field

Edit `lib/schemas.ts`, update this table, and run `npm run check`. The OpenAPI spec at `/api/v1/openapi.json` and the docs update automatically.

## Adding a whole new dataset

1. Add a schema in `lib/schemas.ts` and the JSON file in `/data`.
2. Register it in `lib/integrity.ts` (`DATASETS`) and `lib/collections.ts` (`collections`) with its search fields and filters.
3. Create `app/api/v1/<name>/route.ts` and `app/api/v1/<name>/[id]/route.ts` (copy an existing pair — they're 6 lines each).
4. Add tests in `tests/`.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # validate + typecheck + tests
npm run build      # production build (runs validate first)
```

Be kind — see the [Code of Conduct](./CODE_OF_CONDUCT.md).
