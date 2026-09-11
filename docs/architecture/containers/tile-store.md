# Container — Tile Store (custom CMS)

**Type:** Data / content platform  
**Tech:** PostgreSQL (Neon) + Cloudflare R2 + Drizzle inside the Next.js app  
**Replaces:** Contentful (or any generic CMS) in the vision diagram

## 1. Purpose

The Tile Store is the source of truth for map images and tile data. It stores only tiles that exist (art or cached guides), delivers them to the Map Viewer and Map Administrator, and supplies raw pixels to Detail Capture and Guide Generator.

It is a **custom CMS** because the content is a nested spatial grid, not articles. The product needs coverage queries (“what is missing in this window?”), parent/child walks, and cheap delivery of many images. A document CMS would still require a custom admin on top, plus a monthly bill.

This is not a general CMS. No page builder, no rich-text blog, no content-model UI. Those would be a distraction.

## 2. Responsibilities

- Persist tile records keyed by `(scale, east, south)`.
- Persist assets (original, web, print, guide) in object storage.
- Enforce uniqueness: at most one *current* tile per coordinate per scale.
- Answer coverage queries for a bounding window.
- Resolve parent and children via the domain kernel, then fetch whatever records exist.
- Publish / unpublish (draft vs public).
- Issue public URLs for published web images; keep originals off the public path.
- Record job status related to a tile (so admin can poll without talking to Inngest).

Out of scope:

- Image *processing* (Detail Capture, Guide Generator).
- HTML layout of maps (Viewer / Administrator).
- Auth (the app does; the store trusts the caller).

## 3. Why not Contentful (or Strapi, Sanity, Payload)

| Need | Generic CMS | This store |
| --- | --- | --- |
| Identity | Entry id, slugs | `(scale, east, south)` |
| “Missing” | Empty entries you must create | Absence of a row |
| Hierarchy | Reference fields, easy to get wrong | Deterministic parent/child math |
| Delivery | CDN for a few hero images | Thousands of small tiles, hashed, cache-forever |
| Admin | List/editor forms | Coverage map |
| Price | $0 then a cliff | Neon + R2 free tiers |

Payload/Directus are closer (you own the DB) but you still fight their admin and plugin model to get a grid. Building three tables and a coverage page is less code than configuring them correctly.

## 4. Technology choices

| Piece | Choice | Notes |
| --- | --- | --- |
| Metadata | **Postgres** on **Neon** | `UNIQUE (scale, east, south)`. Window queries with indexes on `(scale, east, south)`. |
| Access | **Drizzle ORM** + SQL migrations | Keep tile queries obvious. |
| Blobs | **Cloudflare R2** | S3-compatible. Zero egress — essential for a public map. |
| Public delivery | R2 custom domain via Cloudflare | `https://tiles.mundoko.world/{hash}.webp` |
| Private originals | Separate R2 prefix, not on the public domain | Presigned GET for the artist only |
| Cache | Immutable objects (content hash in key) | Viewer can `Cache-Control: public, max-age=31536000, immutable` |
| In-app API | Typed repository module `tileStore` | Jobs and UIs call functions, not HTTP, in v1 |

### Alternatives considered

- **SQLite (Turso / LiteFS):** fine for metadata size, weaker story for concurrent job writes and Vercel. Neon is the default.
- **Supabase:** good if you want their dashboard/auth. We already have Auth.js and do not need Realtime. Extra product surface.
- **S3 + CloudFront:** egress is the trap. R2 exists to avoid it.
- **Vercel Blob:** simple, but pricing and vendor coupling are worse than R2 for a tile CDN.

## 5. Data model

Minimal schema for Slices 1–6. Types are indicative.

```text
tiles
  id              uuid pk
  scale           text not null   -- Global | State | City | Town | Hood | Block | Plan
  east            bigint not null
  south           bigint not null
  status          text not null   -- draft | published
  title           text
  notes           text            -- artist-only
  published_at    timestamptz
  created_at      timestamptz
  updated_at      timestamptz
  unique (scale, east, south)

assets
  id              uuid pk
  tile_id         uuid fk tiles
  kind            text not null   -- original | web | print | guide
  storage_key     text not null   -- R2 key
  public_url      text            -- null for original
  width_px        int
  height_px       int
  bytes           int
  mime            text
  content_sha256  text not null
  created_at      timestamptz

jobs
  id              uuid pk
  type            text not null   -- capture | generate_guide | invalidate_guides
  tile_id         uuid
  status          text not null   -- queued | running | succeeded | failed
  error           text
  payload         jsonb
  created_at      timestamptz
  updated_at      timestamptz

-- Optional, slice 6:
tile_revisions
  id, tile_id, asset_id, created_at
```

Rules:

