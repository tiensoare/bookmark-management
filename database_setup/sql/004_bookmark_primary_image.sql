-- 004_bookmark_primary_image.sql
-- Adds a primary image to `bookmarks` that can be either a URL or a BLOB.
-- Safe to re-run (idempotent), does not remove your existing `bookmark_images` table.

SET client_min_messages = WARNING;
SET search_path = public, pg_catalog;

-- 0) Ensure pgcrypto exists (001 created it, but this is safe)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Primary-image columns on bookmarks
ALTER TABLE public.bookmarks
  ADD COLUMN IF NOT EXISTS image_url    text,
  ADD COLUMN IF NOT EXISTS image_blob   bytea,
  ADD COLUMN IF NOT EXISTS image_mime   text,
  ADD COLUMN IF NOT EXISTS image_size   integer,
  ADD COLUMN IF NOT EXISTS image_sha256 bytea,
  ADD COLUMN IF NOT EXISTS image_alt    text;

-- 2) Guardrails
-- Either URL or BLOB (not both)
ALTER TABLE public.bookmarks
  ADD CONSTRAINT IF NOT EXISTS image_exclusive
  CHECK (image_url IS NULL OR image_blob IS NULL);

-- If BLOB present, recorded size must match actual size
ALTER TABLE public.bookmarks
  ADD CONSTRAINT IF NOT EXISTS image_size_check
  CHECK (image_blob IS NULL OR octet_length(image_blob) = image_size);

-- Reasonable URL length limit
ALTER TABLE public.bookmarks
  ADD CONSTRAINT IF NOT EXISTS image_url_len
  CHECK (image_url IS NULL OR length(image_url) <= 2048);

-- Optional: hard cap 5 MB on blob
ALTER TABLE public.bookmarks
  ADD CONSTRAINT IF NOT EXISTS image_blob_max_5mb
  CHECK (image_blob IS NULL OR octet_length(image_blob) <= 5*1024*1024);

-- 3) Indexes
-- Deduplicate blobs by content (partial unique so NULLs are ignored)
CREATE UNIQUE INDEX IF NOT EXISTS ux_bookmarks_image_sha
  ON public.bookmarks ((encode(image_sha256, 'hex')))
  WHERE image_sha256 IS NOT NULL;

-- Fast lookups/filtering for rows with a URL
CREATE INDEX IF NOT EXISTS ix_bookmarks_image_url
  ON public.bookmarks (image_url)
  WHERE image_url IS NOT NULL;

-- 4) Trigger: auto-derive size + sha256 when image_blob changes
CREATE OR REPLACE FUNCTION public.fn_bookmarks_image_derive() RETURNS trigger AS $$
BEGIN
  IF TG_OP IN ('INSERT','UPDATE')
     AND (NEW.image_blob IS DISTINCT FROM COALESCE(OLD.image_blob, '\x'::bytea)) THEN
    IF NEW.image_blob IS NULL THEN
      NEW.image_size   := NULL;
      NEW.image_sha256 := NULL;
    ELSE
      NEW.image_size   := octet_length(NEW.image_blob);
      NEW.image_sha256 := digest(NEW.image_blob, 'sha256'); -- pgcrypto
    END IF;
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookmarks_image_derive ON public.bookmarks;
CREATE TRIGGER trg_bookmarks_image_derive
  BEFORE INSERT OR UPDATE OF image_blob ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.fn_bookmarks_image_derive();

-- 5) (Optional) Extend the view from 002 to expose primary image fields
-- Keep image count from gallery; add primary image URL/mime/size
DROP VIEW IF EXISTS v_user_bookmarks;
CREATE OR REPLACE VIEW v_user_bookmarks AS
SELECT
    b.id AS bookmark_id,
    u.email AS user_email,
    b.url,
    b.title,
    b.notes,
    b.is_archived,
    b.sort_order,
    b.created_at,
    b.updated_at,
    COUNT(bi.id) AS images_count,
    b.image_url     AS primary_image_url,
    b.image_mime    AS primary_image_mime,
    b.image_size    AS primary_image_size,
    b.image_alt     AS primary_image_alt,
    (b.image_blob IS NOT NULL) AS primary_image_has_blob
FROM public.bookmarks b
JOIN public.users u ON u.id = b.user_id
LEFT JOIN public.bookmark_images bi ON bi.bookmark_id = b.id
GROUP BY b.id, u.email, b.url, b.title, b.notes, b.is_archived, b.sort_order,
         b.created_at, b.updated_at, b.image_url, b.image_mime, b.image_size, b.image_alt, b.image_blob;