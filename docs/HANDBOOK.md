# LegisArc — Operations & Project Handbook

Compiled from the Express/Postgres migration, Spaces readiness work, and DigitalOcean production launch (`legisarc.net`).

---

## 1. What LegisArc is

Legislative Records Management & Public Transparency Platform for Philippine LGUs (Sangguniang Bayan).

| Portal | Audience | URL path |
|--------|----------|----------|
| Public | Citizens | `/home`, ordinances, resolutions, minutes, etc. |
| LGU Admin | SB staff | `/admin/*` |
| Company (Super Admin) | LegisArc operator | `/super-admin/*` |
| Login | All internal users | `/login` |

Production site: **https://legisarc.net**

GitHub: **https://github.com/amaquincj07-a11y/Legis-Arc.git**

---

## 2. Architecture

```
Browser (any PC)
    │  HTTPS
    ▼
nginx (Droplet) ──TLS──► Next.js :3000  (UI + /api/auth/session cookie bridge)
         │
         └── /api/* ──► Express :4000  (JWT auth + business APIs)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         PostgreSQL      local disk      DigitalOcean Spaces
         (metadata)      /uploads        (PDFs/images, CDN)
                         (dev only)
```

### Design rules

- **DB** stores metadata + **relative file keys** only: `{lguId}/{kind}/{uuid}.ext`
- **File bytes** live in Spaces (production) or `server/uploads` (local)
- **JWT** in HttpOnly cookie `legisarc_token` (Secure in production)
- **LGU data is isolated** by `lgu_id` (categories, docs, users per municipality)
- One LGU’s category edits never affect another LGU

### Storage driver

| `STORAGE_DRIVER` | Files | Public URL |
|------------------|-------|------------|
| `local` | `server/uploads/` | `${API_PUBLIC_URL}/uploads/...` |
| `spaces` | DigitalOcean Spaces | `${SPACES_CDN_URL}/...` |

---

## 3. Monorepo layout

```
LegisArc/
├── client/          # Next.js 16 (App Router)
├── server/          # Express + pg + JWT + multer/Spaces
├── deploy/          # nginx, docker-compose.prod.yml, DEPLOY.md
├── docker-compose.yml   # local Postgres (+ optional MinIO)
├── .env             # secrets (gitignored) — local OR copy pattern for Droplet
├── .env.example     # safe placeholders only
└── README.md
```

---

## 4. Environment variables

### Required everywhere

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Same value on API + Next (min 8 chars; use 32+ in prod) |

### App URLs

| Variable | Local example | Production |
|----------|---------------|------------|
| `FRONTEND_URL` | `http://localhost:3000` | `https://legisarc.net` |
| `CORS_ORIGIN` | `http://localhost:3000` | `https://legisarc.net` |
| `API_PUBLIC_URL` | `http://localhost:4000` | `https://legisarc.net` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | `https://legisarc.net` |

### Spaces (production)

| Variable | Example |
|----------|---------|
| `STORAGE_DRIVER` | `spaces` |
| `SPACES_ENDPOINT` | `https://sgp1.digitaloceanspaces.com` |
| `SPACES_REGION` | `sgp1` |
| `SPACES_BUCKET` | `legisarc-files` |
| `SPACES_KEY` | Access Key from DO Spaces → Access Keys |
| `SPACES_SECRET` | Secret shown **once** at key creation |
| `SPACES_CDN_URL` | `https://legisarc-files.sgp1.cdn.digitaloceanspaces.com` |

### Docker Compose also needs

| Variable | Purpose |
|----------|---------|
| `POSTGRES_USER` | default `legisarc` |
| `POSTGRES_PASSWORD` | must match password in `DATABASE_URL` |
| `POSTGRES_DB` | `legisarc` |

**Never commit `.env` or `client/.env.local`.** Only `.env.example` files are in Git.

---

## 5. Local development

### Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres) **or** local Postgres 16

### Setup

```bash
cp .env.example .env
cp client/.env.example client/.env.local
# Set the SAME JWT_SECRET in both files
# STORAGE_DRIVER=local for local work

npm run install:all
npm run db:up          # Postgres container
npm run db:seed        # demo users
npm run dev            # client :3000 + server :4000
```

- UI: http://localhost:3000  
- API health: http://localhost:4000/api/health  

### Local demo accounts (seed)

