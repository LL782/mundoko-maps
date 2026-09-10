# Mundoko Maps — architecture

These documents are the build plan for Mundoko Maps: software that helps a map artist hand-draw a fantasy world on a nested grid of paper tiles, stores those tiles, and lets explorers browse whatever detail exists.

They assume a **greenfield** project. Treat this folder as the source of truth for *what to build* and *which tools to use*. Existing prototype code in the repo is a sketch of coordinates and viewer layout, not an architecture to extend.

## Diagrams

Updated C4 views (custom CMS, Inngest + Sharp, explorers go through the app):

- [Context diagram](./images/mundoko-maps-context-diagram.jpg)
- [Container diagram](./images/mundoko-maps-container-diagram.jpg)

## How to read this

1. [System design](./01-system.md) — context, containers, tech choices, cost, and build order.
2. Then the five containers, in dependency order:
   1. [Tile Store](./containers/tile-store.md) — custom CMS, source of truth.
   2. [Map Viewer](./containers/map-viewer.md) — public explorer site.
   3. [Map Administrator](./containers/map-administrator.md) — artist site.
   4. [Detail Capture](./containers/detail-capture.md) — turn uploads into tiles.
   5. [Guide Generator](./containers/guide-generator.md) — printable drawing guides.

## Constraint that drives every choice

One person, hobby time, near-zero budget. Prefer a modular monolith, free-tier SaaS, and features that can ship as thin vertical slices. Do not introduce a second deployable, a second language, or a paid CMS until a real limit forces it.
