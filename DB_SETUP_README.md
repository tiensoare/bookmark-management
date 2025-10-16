# Bookmark Management System — Sprint 1 DB Deliverable

This package has instructions to initialize the database with tables users and bookmarks using docker and postgresql.

## Files

- `sql/bookmark_schema.sql` — seed data
- `docker-compose.yml` — docker setup

---

## One‑command Docker setup

**Prereqs:** Download Docker Desktop (or Docker Engine)

1. Create a folder and place the two files inside, keeping the structure:
   ```
   your-folder/
   ├── docker-compose.yml
   └── sql/
       └── bookmark_schema.sql
   ```

2. In the terminal, navigate to the folder, run:
   ```bash
   docker compose up -d
   ```
   This starts a Postgres on `localhost:5432` with:
   - DB name: `bms_db`
   - User: `bms_user`
   - Password: `bms_password`

   The `bookmark_schema.sql` will auto‑run and create tables

3. To verify with `psql` (requires local psql client):
   ```bash
   PGPASSWORD=bms_password psql -h localhost -U bms_user -d bms_db -c "\dt" -c "SELECT * FROM v_user_bookmarks;"
   ```

4. Stop DB when done:
   ```bash
   docker compose down
   ```

---

## Using DBeaver to View Tables

**Prereqs:** Install Local PostgreSQL + DBeaver Community.

1. Open **DBeaver** → **New Database Connection** → **PostgreSQL** → fill in host, port, user, password, database → **Finish**.

2. In DBeaver, right‑click your connection → **SQL Editor** → **Open SQL Script** → load `bookmark_schema.sql` → **Execute**.


## Credentials & Connection Info

- **Docker**: `localhost:5432`, DB: `bms_db`, User: `bms_user`, Pass: `bms_password`



## What’s created

### `users`
| column        | type        | notes                          |
|---------------|-------------|--------------------------------|
| id            | uuid        | PK, `gen_random_uuid()`        |
| email         | text        | unique                         |
| password_hash | text        | store hashed passwords only    |
| display_name  | text        | optional                       |
| created_at    | timestamptz | default now                    |
| updated_at    | timestamptz | auto‑updates on row change     |

### `bookmarks`
| column      | type        | notes                                          |
|-------------|-------------|------------------------------------------------|
| id          | uuid        | PK, `gen_random_uuid()`                        |
| user_id     | uuid        | FK → users(id), cascade on delete              |
| url         | text        | must start with http/https (check constraint)  |
| title       | text        | optional                                       |
| notes       | text        | optional                                       |
| is_archived | boolean     | default false                                  |
| created_at  | timestamptz | default now                                    |
| updated_at  | timestamptz | auto‑updates on row change                     |