| Email | Portal | Default password |
|-------|--------|------------------|
| `secretary@panglao.local` | LGU admin | `password123` (or `SEED_PASSWORD`) |
| `admin@legisarc.local` | Company super-admin | `password123` |

### Useful local scripts

| Command | Meaning |
|---------|---------|
| `npm run db:up` / `db:down` | Start/stop Postgres |
| `npm run db:seed` | Seed demo LGU + users |
| `npm run build` | Build client + server |
| `npm run typecheck:server` | Typecheck Express |
| `node server/db/migrate-default-categories.mjs` | Backfill default categories |
| `node server/db/migrate-uploads-to-spaces.mjs` | Upload local files → Spaces |

---

## 6. Production (DigitalOcean)

### Stack on Droplet

| Piece | Role |
|-------|------|
| Droplet Ubuntu 24.04 | Host (`129.212.235.172` at launch) |
| Docker Compose | `postgres` + `api` + `web` |
| nginx + Certbot | HTTPS for `legisarc.net` / `www` |
| Spaces + CDN | PDFs / SB member images |
| Hostinger | Domain DNS + email (`support@legisarc.net`) |

App path on server: **`/opt/legisarc`**

### Deploy / rebuild

```bash
cd /opt/legisarc
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build
```

Always pass **`--env-file .env`** for compose commands that need `POSTGRES_PASSWORD`.

### nginx routing (important)

| Path | Backend |
|------|---------|
| `/api/auth/session` | Next.js `:3000` (HttpOnly cookie) |
| `/api/*` (other) | Express `:4000` |
| `/` | Next.js `:3000` |

Config reference: `deploy/nginx.conf`  
Full checklist: `deploy/DEPLOY.md`

### Spaces CORS (DigitalOcean panel)

| Field | Value |
|-------|--------|
| Origin | `https://legisarc.net` **and** `https://www.legisarc.net` |
| Methods | **GET**, **HEAD** only |
| Allowed Headers | `*` |
| Max Age | `3600` |

Uploads go through the API (not browser → Spaces), so PUT/POST/DELETE are not required in CORS.

### Hostinger DNS (must point to Droplet — not Vercel)

| Type | Name | Content |
|------|------|---------|
| A | `@` | Droplet IP (e.g. `129.212.235.172`) |
| A | `www` | Same Droplet IP |

**Remove** any Vercel CNAME for `www` (`*.vercel-dns-*.com`).

**Keep** Hostinger email records (MX, SPF, DMARC, DKIM) for `support@legisarc.net`.

Verify before Certbot:

```bat
nslookup legisarc.net
nslookup www.legisarc.net
```

Both must show the Droplet IP (not `216.198.79.x`).

### HTTPS

```bash
sudo certbot --nginx -d legisarc.net -d www.legisarc.net
```

Only after DNS points to the Droplet.

---

## 7. Accounts & auth

### Production company admin

Created on production DB (example from ops):

- **Email:** `support@legisarc.net`
- **Account type:** `company` (Super Admin portal)
- **password_hash:** bcrypt hash stored in `profiles.password_hash`
- Login at: https://legisarc.net/login → Super Admin

> If a bcrypt string was inserted as `password_hash`, login uses the **original plaintext** that created that hash — not the `$2b$10$...` string itself.

### Auth flow

1. Browser `POST /api/auth/session/` (Next) → Express `POST /api/auth/login`
2. Next sets **HttpOnly** cookie `legisarc_token` (`Secure` on HTTPS)
3. Middleware + Server Actions read cookie; API calls use `Authorization: Bearer`
4. Logout: `DELETE /api/auth/session/`

### Roles (LGU)

| Role | Typical access |
|------|----------------|
| `sb_secretary` | Full document/category management |
| `sb_member` | View / limited |
| `digitization_assistant` | Upload-oriented |
| Company (`account_type=company`) | Manage LGUs, subscriptions |

### Secure access for other developers

| Access | How |
|--------|-----|
| Code | GitHub collaborator on Legis-Arc |
| Server | Their own SSH public key on Droplet |
| Secrets | Password manager only — never GitHub/chat |
| App users | Create in Super Admin / LGU Users UI |

Production does **not** depend on your laptop. Anyone with the domain URL can use the public/admin sites; developers use GitHub + SSH.

---

## 8. Default document categories (per new LGU)

Seeded when a Company Admin creates an LGU (isolated copy per `lgu_id`):

