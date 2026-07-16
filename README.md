# LegisArc

Legislative Records Management & Public Transparency Platform for LGUs.

## Architecture

```
Browser
   │  HttpOnly cookie (legisarc_token) on app origin
   ▼
Next.js client (:3000) ──Bearer from cookie──► Express API (:4000)
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                               PostgreSQL     local disk      DO Spaces
                                              /uploads        (prod files)
```

- Auth: **JWT + bcrypt**
- DB stores **relative object keys** only (`{lguId}/{kind}/{uuid}.ext`)
- Files: `STORAGE_DRIVER=local` (dev) or `spaces` (DigitalOcean Spaces / S3)

## Quick start

### 1. Prerequisites
- Node.js 20+
- Docker Desktop **or** a local PostgreSQL 16

### 2. Environment

```bash
cp .env.example .env
cp client/.env.example client/.env.local
```

Set the **same** `JWT_SECRET` in both files.

```env
DATABASE_URL=postgres://legisarc:legisarc_dev_password@localhost:5432/legisarc
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
API_PUBLIC_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
STORAGE_DRIVER=local
```

> **Secrets:** Put real passwords and `JWT_SECRET` only in `.env` / `client/.env.local` (gitignored).

### 3. Install

```bash
npm run install:all
```

### 4. Start PostgreSQL

**Option A — Docker Compose (recommended)**

```bash
npm run db:up
```

**Option B — Existing local Postgres**

```bash
createdb legisarc
psql %DATABASE_URL% -f server/db/schema.sql
psql %DATABASE_URL% -f server/db/seed-lgu.sql
```

### 5. Seed users

```bash
npm run db:seed
```

Demo logins (password `password123`):

| Email | Portal |
|-------|--------|
| `secretary@panglao.local` | LGU admin |
| `admin@legisarc.local` | Company super-admin |

### 6. Run apps

```bash
npm run dev
```

- UI: http://localhost:3000  
- API: http://localhost:4000/api/health  

## Auth flow

1. Browser `POST /api/auth/session` (Next) → Express `POST /api/auth/login`
2. Next sets **HttpOnly** cookie `legisarc_token` (`Secure` in production)
3. Middleware + Server Actions read the cookie; API calls use `Authorization: Bearer`
4. Logout: `DELETE /api/auth/session` clears the cookie

## File storage

| Driver | When | Where files live | Public URL |
|--------|------|------------------|------------|
| `local` | Development default | `server/uploads/` | `${API_PUBLIC_URL}/uploads/...` |
| `spaces` | Production (DO) | DigitalOcean Spaces | `${SPACES_CDN_URL}/...` |

Object keys in Postgres stay the same either way.

### Spaces CORS (required for `react-pdf` / downloads)

In the Spaces bucket CORS settings, allow your site origin:

- Origins: `https://your-domain.com` (and `http://localhost:3000` for local Spaces tests)
- Methods: `GET`, `HEAD`
- Headers: `*`
- Max age: `3600`

Enable the Spaces **CDN** endpoint and set `SPACES_CDN_URL`. Upload ACL is `public-read` for direct browser access to PDF/image URLs.

### Migrate existing local uploads → Spaces

```bash
# With STORAGE_DRIVER=spaces configured in .env
node server/db/migrate-uploads-to-spaces.mjs
```

Then keep `STORAGE_DRIVER=spaces` in production.

### Optional local S3 stand-in (MinIO)

```bash
docker compose --profile storage up -d
```

Point Spaces env vars at MinIO (`http://localhost:9000`) for integration tests.

## Production (DigitalOcean Droplet + Spaces)

See **[deploy/DEPLOY.md](deploy/DEPLOY.md)** for the full checklist:

1. Create Droplet + managed/local Postgres  
2. Create Spaces bucket + API keys + CDN  
3. Set production `.env` (`STORAGE_DRIVER=spaces`, strong `JWT_SECRET`, HTTPS URLs)  
4. `docker compose -f deploy/docker-compose.prod.yml up -d` (or nginx + Node)  
5. Apply schema/seed, run uploads migrator if needed  
6. Verify health, login cookie (`Secure; HttpOnly`), and PDF URLs on the CDN  

## Useful scripts

| Script | Description |
|--------|-------------|
| `npm run db:up` | Start Postgres container |
| `npm run db:down` | Stop Postgres container |
| `npm run db:seed` | Seed demo users/categories |
| `npm run dev` | Client + server together |
| `npm run build` | Build client + server |
| `npm run typecheck:server` | Typecheck Express |
