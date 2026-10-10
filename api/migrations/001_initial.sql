CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  plan_image_url TEXT,
  boundary GEOMETRY(Geometry, 4326),
  calibration JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS map_features (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  plan_x DOUBLE PRECISION NOT NULL,
  plan_y DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326),
  properties JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS path_nodes (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  plan_x DOUBLE PRECISION NOT NULL,
  plan_y DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326)
);

CREATE TABLE IF NOT EXISTS path_edges (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  from_node_id TEXT NOT NULL REFERENCES path_nodes(id),
  to_node_id TEXT NOT NULL REFERENCES path_nodes(id),
  length_m DOUBLE PRECISION,
  direction TEXT NOT NULL DEFAULT 'both',
  accessible BOOLEAN NOT NULL DEFAULT true,
  closed BOOLEAN NOT NULL DEFAULT false,
  access_rules JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS event_items (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  plan_x DOUBLE PRECISION NOT NULL,
  plan_y DOUBLE PRECISION NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS map_versions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, version)
);
