# Bookmark Management System Database SetUp

## Files
- `docker-compose.yml` — runs Docker
- `sql/bookmark_schema.sql` — base schema
- `sql/002_notes_images_and_sort.sql` — migration adding notes, images, and optional manual sort order

---

## Quick Start (Docker)

> Download Docker Desktop (mac/win) or Docker Engine (linux)

1. **Folder layout**
   ```text
   your-folder/
   ├─ docker-compose.yml
   └─ sql/
      ├─ bookmark_schema.sql
      └─ 002_notes_images_and_sort.sql
   ```

2. **Start Postgres**
   ```bash
   docker compose up -d
   ```
   This launches Postgres on `localhost:5432`, creates DB `bms_db`, user `bms_user`, password `bms_password`, and auto-runs `bookmark_schema.sql` on first init.

3. **Apply migration (notes/images/sort)**
   ```bash
   docker exec -i bms-postgres psql -U bms_user -d bms_db < ./sql/002_notes_images_and_sort.sql
   ```

4. **Verify**
   ```bash
   docker exec -it bms-postgres psql -U bms_user -d bms_db -c "\dt"
   docker exec -it bms-postgres psql -U bms_user -d bms_db -c "\dv"
   docker exec -it bms-postgres psql -U bms_user -d bms_db -c "SELECT * FROM v_user_bookmarks;"
   ```
   You should see tables: `users`, `bookmarks`, `bookmark_notes`, `bookmark_images` and the view `v_user_bookmarks`.
   
---

## DBeaver (GUI) Setup

1. Install **DBeaver Community**.
2. New Connection → **PostgreSQL** → enter:
   - Host: `localhost`
   - Port: `5432` (or `5433` if you changed it)
   - Database: `bms_db`
   - User: `bms_user`
   - Password: `bms_password`
3. Test → Finish.
4. Expand **Schemas → public → Tables** (see `users`, `bookmarks`, `bookmark_notes`, `bookmark_images`).
5. Expand **Views** → `v_user_bookmarks`.
6. Right-click a table/view → **Read data** to inspect rows.

---

## The tables

### users
| column        | type        | notes                           |
|---------------|-------------|---------------------------------|
| id            | uuid        | PK (`gen_random_uuid()`)        |
| email         | text        | unique                          |
| password_hash | text        | hashed only                     |
| display_name  | text        | optional                        |
| created_at    | timestamptz | default now                     |
| updated_at    | timestamptz | auto via trigger                |

### bookmarks
| column      | type        | notes                                                   |
|-------------|-------------|---------------------------------------------------------|
| id          | uuid        | PK                                                      |
| user_id     | uuid        | FK → users(id) `ON DELETE CASCADE`                      |
| url         | text        | must start with http/https (check constraint)           |
| title       | text        | optional                                                |
| notes       | text        | optional (freeform text; detailed notes live in table)  |
| is_archived | boolean     | default false                                           |
| sort_order  | integer     | optional manual ordering per user (unique if set)       |
| created_at  | timestamptz | default now                                             |
| updated_at  | timestamptz | auto via trigger                                        |

**Indexes/Constraints**
- `UNIQUE (user_id, url)` — prevent duplicate links per user
- `idx_bookmarks_user_created (user_id, created_at DESC)`
- `uniq_bookmark_sort_per_user (user_id, sort_order) WHERE sort_order IS NOT NULL`

### bookmark_notes
| column      | type        | notes                                      |
|-------------|-------------|--------------------------------------------|
| id          | uuid        | PK                                         |
| bookmark_id | uuid        | FK → bookmarks(id) `ON DELETE CASCADE`     |
| body        | text        | note content (plain or markdown)           |
| created_at  | timestamptz | default now                                |
| updated_at  | timestamptz | auto via trigger                           |

### bookmark_images
| column       | type    | notes                                                                 |
|--------------|---------|-----------------------------------------------------------------------|
| id           | uuid    | PK                                                                    |
| bookmark_id  | uuid    | FK → bookmarks(id) `ON DELETE CASCADE`                                |
| image_url    | text    | object storage URL or local path                                      |
| content_type | text    | `image/png`, `image/jpeg`, or `image/jpg`                             |
| width_px     | int     | optional                                                              |
| height_px    | int     | optional                                                              |
| size_bytes   | int     | optional                                                              |
| checksum     | text    | optional (sha256, etc.)                                               |
| caption      | text    | optional                                                              |
| position     | int     | optional gallery ordering (unique per bookmark when present)          |
| created_at   | timestamptz | default now                                                       |
| updated_at   | timestamptz | auto via trigger                                                  |

**Indexes/Constraints**
- `idx_notes_bookmark_created (bookmark_id, created_at DESC)`
- `idx_images_bookmark_created (bookmark_id, created_at DESC)`
- `uniq_image_position_per_bookmark (bookmark_id, position) WHERE position IS NOT NULL`
- `content_type_chk` on `bookmark_images`

### view: v_user_bookmarks
Convenience list of bookmarks with user email.

---

## Sample Queries

```sql
-- list all users
SELECT id, email, display_name FROM users;

-- list bookmarks (newest first) for a user
SELECT * FROM bookmarks WHERE user_id = 'USER_UUID' ORDER BY created_at DESC;

-- set manual ordering
UPDATE bookmarks SET sort_order = 1 WHERE id = 'BOOKMARK_UUID_1';
UPDATE bookmarks SET sort_order = 2 WHERE id = 'BOOKMARK_UUID_2';

-- add a note
INSERT INTO bookmark_notes (bookmark_id, body)
VALUES ('BOOKMARK_UUID', 'This is a test note')
RETURNING id, created_at;

-- add images
INSERT INTO bookmark_images (bookmark_id, image_url, content_type, caption, position)
VALUES
('BOOKMARK_UUID', 'https://example.com/cover.jpg', 'image/jpeg', 'Cover', 1),
('BOOKMARK_UUID', 'https://example.com/screen.png', 'image/png', 'Screenshot', 2);

-- fetch notes/images
SELECT * FROM bookmark_notes WHERE bookmark_id = 'BOOKMARK_UUID' ORDER BY created_at DESC;
SELECT * FROM bookmark_images WHERE bookmark_id = 'BOOKMARK_UUID' ORDER BY COALESCE(position, 999999), created_at;
```
## Definition of Done (Sprint Checklist)

- [ ] Container running (`docker compose ps` shows **Up**)  
- [ ] Tables present: `users`, `bookmarks`, `bookmark_notes`, `bookmark_images`  
- [ ] View present: `v_user_bookmarks`  
- [ ] Seed rows visible (run `SELECT * FROM v_user_bookmarks;`)  
- [ ] Screenshots added to sprint doc (DBeaver connection + tables + data view)
