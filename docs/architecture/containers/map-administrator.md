# Container — Map Administrator

**Type:** Authenticated user interface  
**Tech:** Next.js `/admin` route group, Auth.js, same `TileStage` as the viewer  
**Users:** Map Artist (allowlisted author)

## 1. Purpose

A website to **upload tile art**, **see coverage** (what is drawn, what is only a guide, what is missing), **compose and download guides**, and **publish**. It is the artist’s workbench, not a generic CMS dashboard.

For a solo artist this can be visually plain. The one UI that must be good is the **coverage grid** — a map of the map.

## 2. Responsibilities

- Authenticate the artist (allowlist).
- Show coverage for a chosen scale and window.
- Select a `TileId` as the current work square (missing or existing).
- Compose a guide: toggle, reorder, and set opacity on **existing tile**, **uploaded image**, **parent generated guide**, and **children generated guide** (plus the grid overlay).
- Attach an optional reference image for the upload layer (not the same as uploading finished tile art).
- Request a guide download (enqueues Guide Generator with the current recipe, then offers the file).
- Upload a finished (or in-progress) scan against that `TileId`. On a published tile this is a replacement, not an unpublish.
- Show job progress (queued / running / failed / done).
- Preview draft or **pending** art on the real tile stage, while explorers still see live published art.
- Publish / unpublish.
- Read-only view of originals (presigned).

Out of scope for v1:

- Multiple artists, roles, comments, review queues.
- In-browser drawing or lightboxing. Layer toggles for **guides** are in scope; painting pixels is not.
- Bulk ingest of a whole atlas (a CLI can come later).
- Editing millimetre semantics or scale definitions.

## 3. Technology choices

| Piece | Choice | Why |
| --- | --- | --- |
| UI | Next.js App Router, `src/app/admin/*` | Same app as viewer; middleware gates the subtree. |
| Auth | **Auth.js** with Google (or magic link) + `ARTIST_EMAILS` | $0, one user, revoke by editing env. |
| Mutations | Server Actions | Enough for upload metadata + publish. |
| Upload | Route handler, multipart, stream to R2 **or** presigned PUT from the browser | Prefer **presigned PUT** so the app server never holds a 40MB scan (Hobby payload limits). |
| Job trigger | `inngest.send` after the object exists | Administrator does not process pixels. |
| Styling | Simple, dense, desktop-first | Artists work at a desk with a scanner. Mobile upload is nice-to-have, not v1. |

### Rejected

- **Clerk / Auth0 / Cognito:** cost and complexity for one email.
- **Embedding Contentful / Payload admin:** we would still build coverage on the side.
- **Separate admin app:** doubles deploys; preview needs `TileStage` anyway.

## 4. Information architecture

```text
/admin                      coverage home (last scale + window)
/admin/login                Auth.js
/admin/t/{scale}/{east}/{south}   work on one tile
/admin/jobs                 recent jobs
/admin/jobs/{id}            error log for a failed capture/guide
```

The tile work page is the hub:

1. Coverage context (where am I?).
2. Preview (`TileStage` in preview mode) — live published art, and pending replacement if any.
3. Guide compositor: layer list (existing tile, uploaded image, parent, children, grid) with visibility, order, opacity; live CSS preview of the stack.
4. Actions: Download guide · Upload finished art · Publish.

## 5. Coverage UI

This is the CMS. Spend design time here.

- A grid of cells for the current window (size is a UI choice — e.g. one parent’s N × N children, or a 10×10 atlas). Do not assume every scale is 20×20.
- Cell colour/state: missing / guide only / draft / published / published with pending replacement.
- Click → tile work page.
- Window pans by pages of cells, not by dragging a GIS map.
- Filter: “missing only”, “drafts”, “published”.

Data: `tileStore.listCoverage(scale, window)`. Do not paint 10,000 DOM nodes; cap the window (e.g. max 400 cells on screen — one parent’s children).

## 6. Upload flow

