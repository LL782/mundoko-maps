# Container — Guide Generator

**Type:** Background processing  
**Tech:** Inngest functions + Sharp, running on Vercel  
**Replaces:** AWS Step Functions in the vision diagram  
**Triggered by:** Map Administrator (“Download guide”) or invalidation after related tiles change

## 1. Purpose

Make **drawing guides** for any target square — missing or already drawn. A guide is a printable 20cm composite of **layers** the artist controls, not a single fixed ghost of parent and children.

The four inputs, each a separate layer:

| Layer | What it is |
| --- | --- |
| **Existing tile** | This square’s live art (published web, or draft web if it has never been published). When a tile already exists, it is available as a guide layer so the artist can retouch or redraw it. |
| **Uploaded image** | An optional reference the artist attaches on the tile page (sketch, photo, earlier scan). Not the finished capture; Detail Capture is a different upload. |
| **Parent generated guide** | Generated *from* the unique parent: crop the parent’s art to this child slot and scale to 20cm. Source is parent **art** (published, else draft), not a recursive bake of the parent’s own layer recipe. |
| **Children generated guide** | Generated *from* the step below: an **N × N** mosaic of whatever child **web** (or draft) images exist. Empty cells stay transparent. |

Each layer can be **shown, hidden, reordered, and given an opacity**. A millimetre **grid** overlay is a fifth layer with the same controls (so they can print with or without the grid).

The vision text said “large scale guides from small scale tiles” (the mosaic / zoom-out direction). The artist also needs the other direction: a faint blow-up of the parent so they can line up coastlines and roads when *adding detail*. Existing art and a one-off upload are the same kind of thing: inputs onto the page.

Guides are a **cache**, not source of truth. Art lives on tile `web`/`original` assets. A baked PNG is stale when its **recipe** or any **input hash** changes.

## 2. Responsibilities

- Given a `TileId` and a **layer recipe**, load whatever inputs that recipe needs (existing art, upload object, parent art, N² children).
- Composite a square PNG from the recipe: paper background, then layers in the given order at the given opacities, then encode.
- Geometry for parent crop and child mosaic comes from the domain kernel (adjacent step only). Existing-tile and upload layers are full-square resizes to the canvas.
- Store as `assets.kind = guide`, keyed by tile + recipe hash.
- Serve a download to the artist.
- Regenerate on request; optionally rebuild when stale.
- Stay within serverless limits by **compositing children in batches**.

Out of scope for v1:

- Sending the guide to a printer API.
- Auto-tracing vectors.
- Guides as the explorer default view.
- Perfect colour match to pencils.
- In-browser painting. Layer controls compose inputs; paper is still where the drawing happens.

## 3. Why this is a container

Compositing up to 400 images is a different failure mode from “resize one scan.” It needs chunked steps, caching, and a clear stale/fresh rule. Keeping it separate from Detail Capture prevents a 400-tile mosaic from sharing retries with EXIF rotation.

Same *process* (Inngest + Sharp), different *function* and events.

## 4. Technology choices

| Piece | Choice | Why |
| --- | --- | --- |
| Orchestration | **Inngest** `generate-guide` | Steps = batches of children. |
| Pixels | **Sharp** `composite()` | Build a 2400×2400 canvas. Cell size is 2400 / N pixels where N is the height and width in cells for whatever scale we're working with (2, 5, 10, 15, 20). Note: 20cm at 300dpi is 2361 so 2400, which divides evenly by every N, will provide a high resolution print. |
| Grid | SVG string → Sharp, or draw via a tiny overlay PNG generated once per scale | Vector grid stays crisp. |
| Output | PNG for drawing (no WebP: some printers and photo labs are fussy) | Optional PDF in Slice 6 via the browser print path first. |
| Cache | R2 + `assets` row keyed by recipe hash | Same recipe + same input SHAs → reuse. |

### Rejected

- HTML/CSS “overflow hidden” print of N² `<img>` tags as the *only* generator: useful as an experiment (the old notes considered it), bad as a source of truth (browser-dependent). A deterministic Sharp pipeline can be tested with fixtures.
- GPU / GIS raster tools.
- Doing the **printable file** in the browser: up to 400 downloads, no cache sharing, no idempotency. A **live preview** in Admin (CSS-stacked copies of the same layers) is fine so the artist can toggle/reorder/fade before asking Sharp to bake.

## 5. Geometry and layer recipe

All geometry comes from the domain kernel. The generator must not invent numbers.

```text
Parent generated guide:
  parentImage  → crop rectangle for this child slot → scale to CANVAS

Children generated guide:
  N = stepDown(tile.scale).linearDivisor   // 20 | 5 | 2 | 10
  CELL = CANVAS / N
  for each of N×N slots:
    if child has web/draft image: scale to CELL × CELL, place at (i * CELL, j * CELL)

Existing tile / uploaded image:
  source → resize to CANVAS × CANVAS (contain; no crop invented)

Canvas:
  CANVAS = 2400 px
  CELL   = 2400 / N     // 120, 480, 1200, or 240
```

