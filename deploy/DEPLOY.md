# Deploy LegisArc on DigitalOcean (Droplet + Spaces)

## Target architecture

- **Droplet:** nginx (TLS) → Next.js `:3000` + Express `:4000` + Postgres
- **Spaces:** PDF/image objects (public-read + CDN)
- **Postgres:** paths/metadata only (never file bytes)

## 1. Create infrastructure

1. Create a Droplet (Ubuntu 24.04, 2GB+ RAM recommended).
2. Create a **Spaces** bucket in your preferred region; enable **CDN**.
3. Create Spaces access keys (key + secret).
4. Open firewall: `22`, `80`, `443` (and optionally `3000`/`4000` only for debugging).

## 2. Spaces bucket settings

1. File listing can stay private; uploaded objects use `public-read` ACL.
2. Configure **CORS** for your site origin:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

3. Note:
   - Endpoint: `https://<region>.digitaloceanspaces.com`
   - CDN URL: `https://<bucket>.<region>.cdn.digitaloceanspaces.com`

## 3. Environment on the Droplet

Clone the repo, then:

```bash
cp .env.example .env
cp client/.env.example client/.env.local
```

Production `.env` essentials:

```env
NODE_ENV=production
DATABASE_URL=postgres://legisarc:STRONG_DB_PASSWORD@postgres:5432/legisarc
POSTGRES_PASSWORD=STRONG_DB_PASSWORD
JWT_SECRET=LONG_RANDOM_SECRET_AT_LEAST_32_CHARS
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
API_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com

STORAGE_DRIVER=spaces
SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
SPACES_REGION=sgp1
SPACES_BUCKET=your-bucket
SPACES_KEY=...
SPACES_SECRET=...
SPACES_CDN_URL=https://your-bucket.sgp1.cdn.digitaloceanspaces.com
```

Use the **same** `JWT_SECRET` in `client/.env.local` for local rebuilds.

> When nginx proxies `/api` to Express on the same host, set `API_PUBLIC_URL` and `NEXT_PUBLIC_API_URL` to the public HTTPS origin (not `:4000`).

## 4. Start with Docker Compose

From the repo root:

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build
```

Seed demo users only on fresh empty DBs (optional):

```bash
docker compose -f deploy/docker-compose.prod.yml exec api node db/seed.mjs
```

Health checks:

```bash
curl -sS http://127.0.0.1:4000/api/health
curl -sS -I http://127.0.0.1:3000/
```

## 5. Host nginx + TLS

1. Install nginx + certbot.
2. Copy [`nginx.conf`](./nginx.conf), replace `example.com`, enable the site.
3. `certbot --nginx -d your-domain.com`
4. Reload nginx.

Login cookie should show `HttpOnly` and `Secure` under Application → Cookies.

## 6. Migrate existing local files (if any)

If you previously used `server/uploads`:

```bash
# On a machine with the uploads folder + Spaces credentials in .env
node server/db/migrate-uploads-to-spaces.mjs
```

DB paths are already relative keys — no SQL rewrite needed.

## 7. Backups

- **Postgres:** nightly `pg_dump` (or DO Managed DB backups).
- **Spaces:** enable bucket versioning if available; treat Spaces as source of truth for files.
- **Secrets:** never commit `.env`; rotate Spaces keys if leaked.

## 8. Smoke test checklist

- [ ] `GET /api/health` OK  
- [ ] Company + LGU login works; cookie is `HttpOnly; Secure; SameSite=Lax`  
- [ ] Upload ordinance PDF → DB has relative key → browser opens CDN URL  
- [ ] Replace/delete removes Spaces object  
- [ ] Public portal PDF viewer loads (Spaces CORS OK)  
- [ ] Logout clears session  

## Local disk fallback

For a tiny pilot without Spaces yet, set `STORAGE_DRIVER=local` and keep the `legisarc_uploads` volume. Move to Spaces before file volume grows.
