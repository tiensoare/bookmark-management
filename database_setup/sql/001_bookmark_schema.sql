-- Bookmark Management System: Core DB Schema (users, bookmarks)
-- Run this script in a fresh PostgreSQL database.

-- 0) Safety options
SET client_min_messages = WARNING;

-- 1) Required extension for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Schema (optional): keep default 'public' for simplicity

-- 3) Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT url_format_chk CHECK (url ~* '^(https?://)')
);

-- 4) Useful indexes & constraints
-- Prevent exact duplicate URL per user (can be relaxed later if needed)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_url ON bookmarks(user_id, url);
-- Speed up lookups by user and created_at
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);

-- 5) Update trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bookmarks_updated_at ON bookmarks;
CREATE TRIGGER trg_bookmarks_updated_at
BEFORE UPDATE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6) Seed (demo) - you can delete this for production
-- demo user: password is a placeholder hash string (replace with real hash when integrating auth)
WITH demo_user AS (
  INSERT INTO users (email, password_hash, display_name)
  VALUES ('demo@bookmarks.local', '$2b$12$EXAMPLEPLACEHOLDERHASH', 'Demo User')
  ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
  RETURNING id
)
INSERT INTO bookmarks (user_id, url, title, notes)
SELECT id,
       url,
       title,
       notes
FROM demo_user
CROSS JOIN (VALUES
  ('https://www.postgresql.org/', 'PostgreSQL', 'Docs & downloads'),
  ('https://dbeaver.io/', 'DBeaver', 'GUI client'),
  ('https://nodejs.org/', 'Node.js', 'Backend runtime')
) AS seed(url, title, notes)
ON CONFLICT DO NOTHING;

-- 7) Simple view to list bookmarks with user info
CREATE OR REPLACE VIEW v_user_bookmarks AS
SELECT
  b.id AS bookmark_id,
  u.email AS user_email,
  b.url, b.title, b.notes, b.is_archived,
  b.created_at, b.updated_at
FROM bookmarks b
JOIN users u ON u.id = b.user_id;
