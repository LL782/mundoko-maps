# Container — Guide Generator

**Type:** Background processing  
**Tech:** Inngest functions + Sharp, running on Vercel  
**Replaces:** AWS Step Functions in the vision diagram  
**Triggered by:** Map Administrator (“Download guide”) or invalidation after related tiles change

## 1. Purpose

Make **drawing guides** for a target square: a printable 20cm image that shows the artist what already exists on the scale **immediately above** (parent crop) and **immediately below** (child mosaic, N × N for that step), plus the grid they must draw on.

The vision text said “large scale guides from small scale tiles” (the mosaic / zoom-out direction). The artist also needs the other direction: a faint blow-up of the parent so they can line up coastlines and roads when *adding detail*. Do both, as layers, matching the prototype’s generated-tile sketch.

Guides are a **cache**, not source of truth. Art lives on tile `web`/`original` assets. If parent or children change, the guide is stale until regenerated.

## 2. Responsibilities

- Given a `TileId`, load the unique parent (if any) and the N² children of the step below (0–N² existing; N is 15, 21, 20, 5, 2, or 10).
- Composite a square PNG:
  1. White (or paper) background.
  2. Parent layer: the region of the parent that corresponds to this tile, scaled to 20cm, low opacity.
  3. Children layer: an **N × N** mosaic of whatever child **web** (or draft) images exist, low opacity; empty cells stay transparent.
  4. Grid overlay (mm semantics for this scale) as SVG rasterised or drawn in Sharp.
  5. Optional crop/registration marks in the print margin — if we export a full A4/Letter PDF later; the core asset is the 20cm square.
- Store as `assets.kind = guide`.
- Serve a download to the artist.
- Regenerate on request; optionally rebuild when stale.
- Stay within serverless limits by **compositing in batches**.

Out of scope for v1:

- Sending the guide to a printer API.
- Auto-tracing vectors.
- Guides as the explorer default view.
- Perfect colour match to pencils.

## 3. Why this is a container

Compositing up to **441** images (Global→State) is a different failure mode from “resize one scan.” State→City is 400; Extra→Global is 225; other steps are 100, 25, or 4. The job still needs chunked steps for the large mosaics, caching, and a clear stale/fresh rule.

Same *process* (Inngest + Sharp), different *function* and events.

## 4. Technology choices

| Piece | Choice | Why |
| --- | --- | --- |
| Orchestration | **Inngest** `generate-guide` | Steps = batches of children. |
| Pixels | **Sharp** `composite()` | Build a **2520×2520** canvas (20cm at 320dpi). 2520 divides evenly by every N (2, 5, 10, 15, 20, 21). Cell size is `2520 / N`. |
| Grid | SVG string → Sharp, or draw via a tiny overlay PNG generated once per scale | Vector grid stays crisp. |
| Output | PNG for drawing (no WebP: some printers and photo labs are fussy) | Optional PDF in Slice 6 via the browser print path first. |
| Cache | R2 + `assets` row | Do not recompute if not stale. |

### Rejected

- HTML/CSS “overflow hidden” print of N² `<img>` tags as the *only* generator: useful as an experiment (the old notes considered it), bad as a source of truth (browser-dependent). A deterministic Sharp pipeline can be tested with fixtures.
- GPU / GIS raster tools.
- Doing this in the browser: up to 441 downloads on the artist’s laptop, no cache sharing, no idempotency.

## 5. Geometry

All geometry comes from the domain kernel. The generator must not invent numbers. N and the parent patch come from the **adjacent step**, not a global 20×20.

```text
Parent layer:
  parentImage  → crop rectangle for this child slot → scale to CANVAS

Child mosaic:
  N = stepDown(tile.scale).linearDivisor   // 15 | 21 | 20 | 5 | 2 | 10
  CELL = CANVAS / N
  for each of N×N slots:
    if child has web/draft image: scale to CELL × CELL, place at (i * CELL, j * CELL)

Canvas:
  CANVAS = 2520 px
  CELL   = 2520 / N     // 168, 120, 126, 504, 1260, or 252
```

A City guide overlays its State parent and a 5×5 of Town children. A Global guide overlays its Extra cell (this plane on the 15×15 chart) and a 21×21 of States.

