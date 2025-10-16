-- Migration 002: Notes, Images, and Sorting for Bookmarks
-- Safe to run multiple times (IF NOT EXISTS used where possible).

-- 0) Safety
SET client_min_messages = WARNING;

-- 1) Add optional manual sort field to bookmarks (per-user ordering)
ALTER TABLE IF EXISTS bookmarks
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Keep sort_order unique per user if provided (nulls allowed and ignored)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'uniq_bookmark_sort_per_user'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uniq_bookmark_sort_per_user
             ON bookmarks(user_id, sort_order)
             WHERE sort_order IS NOT NULL';
  END IF;
END $$;

-- 2) Notes table (1-to-many from bookmarks)
CREATE TABLE IF NOT EXISTS bookmark_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    body TEXT NOT NULL,             -- note content (plain or markdown)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index to speed lookups per bookmark and by recency
CREATE INDEX IF NOT EXISTS idx_notes_bookmark_created
  ON bookmark_notes(bookmark_id, created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_notes_updated_at ON bookmark_notes;
CREATE TRIGGER trg_notes_updated_at
BEFORE UPDATE ON bookmark_notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3) Images table (1-to-many from bookmarks)
-- Store URLs/paths; for local dev you can store relative paths, for prod use object storage URLs.
CREATE TABLE IF NOT EXISTS bookmark_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,        -- where the file lives (S3, CDN, local path, etc.)
    content_type TEXT NOT NULL,     -- 'image/png', 'image/jpeg'
    width_px INTEGER,               -- optional metadata
    height_px INTEGER,
    size_bytes INTEGER,
    checksum TEXT,                  -- optional integrity (e.g., sha256)
    caption TEXT,
    position INTEGER,               -- relative order among a bookmark's images
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT content_type_chk CHECK (content_type IN ('image/png','image/jpeg','image/jpg'))
);

-- Avoid duplicate position numbers per bookmark (when specified)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'uniq_image_position_per_bookmark'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uniq_image_position_per_bookmark
             ON bookmark_images(bookmark_id, position)
             WHERE position IS NOT NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_images_bookmark_created
  ON bookmark_images(bookmark_id, created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_images_updated_at ON bookmark_images;
CREATE TRIGGER trg_images_updated_at
BEFORE UPDATE ON bookmark_images
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4) (Optional) quick seed examples guarded by NOT EXISTS
-- Seed a note and an image for the demo bookmark if present
DO $$
DECLARE
  demo_bm UUID;
BEGIN
  SELECT b.id INTO demo_bm
  FROM bookmarks b
  JOIN users u ON u.id = b.user_id
  WHERE u.email = 'demo@bookmarks.local'
  ORDER BY b.created_at ASC
  LIMIT 1;

  IF demo_bm IS NOT NULL THEN
    INSERT INTO bookmark_notes (bookmark_id, body)
    SELECT demo_bm, 'First note for demo bookmark'
    WHERE NOT EXISTS (SELECT 1 FROM bookmark_notes WHERE bookmark_id = demo_bm);

    INSERT INTO bookmark_images (bookmark_id, image_url, content_type, caption, position)
    SELECT demo_bm, 'https://via.placeholder.com/640x360.png', 'image/png', 'Placeholder', 1
    WHERE NOT EXISTS (SELECT 1 FROM bookmark_images WHERE bookmark_id = demo_bm);
  END IF;
END $$;