Administrative Matters, Agriculture, Budget, Celebrations, Coastal Management, Education, Environment, Fees and Charges, Franchise, Health, History and Heritage, Information Technology, Infrastructure, Land Use / Zoning, Loans and other Fiscal Matters, MOA/MOU/Usufruct/Contracts & Agreements, Monetary Aide and other requests, Municipal Lots, NGO/PO Accreditation, Peace and Order, Penal Criminal and Regulatory, Purok System, Risk Reduction, Sisterhood Agreement, Sports / Amusement, Taxes, Tourism, Traffic Matters, Transportation, Waterworks, Women and Children / PWD / Senior Citizen

Source of truth in code: `server/src/lib/default-document-categories.ts`

---

## 9. Series year dropdowns (ordinances / resolutions)

Years from **1980 → current calendar year** (no gaps), auto-extends each year.  
Helper: `getSeriesYearOptions()` in `client/src/lib/constants.ts`

---

## 10. Backups

### One-shot Postgres dump

```bash
sudo mkdir -p /opt/backups
cd /opt/legisarc

docker compose -f deploy/docker-compose.prod.yml --env-file .env exec -T postgres \
  pg_dump -U legisarc legisarc | gzip > /opt/backups/legisarc-$(date +%F).sql.gz

ls -lh /opt/backups/
```

### Nightly cron (optional)

```cron
15 2 * * * cd /opt/legisarc && docker compose -f deploy/docker-compose.prod.yml --env-file .env exec -T postgres pg_dump -U legisarc legisarc | gzip > /opt/backups/legisarc-$(date +\%F).sql.gz
```

Also back up **Spaces** (files) separately; DB has paths only.

---

## 11. Create / reset company admin (SQL on Droplet)

```bash
cd /opt/legisarc

docker compose -f deploy/docker-compose.prod.yml --env-file .env exec -T postgres \
  psql -U legisarc -d legisarc -c "
DELETE FROM profiles WHERE lower(email) = 'support@legisarc.net';
INSERT INTO profiles (
  email, password_hash, account_type, role, lgu_id,
  full_name, position, is_active, is_primary_admin
) VALUES (
  'support@legisarc.net',
  'REPLACE_WITH_BCRYPT_HASH',
  'company', NULL, NULL,
  'LegisArc Support', 'System Administrator', true, false
);
"
```

To hash a new plaintext password locally or in the api container, use bcrypt (cost 10) matching the app (`bcryptjs`).

---

## 12. Smoke test checklist (production)

- [ ] `https://legisarc.net` loads from phone / other PC  
- [ ] `GET https://legisarc.net/api/health` (via nginx) OK  
- [ ] Login cookie: HttpOnly + Secure  
- [ ] Company admin → Super Admin dashboard  
- [ ] Create LGU → default categories appear  
- [ ] Upload ordinance PDF → opens on Spaces CDN URL  
- [ ] Public PDF viewer works (Spaces CORS)  
- [ ] Logout clears session  
- [ ] `.env` not in GitHub  

---

## 13. Known gaps / follow-ups

| Item | Status |
|------|--------|
| Droplet + Spaces + Postgres deploy | Done |
| HttpOnly Secure cookies | Done |
| Password-reset **email** (SMTP) | Not wired — reset links may still log on server |
| Server-side list pagination | Future (large LGU archives) |
| CI/CD pipeline | Manual `git pull` + compose for now |

---

## 14. Quick command cheat sheet

```bash
# SSH
ssh root@YOUR_DROPLET_IP

# App dir
cd /opt/legisarc

# Logs
docker compose -f deploy/docker-compose.prod.yml --env-file .env logs -f api
docker compose -f deploy/docker-compose.prod.yml --env-file .env logs -f web

# Health (on server)
curl -sS http://127.0.0.1:4000/api/health
curl -sS -I http://127.0.0.1:3000/

# Rebuild after code pull
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build

# nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## 15. Security reminders

1. Never commit `.env`, Spaces secrets, or DB passwords.  
2. Prefer strong unique `JWT_SECRET` and `POSTGRES_PASSWORD` in production.  
3. Firewall: only **22**, **80**, **443** public — not Postgres `5432` or `3000`/`4000`.  
4. Each developer: own SSH key + GitHub access; share secrets via a vault.  
5. Rotate Spaces keys if ever leaked in chat or screenshots.

---

*This handbook reflects the LegisArc state after the Express/Postgres migration, Spaces dual-storage work, and the legisarc.net DigitalOcean launch.*
