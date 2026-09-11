# Domain kernel — scales, tiles, nestings

Not a container. A pure TypeScript library every container imports. If this is wrong, guides mis-register and explorers see the wrong square.

Source of truth for **feet per scale** is the 2022 sheet [Map scales, tiles and grids](https://pathfindertools.business.blog/2022/09/21/map-scales-and-grid-squares/), transcribed below. Child-grid size is **not** a global 20 × 20: N changes at each step of the ladder. The sheet also lists skip-level pairs (City↔Hood, Town↔Block); **the product ignores those** and only uses the step immediately above or below.

<img alt="Handwritten map scales and grid squares sheet: feet per millimetre and per 20cm tile, plus how each scale pair nests" src="./images/map-scales-and-grid-squares.jpg" width="480" />

Build this as pure functions with golden tests before any UI (Slice 0).

## 1. What is fixed

- Every tile is a physical **20cm × 20cm** square (fits A4 / US Letter).
- Canonical unit in software: **feet**. Miles on the sheet are approximate (see footnote on the scan) and must not be used for coordinates.
- A tile is identified by `(scale, east, south)` — east/south in feet, snapped to that scale’s tile origin.
- Empty squares are not stored. Nesting math is computed, never looked up from a CMS tree.

## 2. Scales

Canonical names from the sheet. The prototype’s `Floor` is **Plan**. `Extra` and `Global` are not on this sheet (see open questions).

| Scale | 1mm (feet) | 20cm tile (feet) | 20cm tile (miles, approx.) |
| --- | ---: | ---: | ---: |
| State | 10,000 | 2,000,000 | 380 |
| City | 500 | 100,000 | 19 |
| Town | 100 | 20,000 | 4 |
| Hood | 50 | 10,000 | 2 |
| Block | 5 | 1,000 | 1/5 |
| Plan | 1 | 200 | — |

Checks that must hold in tests:

- `tileFeet === mmFeet * 200` (because 20cm = 200mm).
- City’s “19 miles” quirk: `100_000 / 5280 ≈ 18.94`, which the sheet rounds to 19. **Store 100,000 feet**, never 19 miles.

The prototype’s 100,000,000-foot world is consistent with this table: `100_000_000 / 2_000_000 = 50` State tiles along an edge.

## 3. Nesting is a ladder (N changes each step)

Order is fixed:

```text
State → City → Town → Hood → Block → Plan
```

Each scale has **at most one parent** and **at most one child**. Scale up / scale down / guide overlays never ask the artist to pick a branch.

A child tile occupies a square patch of its parent. On paper: “X cm on the parent ↔ 20cm child tile”. In code: linear divisor `N = 20 / X`, so one parent holds an **N × N** grid of the child immediately below (N² children).

| Parent → child | Patch on parent | Linear divisor N | Children per parent | Child tile (feet) |
| --- | --- | ---: | ---: | ---: |
| State → City | 1cm | 20 | **20 × 20 = 400** | 100,000 |
| City → Town | 4cm | 5 | **5 × 5 = 25** | 20,000 |
| Town → Hood | 10cm | 2 | **2 × 2 = 4** | 10,000 |
| Hood → Block | 2cm | 10 | **10 × 10 = 100** | 1,000 |
| Block → Plan | 4cm | 5 | **5 × 5 = 25** | 200 |

Only State→City is a 400-child window. Town→Hood is four children. Do not hard-code 20, 5%, or 400 outside this table.

```mermaid
flowchart LR
    State -->|"20 × 20"| City
    City -->|"5 × 5"| Town
    Town -->|"2 × 2"| Hood
    Hood -->|"10 × 10"| Block
    Block -->|"5 × 5"| Plan
```

Invariant for every step: `parentTileFeet / N === childTileFeet`.

**Ignored from the sheet:** City↔Hood (10 × 10) and Town↔Block (20 × 20). Those nest geometrically, but skipping Town or Hood would fork navigation and guides. If we ever need a skip, compose two adjacent steps; do not add extra kernel edges.

## 4. Kernel API

```ts
type Scale = 'State' | 'City' | 'Town' | 'Hood' | 'Block' | 'Plan'

type TileId = { scale: Scale; east: number; south: number }

type Step = {
  parent: Scale
  child: Scale
  parentPatchCm: 1 | 2 | 4 | 10
  linearDivisor: 2 | 5 | 10 | 20 // N; child grid is N × N
}

tileFeet(scale: Scale): number
mmFeet(scale: Scale): number
steps(): Step[]                 // the five rows above, in order
stepDown(scale: Scale): Step | null  // Plan → null
stepUp(scale: Scale): Step | null    // State → null

originOf(pointFeet: { east: number; south: number }, scale: Scale): TileId
neighbour(id: TileId, dir: 'N' | 'S' | 'E' | 'W'): TileId

parentTile(id: TileId): TileId | null     // unique, or null at State
childTiles(id: TileId): TileId[]          // N² ids, or [] at Plan
childIndex(id: TileId): { col: number; row: number } | null
cropRectInParent(id: TileId): {
  xCm: number; yCm: number; sizeCm: number
} | null
```

No `parentScale` / `childScale` arguments. Adjacent is implied.

## 5. What this changes downstream

| Consumer | Implication |
| --- | --- |
| Tile Store | `getParent(id)`, `listChildren(id)` (0–N² existing rows). Coverage windows are independent of N. |
| Map Viewer | Scale up = `parentTile`. Scale down = the child cell under the last click, or the centre child. No chooser. |
| Guide Generator | One parent crop + one child mosaic. Mosaic is **N × N for the step below**, not always 20×20. 2400px canvas divides evenly by every N. Batch only when N is 10 or 20 (Hood→Block, State→City). |
| Tests | One golden case per ladder step (N, feet, crop rect). Off-by-one here is a product bug. |

## 6. Still open (does not change nestings)

- Canonical URL encoding of `east` / `south`.
- How scans register to the 20cm square (crop marks vs artist-cropped).
- Whether **Extra** and **Global** exist above State, and how they nest. Until specified, the enum is the six scales in §2.
- World wrapping policy at the 100,000,000-foot edge (prototype already loops).
