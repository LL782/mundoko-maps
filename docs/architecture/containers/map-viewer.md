# Container — Map Viewer

**Type:** Public user interface  
**Tech:** Next.js App Router, React, CSS (print-aware), images from R2  
**Users:** Map Explorer (guest)

## 1. Purpose

A website that lays out maps at the correct scale and position. The explorer browses the world in whatever detail exists: finished art, empty grid, or (optionally) a faint “not drawn yet” state. It must feel like looking at a *page* of a map, not like a slippy GIS.

This is the public product. It should be shippable as soon as the Tile Store has one published tile.

## 2. Responsibilities

- Resolve a URL to a `TileId` (scale + east + south).
- Render the **tile stage**: 20cm-square semantics on screen and in print.
- Show published artwork when present; otherwise the empty grid for that scale.
- Draw **scale margins** (tick labels along the square) and **key / scale bars** when those assets exist for the scale.
- Navigate: adjacent tiles, jump to parent scale, dive to a child cell.
- Title the page with human-readable scale and coordinates (feet, not raw internals).
- Print: one tile per page, 20cm square, 100% scale. No browser chrome if possible.
- Stay fast and cacheable. No auth.

Out of scope:

- Uploading, drafts, job status (Administrator).
- Generating guides (Guide Generator). Generating overlays on the fly for explorers is optional later; v1 shows stored published art only.

## 3. Technology choices

| Piece | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js** App Router, same app as admin | One deploy; share the tile stage component. |
| Rendering | React Server Components for data load; small client island for keyboard / click navigation | Explorer pages are mostly static. |
| Styling | CSS modules (already the prototype style) | Print CSS is easier without a utility-framework fight. Avoid canvas-first. |
| Images | `<img>` or Next Image pointing at **R2 public URLs** | Do not proxy every tile through Vercel Image Optimization (cost and limits). |
| Routing | `/{scale}/{east}/{south}` | Shareable coordinates. |
| Caching | ISR or `force-cache` on published tile fetches; `revalidateTag('tile:…')` on publish | Explorers can sit on CDN HTML. |
| Print | `@media print` + a `/print/...` route if the main chrome is too busy | Cheaper than PDF generation for explorers. |

### Rejected

- **Mapbox / Leaflet:** wrong coordinate system, wrong interaction model (continuous pan/zoom vs discrete paper tiles), paid tiles.
- **Canvas / WebGL mosaics of the whole world:** overkill; one page is one tile (plus maybe a locator inset later).
- **Client-side fetch waterfalls:** load the tile record on the server.

## 4. Information architecture

```text
/                           contents / “start here”
/{scale}/{east}/{south}     view one tile
/{scale}/{east}/{south}/print   optional print-only layout
/docs/*                     static notes (not the CMS)
```

URL encoding of east/south is a Slice 0 domain decision. Requirement: stable, copy-pasteable, no floats that round-trip badly. The prototype’s `5135` → internal feet hack must be replaced with an explicit codec in the kernel.

Unknown scales or malformed coordinates: 404. Valid coordinates with no art: **200 with empty grid**, never 404. The world exists; the ink might not.

## 5. Layout (the tile stage)

Shared with Map Administrator preview. Treat this as a designed page, not a map widget.

```text
┌─────────────────────────────────────────┐
│ Title: City scale · 5,135,000′ east …   │
├─────────────┬───────────────────────────┤
│             │  N ticks                  │
│  W ticks    │  ┌─────────────────────┐  │
│             │  │                     │  │
│             │  │   20cm tile art     │  │
│             │  │   or empty grid     │  │
│             │  │                     │  │
│             │  └─────────────────────┘  │
│             │  S ticks                  │
│             │  E ticks                  │
├─────────────┴───────────────────────────┤
│ Key + scale bars (image or SVG per scale)│
├─────────────────────────────────────────┤
│ Position bar: parent · neighbours · down │
└─────────────────────────────────────────┘
```

Rules:

- The inner square is **square**. Layout must not stretch it.
- On screen, it may scale to the viewport; the *meaning* is 20cm.
- On print, the square is **exactly 20cm**. Margins of the paper absorb A4 vs Letter differences (Letter is wider — the existing notes already rely on that).
- Empty grid: SVG overlay matching the millimetre semantics of that scale (domain kernel), not a bitmap if we can avoid it.
- Published art sits under the margin ticks, not covering them.

The current prototype’s “generated tile” (parent ghost + 400 children) is **Guide Generator output**, not default explorer chrome. Explorers should see clean published art. A later “workshop” toggle may show construction overlays; keep it out of v1.

## 6. Navigation

| Action | Result |
| --- | --- |
| N / S / E / W | Adjacent `TileId` at the same scale (kernel `neighbour`) |
| Scale up | Parent tile, same world point |
| Scale down | Child that contains the point last clicked, or the centre child |
| “Start here” | Seeded published tile |
| Keyboard | Arrow keys for neighbours; optional |

Do not infinite-scroll a sea of tiles. This is a book of pages.

## 7. Data loading

```ts
// server
const id = parseTileId(params)
const tile = await tileStore.getTile(id)
const web = tile?.status === 'published'
  ? await tileStore.getAsset(id, 'web')
  : null
```

- Drafts are invisible here.
- Guide-only rows are treated as empty for explorers (or a single “undrawn” pattern — product choice, default to empty grid).
- Neighbour links do not need extra queries; the kernel computes ids. Optional: batch `listCoverage` to badge “has art” on the position bar.

## 8. Performance

- One HTML document, one main image, a few chrome images (key, maybe locator).
- Tile images: width on screen ~800–1600px; store a web derivative sized for that (Detail Capture). Do not ship print PNGs to explorers.
- Prefetch adjacent routes on hover (Next.js `<Link>`).
- No client state store. URL is the state.

## 9. Print

Explorer print is “this page as a handout for the table.”

- Hide site chrome.
- 20cm square centred.
- Include title, ticks, and scale bar — a GM should be able to measure.
- Test on A4 and Letter at 100% zoom, both Chrome and Firefox, at least once per layout change.

Do not use a paid PDF API. If browser print is too inconsistent, Slice 6 can add a stored print PNG from Detail Capture.

## 10. Accessibility and content

- Real `<h1>` with scale and coordinates.
- Image `alt`: title + scale + position, or “No map drawn yet at …”.
- Do not convey neighbours only by colour on a minimap.
- Motion: none required.

SEO: unique titles per coordinate. Only index published tiles and the contents page (`robots` can noindex empty squares if the crawl budget ever matters; ignore until then).

## 11. Sharing with Administrator

Extract a `TileStage` component used by both UIs:

- Props: `tileId`, `imageUrl | null`, `mode: 'public' | 'preview'`.
- Preview mode may show draft watermarks and guide layers.

Viewer pages wrap `TileStage` with public chrome. Admin pages wrap it with tools.

## 12. Build notes for this container

Slice 2 deliverable:

- Route `/{scale}/{east}/{south}` using the kernel parser.
- `TileStage` with empty SVG grid + optional image.
- Position bar with four neighbours and scale up.
- Contents page links to the seeded tile.
- Print CSS for the square.

Done when an unauthenticated visitor can open the seeded City tile on a phone and on a desktop, and print a recognisable square.

## 13. Risks

| Risk | Mitigation |
| --- | --- |
| Stretching / non-square tiles | CSS aspect-ratio 1/1; visual test. |
| Print not 20cm | Physical ruler test; `cm` units in print CSS. |
| Vercel image bill | Point at R2; skip `next/image` optimizer for store tiles. |
| Treating this like Google Maps | Navigation spec above; no drag-pan in v1. |