Opacity: start at **0.35** parent, **0.45** children (children are the detail the artist is consolidating or extending). Adjust after the first real print; store as constants, not UI sliders, in v1.

If there is no parent and no children, still produce a **blank grid guide** — that is the first tile in a region. Always useful.

Layer order (bottom to top): background → parent → children → grid → (later) labels.

## 6. Pipeline (batched for Hobby limits)

```text
guide/requested
    │
    ├─ step: resolve parent id + N² child ids (kernel, no IO)
    ├─ step: fetch tile rows for those ids (one SQL)
    ├─ step: composite parent layer → write R2 temp
    ├─ step: mosaic children in row batches when N ≥ 10
    │         (N = 2 or 5 fits in one step)
    ├─ step: overlay grid, encode PNG, put guides/{tileId}/{sha}.png
    ├─ step: upsert asset, clear stale flag, job succeeded
    └─ temps may be left; overwrite next run
```

If a batch still times out, cut to fewer rows. Prefer downloading **web** derivatives (already ~2k px) not originals.

Memory: do not hold N² decoded bitmaps. Composite each cell onto the canvas and discard.

## 7. Event contract

```ts
{
  name: 'guide/requested',
  data: { jobId: string, tileId: TileId, force?: boolean }
}
```

Invalidation path (from Detail Capture / publish):

```ts
{
  name: 'guides/invalidate',
  data: { tileId: TileId } // mark this tile’s parent + this tile + ?children
}
```

v1 invalidation: set `guides_stale = true` on:

- the tile whose art changed,
- its parent (mosaic changed),
- all children (parent crop changed) — can be a lot; **only mark the parent and the tile itself** if child fan-out is expensive. Artist can always click Download (force).

Do not eagerly regenerate every related guide on each publish. Regeneration is pull-based (artist asked) plus optional “regenerate if stale and they open the tile page.” Worst-case fan-out is 441 children (Global→State).

## 8. Download artefact

v1: PNG of the 20cm square.

Slice 6: A4/Letter PDF with:

- centred 20cm square,
- title (scale, east, south),
- tick labels matching Viewer margins,
- “print at 100% / actual size” footer.

Until then, the artist can print the PNG at 20cm in any tool, or we add a `/admin/.../guide/print` HTML page that uses the same print CSS as the viewer (fast, good enough).

## 9. Testing

This is the highest-value automated test after the kernel.

- Fixture: 1 parent PNG with a recognisable mark in one quadrant; 2 child PNGs in known slots.
- Assert: output PNG hash or sampled pixels at crop centre and at those slots (tolerance for compression).
- Empty-input test: grid-only guide, expected size 2520×2520.

Do not wait for production tiles to discover off-by-one cell placement.

## 10. Build notes for this container

Slice 5 deliverable:

- Kernel functions: `parentTile`, `childTiles` (N² ids), `cropRectInParent` — one test per ladder step.
- Inngest `generate-guide` with at least parent crop + empty mosaic + grid.
- Then add batched children for N ≥ 10 (including Extra 15 and Global 21).
- Admin button wired to job + download.

Done when the artist can download a guide for a missing City square that ghosts in the State parent (if present) and any Town children, print it, and have features line up at the edges with a neighbouring guide (physical test, two tiles).

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| Off-by-one mosaic, unusable paper | Fixture tests + one physical edge-alignment test. |
| Serverless timeout | Batches; web derivatives only; Fly.io escape hatch (ADR-008). |
| Regenerating the world on each upload | Stale flags, pull-based generate. |
| Using guides as explorer art | Viewer ignores `kind=guide` for public image. |
| 441 R2 GETs cost / latency | Worst at Global→State (N = 21). Parallelism cap (e.g. 8 at a time); still cheap on R2. |

## 12. Relationship to the old “map slice” notes

The prototype docs considered Jimp, local paths, and CSS overflow slicing. The production answer:

- **Slice a parent → child guide region:** Sharp `extract` + `resize` (this container).
- **Stitch children → parent guide:** Sharp `composite` in a grid (this container).
- **Pass a file from browser to server:** don’t; browser PUTs to R2, jobs read from R2 (Administrator + Detail Capture).
- **Local script:** same functions, CLI wrapper, for offline batches.
