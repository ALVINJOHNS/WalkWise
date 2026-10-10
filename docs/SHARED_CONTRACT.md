# Shared implementation contract

Freeze this small contract in the first 15 minutes. It lets features develop independently and keeps merges predictable.

## App-level assumptions

- One React + TypeScript + Vite app, one package manifest, one app shell.
- Integration owner owns app-level routing and shared types. Feature owners do not edit those files without agreement.
- Keep feature code under `src/features/organizer`, `src/features/visitor`, and `src/features/navigation`. Integration owns `src/app` and `src/shared`.
- Each feature exports one default screen or a small documented function and uses fixture data/local adapters so it can be built without the backend or other feature being finished.
- Suggested routes: `/organizer`, `/v/:slug`, with the visitor route defaulting to the seed slug for demo convenience.

## Minimal venue package

```ts
type Point = { x: number; y: number }; // normalized 0..1 image/map coordinates
type Venue = {
  id: string;
  slug: string;
  name: string;
  revision: number;
  updatedAt: string; // ISO timestamp
  mapImage?: string; // data URL or same-origin asset URL for MVP
  nodes: Array<{ id: string; x: number; y: number; label?: string }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    points: Point[];
    blocked?: boolean;
  }>;
  places: Array<{
    id: string;
    name: string;
    category: string;
    description?: string;
    status: "open" | "closed" | "delayed";
    x: number;
    y: number;
    nodeId?: string;
    waitMinutes?: number;
  }>;
};
```

Use this shape in shared types after integration owner creates it. Until then, each feature may define a local type matching this shape. Keep coordinates normalized so an image can be resized without changing saved points. No account fields, schema framework, or generalized API layer in the MVP.

## Feature boundaries

- Organizer edits a `Venue` draft and calls `onSave(venue)`; it owns editor interactions and input validation.
- Visitor receives a read-only `Venue` snapshot, renders it, and displays saved/current status from a small prop or adapter.
- Navigation takes `Venue`, a start node or manual point, and destination `placeId`; it returns ordered node/edge IDs, meter estimate, and seconds estimate, or a clear no-route result. Keep calculations pure and on-device.
- Integration persists/loads venue snapshots, links `/v/:slug`, creates the QR URL, supplies fixtures, and wires the screens together.

## Merge rules

- Do not edit another person's feature folder. Raise shared needs in chat.
- Avoid duplicate package/dependency edits; integration owner installs dependencies and commits the lockfile.
- Prefer CSS scoped to the feature folder or CSS modules. Do not rename shared exports after integration starts.
- Each feature must tolerate empty/missing optional fields and show a useful error for invalid required data.
- Do not add backend credentials. Any API key stays in an environment variable, never in source or `.env.example`.