1. Artist is on `/admin/t/...` so the `TileId` is known. (Do not parse coordinates from filenames in v1; too brittle.)
2. Client requests `POST /admin/api/uploads` with `{ tileId, filename, mime, size }` → server checks auth, size, mime, creates a `jobs` row (`capture`, `queued`), returns `{ putUrl, jobId, objectKey }`.
3. Client PUT bytes to R2.
4. Client `POST /admin/api/uploads/complete { jobId }` → server verifies the object exists (HeadObject), `inngest.send('tile/uploaded', { jobId, tileId, objectKey })`.
5. UI polls `getJob(jobId)` every few seconds (or Inngest webhook later). No websockets in v1.
6. On success, preview refreshes with the new web derivative (draft if the square was unpublished; **pending** if it was already published). Explorers are unchanged until Publish.

If the artist closes the tab after PUT, a sweeper can complete abandoned objects later; v1 can say “please wait until processed.”

## 7. Guide download flow

1. Artist arranges layers on `/admin/t/...` (works the same on missing and existing squares). Optional: presign + PUT a reference image for the **uploaded image** layer.
2. Button “Download guide” sends the current recipe.
3. If a baked `guide` asset exists for this **recipe hash** (recipe + input SHAs) and is not stale, return it immediately.
4. Else create a `generate_guide` job and `inngest.send('guide/requested', { tileId, jobId, recipe })`.
5. Poll; when succeeded, download the PNG (and later PDF).

Stale = any input SHA in the recipe changed after `assets.guide.created_at` (this tile’s live art, the upload object, parent art, child art). A boolean `guides_stale` on the tile, flipped by publish/capture, is a hint to re-bake; the recipe hash is the real cache key.

Live preview in the page may CSS-stack the same layers so the artist can tweak without waiting on Sharp. The file they print is the baked PNG.

## 8. Publish flow

- Publish is explicit. Capture never makes art live.
- First art on a square: capture writes `draft`; publish sets `status = published`, `published_at = now()`, and `revalidateTag` for that tile.
- Replacement of a **published** tile: capture writes **pending** assets. Status stays `published`. Explorers keep the live web image. Publish **swaps** pending → live, then revalidates.
- Unpublish removes live art from the explorer but keeps assets. A pending replacement is discarded or kept as draft — v1 can discard it.

## 9. Auth and security

- Middleware: unauthenticated `/admin/*` → login, except Auth.js routes.
- After login, if `session.email` not in `ARTIST_EMAILS`, sign out and show “not an artist”.
- CSRF: Server Actions default; presign endpoint is session-cookie authenticated.
- CORS on R2 presign: only the admin origin.
- No listing of all originals in a public bucket.

## 10. UX principles (solo artist)

- Desktop first, keyboard for panning coverage.
- Failures show the job error string; there is no ops team.
- Prefer one obvious next action: missing square → arrange layers → Download guide; published square → same, or Upload a replacement (explorers keep the live tile until Publish).
- Do not hide coordinates. The artist thinks in scale and feet.
- Preview must use the same stage as explorers so “what I publish is what they see.”

Skip: onboarding tours, dark mode as a project, design-system kits. A few CSS modules are enough.

## 11. Build notes for this container

Slice 3 deliverable:

- Auth.js allowlist.
- Coverage grid for one scale, one window size.
- Tile page with empty preview + file input.
- Presign + complete + job polling (even if Detail Capture is still a stub that copies the file).

Slice 4 adds real processing, pending replacements that do not unpublish, and Publish-as-swap.

Slice 5 adds the layer compositor (visibility, order, opacity) and Download guide on the same tile page.

Done (thin) when the artist can log in, click a missing cell, upload an image, and see a draft preview without touching the database by hand.

## 12. Risks

| Risk | Mitigation |
| --- | --- |
| Vercel body size on upload | Presigned PUT to R2; never pipe the scan through Next.js. |
| Accidental publish | Preview + explicit Publish button, not “upload = live”. |
| Artist lost in the grid | Title + coordinates always visible; “start here” link. |
| Building a mini-Figma | No drawing tools. Paper is the drawing tool. Guide layer toggles are not a paint program. |
