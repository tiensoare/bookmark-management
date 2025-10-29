-- Migration 003: Bookmark editing support (versioning + audit trail)
-- Clean, idempotent migration to layer on top of Sprint 1 schema from this chat.

SET client_min_messages = WARNING;

-- =====================================================================
-- 1) VERSION COLUMN ON BOOKMARKS (OPTIMISTIC CONCURRENCY)
-- =====================================================================
ALTER TABLE IF EXISTS bookmarks
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Function to bump version before each update
CREATE OR REPLACE FUNCTION bump_bookmark_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(OLD.version, 1) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace version bump trigger
DROP TRIGGER IF EXISTS trg_bookmarks_bump_version ON bookmarks;
CREATE TRIGGER trg_bookmarks_bump_version
BEFORE UPDATE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION bump_bookmark_version();

-- =====================================================================
-- 2) AUDIT TABLE + TRIGGER (BEFORE/AFTER SNAPSHOTS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS bookmark_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  editor_user_id UUID,                            -- optional: who made the change
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  old_row JSONB NOT NULL,
  new_row JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookmark_edits_bookmark_time
  ON bookmark_edits(bookmark_id, changed_at DESC);

-- Audit function: write JSONB snapshots AFTER UPDATE
CREATE OR REPLACE FUNCTION audit_bookmark_update()
RETURNS TRIGGER AS $$
DECLARE
  oldj JSONB;
  newj JSONB;
BEGIN
  -- full rows (keep updated_at/version so you can see them change)
  oldj := to_jsonb(OLD);
  newj := to_jsonb(NEW);

  INSERT INTO bookmark_edits (bookmark_id, editor_user_id, old_row, new_row)
  VALUES (OLD.id, NULL, oldj, newj);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace audit trigger
DROP TRIGGER IF EXISTS trg_bookmarks_audit ON bookmarks;
CREATE TRIGGER trg_bookmarks_audit
AFTER UPDATE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION audit_bookmark_update();

-- =====================================================================
-- 3) OPTIONAL VIEW FOR QUICK INSPECTION
-- =====================================================================
CREATE OR REPLACE VIEW v_bookmark_versions AS
SELECT id, user_id, url, title, is_archived, sort_order, version, created_at, updated_at
FROM bookmarks;