- **No row** means missing. Do not insert placeholder empties.
- A `guide` asset may exist on a tile that has no art yet (status can stay unpublished, or use a tile row with `status = draft` and only a guide asset). Prefer: **guide-only tiles are rows with no `web` asset**, still unpublished. Coverage then becomes a cheap query.
- Replacing art writes a new `original`/`web`/`print` and keeps the old original if `tile_revisions` exists; until then, overwrite and accept the risk.
- `content_sha256` makes uploads idempotent: same file + same `TileId` short-circuits.
- Persist `east` / `south` already wrapped (`wrapFeet`). At most one Global row, always `(0, 0)`.
- Coverage windows that cross a world edge wrap; do not store or query negative feet.

### Logical tile states

```text
missing     → no row
guide_only  → row, guide asset, no web art
draft       → web art, not published
published   → web art, public
```

## 6. Repository API (in-process)

The rest of the app depends on this module, not on SQL.

```ts
getTile(id: TileId): Promise<Tile | null>
getAsset(id: TileId, kind: AssetKind): Promise<Asset | null>
listCoverage(scale, window: Bounds): Promise<CoverageCell[]>
listChildren(id: TileId): Promise<Tile[]> // 0–N² existing rows of the step below
getParent(id: TileId): Promise<Tile | null>
upsertDraft(id: TileId, fields): Promise<Tile>
publish(id: TileId): Promise<void>
unpublish(id: TileId): Promise<void>
putAsset(id: TileId, kind, bytes, meta): Promise<Asset>
createJob(...) / updateJob(...) / getJob(...)
```

`CoverageCell` is `{ tileId, state }` for every square in the window, including `missing`. The store *computes* missing by walking the window in the domain kernel and left-joining rows.

## 7. Object key layout

```text
originals/{tileId}/{sha}.bin     # private
web/{sha}.webp                   # public, hash-only so republish can reuse
print/{sha}.png
guides/{tileId}/{sha}.png        # public or auth’d; not the explorer default
```

Hash-addressed web images mean a publish that didn’t change pixels does not bust caches.

## 8. Delivery

**Explorer (Map Viewer):**

- HTML from Vercel (can ISR / `unstable_cache` on published tile payloads).
- Images from `tiles.mundoko.world` (R2).
- If a tile is missing, the viewer renders the empty grid; it does not ask the store to create anything.

**Artist (Administrator):**

- Same public URLs for published web assets.
- Presigned URLs for originals and unpublished derivatives (short TTL).

**Jobs:**

- GetObject / PutObject via S3 API with the server key. Stream where possible when compositing.

## 9. Indexing and scale

Expected v1 size: tens to thousands of rows, not millions of *stored* tiles. Postgres will not be the bottleneck. R2 storage and original-scan size will.

Index:

```sql
create unique index tiles_coord on tiles (scale, east, south);
create index tiles_scale_status on tiles (scale, status);
create index assets_tile_kind on assets (tile_id, kind);
```

If coverage windows ever get large, do not materialise missing cells in SQL; generate the grid in the kernel and query `WHERE scale = $1 AND east BETWEEN $2 AND $3 AND south BETWEEN $4 AND $5`.

## 10. Consistency with jobs

Capture and guide generation are asynchronous.

- Insert a `jobs` row as `queued` in the same request that uploads (or that asks for a guide).
- The Inngest function updates that row.
- On success, assets appear; the UI reloads the tile.
- Failed jobs leave the previous published web asset in place (if any). Never publish a half-written image: write a new hashed object, then point the `assets` row at it.

## 11. Backup and lock-in

- Neon: point-in-time recovery on paid; on free, nightly `pg_dump` to R2 is enough when you care.
- R2: versioning optional; originals are the irreplaceable files — back them up to a second bucket or an external drive periodically. Hobby-appropriate: rclone originals to Backblaze B2 later if the world gets precious.
- Schema is boring SQL. Migrating off Neon is a connection-string change. Migrating off R2 is an S3 copy. That is the point of not using Contentful.

## 12. Build notes for this container

Slice 1 deliverable:

- Migrations for `tiles`, `assets`, `jobs`.
- `tileStore` module with `getTile`, `putAsset`, `upsertDraft`.
- Script: `pnpm tiles:seed` uploads one City-scale image and prints its public URL.
- No admin UI yet.

Done when the Map Viewer can render that seeded tile from the store rather than from `/public`.

## 13. Risks

| Risk | Mitigation |
| --- | --- |
| Accidental public originals | Separate bucket or prefix; never put `originals/` on the public hostname. |
| Orphan R2 objects | Accept orphans in v1; a weekly “keys not in `assets`” script later. |
| Neon cold starts | Viewer should not query on every tile image; images are on R2. HTML can be cached. |
| Coordinate uniqueness bugs | Unique index; domain kernel is the only writer of `(east, south)` at a scale. |
