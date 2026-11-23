# Leonida API

A free, read-only JSON API for Grand Theft Auto VI data: characters, locations, vehicles, weapons, music and side activities. The data lives in plain JSON files in this repo and is checked with Zod on every build.

Each entry has a `verified` flag and a `source`. `verified: true` means it's in an official trailer or on rockstargames.com. Everything else is a community guess and says so. It's a small dataset for now, because two trailers and a website only tell you so much.

[![CI](https://github.com/jubyuhanna-create/gta-vi/actions/workflows/ci.yml/badge.svg)](https://github.com/jubyuhanna-create/gta-vi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjubyuhanna-create%2Fgta-vi&project-name=leonida-api&repository-name=leonida-api)

## Quick start

```bash
curl "https://YOUR-DEPLOYMENT/api/v1/vehicles?category=muscle&limit=5"
```

```js
const res = await fetch("https://YOUR-DEPLOYMENT/api/v1/search?q=vice");
const { meta, data } = await res.json();
console.log(meta.total, data.locations?.results);
```

<details>
<summary>Discord bot example (discord.js)</summary>

```js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "character") return;
  const id = interaction.options.getString("id"); // e.g. "lucia-caminos"
  const res = await fetch(`${API}/api/v1/characters/${id}`);
  if (res.status === 404) return interaction.reply("Nobody by that name in Leonida.");
  const { data } = await res.json();
  await interaction.reply(`**${data.name}** — ${data.role}\n${data.bio}\n_Source: ${data.source}_`);
});
```

</details>

## API

Base path: `/api/v1` · Read-only · `GET` only · No auth

| Endpoint | Description | Filters |
| --- | --- | --- |
| `GET /api/v1` | Overview, routes and dataset statistics | — |
| `GET /api/v1/vehicles` | List vehicles | `category`, `manufacturer`, `appearance` |
| `GET /api/v1/vehicles/{id}` | Single vehicle | — |
| `GET /api/v1/locations` | List locations | `region`, `type`, `appearance` |
| `GET /api/v1/locations/{id}` | Single location | — |
| `GET /api/v1/characters` | List characters | `role`, `affiliation`, `location` |
| `GET /api/v1/characters/{id}` | Single character | — |
| `GET /api/v1/weapons` | List weapons | `category`, `ammo` |
| `GET /api/v1/weapons/{id}` | Single weapon | — |
| `GET /api/v1/radio` | List radio stations & soundtracks | `genre`, `type` |
| `GET /api/v1/radio/{id}` | Single station | — |
| `GET /api/v1/collectibles` | List collectibles & activities | `category`, `region` |
| `GET /api/v1/collectibles/{id}` | Single collectible | — |
| `GET /api/v1/search?q=` | Global search grouped by dataset | `types`, `limit` |
| `GET /api/v1/openapi.json` | OpenAPI 3.1 document | — |

**Every list endpoint** also accepts:

| Param | Default | Notes |
| --- | --- | --- |
| `search` (alias `q`) | — | Every word must match; results ranked by relevance |
| `page` | `1` | 1-based |
| `limit` | `20` | Max `100` |
| `sort` | `name` | `name` \| `id` |
| `order` | `asc` | `asc` \| `desc` |
| `verified` | — | `true` \| `false` |

Filters are case- and slug-insensitive (`?category=sports-classic` = `?category=Sports Classic`). Comma-separate for OR: `?category=muscle,super`. Unknown parameters return `400` so typos never fail silently.

### Response envelope

```json
{
  "success": true,
  "meta": { "total": 25, "page": 1, "limit": 10, "totalPages": 3, "version": "1.0.0" },
  "data": [ ... ]
}
```

Errors:

```json
{
  "success": false,
  "meta": { "version": "1.0.0" },
  "error": { "code": "NOT_FOUND", "message": "No vehicles entry with id \"nope\".", "details": { "hint": "..." } }
}
```

### Global search

`GET /api/v1/search?q=vice&types=locations,characters&limit=5` returns only groups with hits:

```json
{
  "success": true,
  "meta": { "total": 6, "query": "vice", "types": ["locations", "characters"], "limit": 5, "version": "1.0.0" },
  "data": {
    "locations": { "total": 5, "results": [{ "id": "vice-city", "name": "Vice City", "type": "locations", "summary": "region", "verified": true, "score": 40, "url": "/api/v1/locations/vice-city" }] },
    "characters": { "total": 1, "results": [ ... ] }
  }
}
```

### CORS & caching

Responses send `Access-Control-Allow-Origin: *`, so you can call the API from a browser. They're cached on Vercel's CDN for a day (`s-maxage=86400`), since the data only changes when the repo is deployed.

### OpenAPI

`/api/v1/openapi.json` is generated from the same Zod schemas that validate the data. You can import it into Postman or generate a typed client from it.

## Data

| File | Contents |
| --- | --- |
| [`vehicles.json`](./data/vehicles.json) | Name, category, in-universe manufacturer, real-world inspiration, estimated top speed, customization, trailer appearances |
| [`locations.json`](./data/locations.json) | Regions (Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, Mount Kalaga National Park), districts, landmarks, relative coordinates |
| [`characters.json`](./data/characters.json) | Lucia, Jason and the supporting cast — role, affiliation, bio, relationships |
| [`weapons.json`](./data/weapons.json) | Category, ammo type, description |
| [`radio-stations.json`](./data/radio-stations.json) | Songs from the trailers. No in-game radio stations have been announced yet. |
| [`collectibles.json`](./data/collectibles.json) | Collectibles, hobbies and side activities by region |

> **About `verified`.** The seed data was compiled from official pre-release material (Trailers 1 & 2 and the official GTA VI website). Entries confirmed there are `verified: true`. Community identifications from trailer frames (most vehicle names, for example) and series staples (weapons, mostly) are `verified: false` and say so in `source`. If you can source something, send a PR and it gets upgraded.

Coordinates are a **relative 0–100 grid** (x: west→east, y: north→south) estimated by the community — good for rough maps, not game units.

## Running it locally

```bash
git clone https://github.com/jubyuhanna-create/gta-vi.git leonida-api
cd leonida-api
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run validate` | Zod + cross-reference checks on `/data` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest suite (data integrity + every endpoint) |
| `npm run check` | All three above |
| `npm run build` | Validate, then production build |

### Project structure

```
app/
  api/v1/                 REST API (route handlers)
    [collection]/route.ts       list endpoints
    [collection]/[id]/route.ts  detail endpoints (pre-rendered at build)
    search/route.ts             global search
    openapi.json/route.ts       generated OpenAPI 3.1 spec
  docs/  explore/          website (docs, data explorer, live playground)
data/                     📦 the dataset — edit these!
lib/
  schemas.ts              Zod schemas (the contract)
  collections.ts          dataset registry: search fields & filters
  query.ts                filtering, search ranking, pagination
  http.ts                 envelope, CORS, cache headers, errors
  integrity.ts            cross-reference validation
scripts/validate-data.ts  `npm run validate`
tests/                    Vitest
```

## Deploying

Import the repo on Vercel (or use the button above). There's no database and no required environment variables. `NEXT_PUBLIC_SITE_URL` is optional and only used for the sitemap.

## Contributing

Most fixes are a JSON edit. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the fields and the rule for marking something verified. Run `npm run validate` before opening a PR.

## Legal

Unofficial fan project. It is **not affiliated with, endorsed or sponsored by Rockstar Games or Take-Two Interactive**. *Grand Theft Auto*, *GTA*, *Vice City*, *Leonida* and related names are trademarks of their respective owners. No game assets are distributed. Code is released under the [MIT License](./LICENSE); descriptions are written by contributors and summarise publicly released official material.
