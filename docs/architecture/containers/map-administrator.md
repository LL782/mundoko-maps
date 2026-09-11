# Container — Map Administrator

**Type:** Authenticated user interface  
**Tech:** Next.js `/admin` route group, Auth.js, same `TileStage` as the viewer  
**Users:** Map Artist (allowlisted author)

## 1. Purpose

A website to **upload tile art**, **see coverage** (what is drawn, what is only a guide, what is missing), **download guides**, and **publish**. It is the artist’s workbench, not a generic CMS dashboard.

For a solo artist this can be visually plain. The one UI that must be good is the **coverage grid** — a map of the map.

## 2. Responsibilities

- Authenticate the artist (allowlist).
- Show coverage for a chosen scale and window.
- Select a `TileId` as the current work square.
- Request a guide download (enqueues Guide Generator, then offers the file).
- Upload a finished (or in-progress) scan against that `TileId`.
- Show job progress (queued / running / failed / done).
- Preview draft art on the real tile stage.
- Publish / unpublish.
- Read-only view of originals (presigned).

Out of scope for v1:

- Multiple artists, roles, comments, review queues.
- In-browser drawing or lightboxing.
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
2. Preview (`TileStage` in preview mode).
3. Actions: Download guide · Upload · Publish · Replace.

## 5. Coverage UI

This is the CMS. Spend design time here.

- A grid of cells for the current window (size is a UI choice — e.g. one parent’s children at that pair’s N, or a 10×10 atlas). Do not assume every scale is 20×20.
- Cell colour/state: missing / guide only / draft / published.
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
6. On success, preview refreshes with the new web derivative.

If the artist closes the tab after PUT, a sweeper can complete abandoned objects later; v1 can say “please wait until processed.”

## 7. Guide download flow

1. Button “Download guide” on the tile page.
2. If a fresh `guide` asset exists and is not stale, return it immediately.
3. Else create a `generate_guide` job and `inngest.send('guide/requested', { tileId, jobId })`.
4. Poll; when succeeded, download the PNG (and later PDF).

Stale = any parent/child **published or draft art** changed after `assets.guide.created_at`. A boolean `guides_stale` on the tile, flipped by publish/capture, is enough.

## 8. Publish flow

- Publish is explicit. Capture always lands in `draft`.
- Publish sets `status = published`, `published_at = now()`, and `revalidateTag` for that tile (and neighbours if the viewer badges them).
- Unpublish removes it from the explorer but keeps assets.

## 9. Auth and security

- Middleware: unauthenticated `/admin/*` → login, except Auth.js routes.
- After login, if `session.email` not in `ARTIST_EMAILS`, sign out and show “not an artist”.
- CSRF: Server Actions default; presign endpoint is session-cookie authenticated.
- CORS on R2 presign: only the admin origin.
- No listing of all originals in a public bucket.

## 10. UX principles (solo artist)

- Desktop first, keyboard for panning coverage.
- Failures show the job error string; there is no ops team.
- Prefer one obvious next action (“You are on a missing square → Download guide”).
- Do not hide coordinates. The artist thinks in scale and feet.
- Preview must use the same stage as explorers so “what I publish is what they see.”

Skip: onboarding tours, dark mode as a project, design-system kits. A few CSS modules are enough.

## 11. Build notes for this container

Slice 3 deliverable:

- Auth.js allowlist.
- Coverage grid for one scale, one window size.
- Tile page with empty preview + file input.
- Presign + complete + job polling (even if Detail Capture is still a stub that copies the file).

Slice 4–5 add real processing and guide buttons on the same pages.

Done (thin) when the artist can log in, click a missing cell, upload an image, and see a draft preview without touching the database by hand.

## 12. Risks

| Risk | Mitigation |
| --- | --- |
| Vercel body size on upload | Presigned PUT to R2; never pipe the scan through Next.js. |
| Accidental publish | Preview + explicit Publish button, not “upload = live”. |
| Artist lost in the grid | Title + coordinates always visible; “start here” link. |
| Building a mini-Figma | No drawing tools. Paper is the drawing tool. |