A City **parent** layer is the State crop; a City **children** layer is a 5×5 of Town tiles — not Hood.

### Recipe

```ts
type GuideLayerId = 'parent' | 'children' | 'existing' | 'upload' | 'grid'

type GuideLayer = {
  id: GuideLayerId
  visible: boolean // hide vs show; opacity 0 is also allowed
  opacity: number  // 0–1
}

type GuideRecipe = {
  layers: GuideLayer[] // bottom → top
  uploadObjectKey?: string // R2 key for the uploaded-image layer
}
```

Starting defaults (artist can change every value):

- Order, bottom → top: `parent`, `children`, `existing`, `upload`, `grid`.
- Opacity: parent **0.35**, children **0.45**, existing **0.40**, upload **0.50**, grid **1**.
- Hidden: any input that has no pixels (no parent, no children, no existing art, no upload). Grid is on.
- First tile in a region (no parent, no children, no existing): still a **grid-only** guide.

Do not recurse: parent and children layers are generated from stored **art**, not from those tiles’ baked guides.

Admin live-preview uses the same recipe. Download sends the recipe on `guide/requested`; Sharp bakes it.

## 6. Pipeline (batched for Hobby limits)

```text
guide/requested  (tileId + recipe)
    │
    ├─ step: resolve parent id + N² child ids (kernel, no IO)
    ├─ step: fetch tile rows + upload object for layers the recipe needs
    ├─ step: hash recipe + input SHAs; return cached PNG if fresh
    ├─ step: prepare parent canvas if that layer is used
    ├─ step: mosaic children in row batches when N is 10 or 20
    │         (N = 2 or 5 fits in one step)
    ├─ step: stack visible layers in recipe order, encode PNG
    ├─ step: put guides/{tileId}/{recipeHash}.png
    ├─ step: upsert asset, job succeeded
    └─ temps may be left; overwrite next run
```

If a batch still times out, cut to fewer rows. Prefer downloading **web** derivatives (already ~2k px) not originals.

Memory: do not hold N² decoded bitmaps. Composite each cell onto the canvas and discard.

## 7. Event contract

```ts
{
  name: 'guide/requested',
  data: { jobId: string, tileId: TileId, recipe: GuideRecipe, force?: boolean }
}
```

Invalidation path (from Detail Capture / publish):

```ts
{
  name: 'guides/invalidate',
  data: { tileId: TileId } // mark this tile’s parent + this tile + ?children
}
```

v1 invalidation: a baked guide is stale when its recipe hash no longer matches current input SHAs (existing art, upload, parent art, any child in the mosaic). Also set `guides_stale = true` on:

- the tile whose art changed,
- its parent (that parent’s children layer changed),
- all children (their parent layer changed) — can be a lot; **only mark the parent and the tile itself** if child fan-out is expensive. Artist can always click Download (force).

Do not eagerly regenerate every related guide on each publish. Regeneration is pull-based (artist asked) plus optional “regenerate if stale and they open the tile page.” Worst-case fan-out is 400 children (State→City). Different recipes for the same tile are different cache keys; do not overwrite one composition with another.

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

- Fixture: 1 parent PNG with a recognisable mark in one quadrant; 2 child PNGs in known slots; 1 existing-tile PNG.
- Assert: output PNG hash or sampled pixels at crop centre and at those slots (tolerance for compression).
- Recipe test: hiding the parent layer omits those pixels; reordering existing above children changes sampled pixels.
- Empty-input test: grid-only guide, expected size 2400×2400.

Do not wait for production tiles to discover off-by-one cell placement.

## 10. Build notes for this container

Slice 5 deliverable:

- Kernel functions: `parentTile`, `childTiles` (N² ids), `cropRectInParent` — one test per ladder step.
- Inngest `generate-guide` honours a recipe: at least parent + children + grid, then existing + upload.
- Then add batched children for N = 10 and N = 20.
- Admin layer panel wired to live preview + job + download.

Done when the artist can download a guide for a **missing** City square (State parent + Town children) *and* for that same square **after it has art** (existing-tile layer on), print both, and have features line up at the edges with a neighbouring guide (physical test, two tiles).

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| Off-by-one mosaic, unusable paper | Fixture tests + one physical edge-alignment test. |
| Serverless timeout | Batches; web derivatives only; Fly.io escape hatch (ADR-008). |
| Regenerating the world on each upload | Stale flags, pull-based generate. |
| Using guides as explorer art | Viewer ignores `kind=guide` for public image. |
| 400 R2 GETs cost / latency | Only State→City (N = 20). Parallelism cap (e.g. 8 at a time); still cheap on R2. |

## 12. Relationship to the old “map slice” notes

The prototype docs considered Jimp, local paths, and CSS overflow slicing. The production answer:

- **Slice a parent → child guide region:** Sharp `extract` + `resize` (this container).
- **Stitch children → parent guide:** Sharp `composite` in a grid (this container).
- **Pass a file from browser to server:** don’t; browser PUTs to R2, jobs read from R2 (Administrator + Detail Capture).
- **Local script:** same functions, CLI wrapper, for offline batches.
