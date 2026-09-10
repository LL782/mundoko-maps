# Container — Detail Capture

**Type:** Background processing  
**Tech:** Inngest functions + Sharp, running on Vercel  
**Replaces:** AWS Step Functions in the vision diagram  
**Triggered by:** Map Administrator (after a successful upload to R2)

## 1. Purpose

Turn an uploaded image into **metadata and tile entries**: validate the scan, store an original, write web and print derivatives, and attach them to a `TileId`. This is the ingest pipeline from paper (or digital painting) into the Tile Store.

It does not decide *where* the tile sits — the Administrator already bound the upload to a coordinate. It does not compose guides (Guide Generator). It does not show UI beyond job status.

## 2. Responsibilities

- Run asynchronously so the artist is not blocked on image work.
- Verify the object exists and is a real image (decode with Sharp, do not trust MIME).
- Normalise orientation (EXIF).
- Produce derivatives:
  - **original** — bytes as uploaded, private.
  - **web** — WebP, max edge suited to the viewer (e.g. 2048px), sRGB.
  - **print** — PNG (or high-quality JPEG), long edge suited to ~300dpi over 20cm (~2400px). Upscale is *not* required; never invent detail.
- Upsert the tile as `draft` with width/height metadata.
- Be **idempotent** on `(tileId, content_sha256)`.
- Mark related guides stale.
- Write success/failure onto the `jobs` row.

Out of scope for v1:

- Auto-cropping to registration marks (nice later; artist crops to the square first).
- OCR, legend extraction, AI cleanup.
- Splitting one scan that contains multiple tiles.
- Colour-managed CMYK pipelines.

## 3. Why Inngest + Sharp, not Step Functions

The vision’s “steps to turn images into metadata and tile entries” is the right *shape*. AWS Step Functions is the wrong *vehicle*:

- Account, IAM, ASL JSON, CloudWatch, three extra bills.
- The pipeline is ~5 steps, not 50.
- The author already writes TypeScript.

**Inngest** keeps the step idea (`step.run`) so each piece retries alone, and each `step.run` is a separate Vercel invocation — which is how we stay under Hobby’s ~10s function limit.

**Sharp** is the Node standard for resize/rotate/encode. The old Jimp experiment was the right problem (slice/process images) with a weaker library and no clear file-passing story. That story is now: bytes already on R2, jobs pull/push via S3 API.

### Alternatives

| Option | When |
| --- | --- |
| Next.js `after()` | Too easy to lose work; no retries. |
| Trigger.dev | Fine equivalent; Inngest’s step model maps slightly better to the old diagram. |
| Local CLI only | Valid *slice 0.5* for the artist; still wrap the same functions so the web path can call them. |
| Fly.io worker | Escape hatch if Sharp + 40MB buffers blow memory (see risks). |

## 4. Pipeline

```text
tile/uploaded
    │
    ├─ step: load job + HeadObject
    ├─ step: download original to tmp / buffer
    ├─ step: sha256 (if not provided)
    ├─ step: sharp metadata + rotate
    ├─ step: reject if too small / too huge / not an image
    ├─ step: put original in originals/ (if not already)
    ├─ step: encode web WebP → put web/
    ├─ step: encode print PNG → put print/
    ├─ step: upsert tile draft + asset rows (transaction)
    ├─ step: mark neighbouring guides stale
    └─ step: job = succeeded
```

Each `step.run` must be restart-safe. Do not depend on `/tmp` surviving between steps: either do download+encode in **one** step for v1 (simplest, if it fits in time/memory) or write intermediates to R2.

**v1 recommendation:** two Inngest steps only.

1. `processImage` — download, Sharp, upload three keys, return hashes/dimensions.
2. `commitMetadata` — DB transaction.

If `processImage` hits the time limit, split encode web and encode print.

## 5. Validation rules

Tune with real scans; start strict enough to catch garbage.

| Check | Initial rule |
| --- | --- |
| Decode | Sharp must parse |
| Format | jpeg, png, webp, tiff |
| Size on disk | ≤ 40MB |
| Pixel area | ≤ ~50MP (reject phone panoramas by accident) |
| Min short edge | ≥ 1200px (warn in job message if < 2000px: “print will be soft”) |
| Aspect ratio | Within ~5% of square; if not, **do not auto-crop** — fail with “crop to square and re-upload” |

Failing jobs: `jobs.status = failed`, human-readable `error`. Leave any previous draft in place.

## 6. Event contract

```ts
// inngest.send
{
  name: 'tile/uploaded',
  data: {
    jobId: string,
    tileId: { scale, east, south },
    objectKey: string,      // temporary inbound key from presign
  }
}
```

On success the function may emit `tile/processed` (used to invalidate guides). Administrator does not need to subscribe; it polls `jobs`.

## 7. Idempotency and replacement

- If the same SHA is already the current original for that tile, mark the job succeeded and skip encodes.
- A *new* SHA replaces `web`/`print` keys on the tile (new hashed objects).
- Do not publish. The artist previews and publishes in Admin.

## 8. Local development

- `npx inngest-cli dev` alongside `pnpm dev`.
- A `packages/domain` or `src/jobs/capture.ts` function that can also be run as:

  ```bash
  pnpm capture --tile city:51350000:51550000 --file ./scan.png
  ```

  Same Sharp code path. Useful when the artist is offline with a pile of scans.

## 9. Observability

- Job row is the user-facing log.
- `console.error` + Inngest’s dashboard on the free tier.
- Add Sentry only after the first production failure you could not diagnose.

## 10. Build notes for this container

Slice 4 deliverable:

- Inngest client in the Next.js app (`/api/inngest`).
- One function `capture-tile`.
- Stub-to-real: replace “copy inbound to web/” with Sharp derivatives.
- Admin preview shows the web asset.

Done when a square JPEG uploaded in Admin appears as a draft on `TileStage` without committing binaries to git.

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| 10s / memory on Hobby | Two-step function; resize streaming; Fly.io worker if measured OOM. |
| EXIF orientation wrong on maps | `rotate()` before crop/resize; visual check on one phone photo. |
| Auto-magic crop that shifts the grid | Do not crop. Fail if not square. |
| Trusting `image/jpeg` from the browser | Sharp decode is the gate. |
| Processing in the upload request | Never; always after R2 has the bytes. |
