-- Migration 002: Sorting and Images for Bookmarks
-- Keeps notes in bookmarks table, adds sort_order and images
SET client_min_messages = WARNING;

-- 1) Add optional manual sort field to bookmarks (per-user ordering)
ALTER TABLE bookmarks
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Keep sort_order unique per user if provided (nulls allowed and ignored)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'uniq_bookmark_sort_per_user'
    ) THEN
        CREATE UNIQUE INDEX uniq_bookmark_sort_per_user
            ON bookmarks(user_id, sort_order)
            WHERE sort_order IS NOT NULL;
    END IF;
END $$;

-- 2) Images table (1-to-many from bookmarks)
CREATE TABLE IF NOT EXISTS bookmark_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    content_type TEXT NOT NULL,
    width_px INTEGER,
    height_px INTEGER,
    size_bytes INTEGER,
    checksum TEXT,
    caption TEXT,
    position INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT content_type_chk CHECK (content_type IN ('image/png','image/jpeg','image/jpg','image/gif','image/webp'))
);

-- Avoid duplicate position numbers per bookmark (when specified)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'uniq_image_position_per_bookmark'
    ) THEN
        CREATE UNIQUE INDEX uniq_image_position_per_bookmark
            ON bookmark_images(bookmark_id, position)
            WHERE position IS NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_images_bookmark_created
    ON bookmark_images(bookmark_id, created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_images_updated_at ON bookmark_images;
CREATE TRIGGER trg_images_updated_at
    BEFORE UPDATE ON bookmark_images
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3) Update view to include sort_order and image count
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
    COUNT(bi.id) AS images_count
FROM bookmarks b
JOIN users u ON u.id = b.user_id
LEFT JOIN bookmark_images bi ON bi.bookmark_id = b.id
GROUP BY b.id, u.email, b.url, b.title, b.notes, b.is_archived, b.sort_order, b.created_at, b.updated_at;

-- 4) Seed a demo image for the first demo bookmark
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
        INSERT INTO bookmark_images (bookmark_id, image_url, content_type, caption, position)
        SELECT demo_bm, 'https://via.placeholder.com/640x360.png', 'image/png', 'Demo placeholder image', 1
        WHERE NOT EXISTS (SELECT 1 FROM bookmark_images WHERE bookmark_id = demo_bm);
    END IF;
END $$;