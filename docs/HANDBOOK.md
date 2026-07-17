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
| `INTERNAL_API_URL` | _(omit locally)_ | `http://api:4000` (Docker Compose sets this for `web`) |

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

**No spaces in Spaces URLs.** A typo like `https:// legisarc-files...` (space after `://`) becomes `https://%20legisarc-files...` in the browser and PDFs fail with `ERR_NAME_NOT_RESOLVED`. On the Droplet, confirm:

```bash
grep SPACES_CDN_URL /opt/legisarc/.env
# must be exactly (no space after https://):
# SPACES_CDN_URL=https://legisarc-files.sgp1.cdn.digitaloceanspaces.com
```

Then restart the API: `docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d api`

**Public file access (required for PDF / SB member images):** DigitalOcean objects are **private by default**. LegisArc uploads with `ACL: public-read` (`SPACES_OBJECT_ACL=public-read`). If the browser shows XML `AccessDenied` on the CDN URL:

1. Redeploy/restart API with public-read uploads enabled (default).
2. Make **existing** private objects public:

```bash
# From repo root (Spaces env must be in `.env`)
node server/db/make-spaces-objects-public.mjs
```

Or in the DigitalOcean panel: Space → select files → **Manage Permissions** → **Public**.

3. Spaces **CORS**: Origins `https://legisarc.net` and `https://www.legisarc.net`; Methods **GET**, **HEAD**; Headers `*`.

Optional: apply a Space-wide public-read **bucket policy** (API/s3cmd) so all objects are readable even without per-object ACL.

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

### Updating code → production (standard workflow)

There is **no CI/CD yet**. Every release is: verify locally → push to GitHub → rebuild on the Droplet.

**Important:** Local `npm run build` does **not** upload anything to production. It only proves the code compiles. Production images are built again on the Droplet by Docker Compose.

#### A. On your PC (before deploy)

```bash
# 1. From the repo root — catch TypeScript / build errors early
npm run build

# 2. Review what will be committed (never stage .env or secrets)
git status
git diff

# 3. Commit and push to GitHub
git add .
git commit -m "Short description of the change"
git push
```

Notes:

- Prefer a clear commit message (what changed and why).
- After the branch already tracks `origin`, plain `git push` is enough. Use `git push -u origin main` only the first time you set upstream.
- Do **not** commit `.env`, `client/.env.local`, passwords, or Spaces keys (they are gitignored).
- If `npm run build` fails, fix it before pushing.

#### B. On the Droplet (deploy)

```bash
ssh root@129.212.235.172

cd /opt/legisarc

# If Git says "dubious ownership", trust this directory once:
# git config --global --add safe.directory /opt/legisarc

git pull
docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build
```

Always pass **`--env-file .env`** for compose commands that need `POSTGRES_PASSWORD`.

#### C. Smoke-check after rebuild

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file .env ps
curl -sS http://127.0.0.1:4000/api/health
curl -sS -I http://127.0.0.1:3000/
```

Then hard-refresh https://legisarc.net in the browser (`Ctrl+Shift+R`).

One-liner after SSH (when `safe.directory` is already set):

```bash
cd /opt/legisarc && git pull && docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build
```

### Droplet access & deploy troubleshooting

Use this when SSH fails, the Web Console asks for a password, or a rebuild looks “stuck.”

#### DigitalOcean Web Console vs Recovery Console

| Control | When to use |
|---------|-------------|
| **Web Console** (top-right on the Droplet page) | Normal browser terminal into the running Droplet. Prefer this when local SSH fails. |
| **Recovery Console** / recovery “Launch Console” (Settings) | Only if the Droplet will not boot or Web Console cannot reach it. Requires password auth / recovery ISO. |

**Login:** username is `root`.

**If it asks for a password:** Droplets created with SSH keys often have no remembered root password. On the Droplet **Settings** page, use **Reset root password**. DigitalOcean emails a temporary password to the account email. Open **Web Console**, log in as `root`, paste the emailed password, then set a new one if prompted.

Resetting the root password does **not** remove SSH keys. After the server is healthy again, key-based `ssh` from your PC should still work.

#### SSH: “Server accepts key” then connection closes

Typical `ssh -v` ending:

```text
debug1: Server accepts key: ... id_ed25519 ...
Connection closed by 129.212.235.172 port 22
```

Meaning: network and host key are fine; your public key matches; the session dies **after** auth. Common cause on this Droplet size: **disk nearly full** (often leftover layers from a cancelled `docker compose … --build`).

From **Web Console**:

```bash
df -h
docker system df

# If disk is nearly full:
docker builder prune -af
docker image prune -af
df -h

# Optional: why SSH dropped
journalctl -u ssh -n 50 --no-pager
```

Then retry from your PC:

```bash
ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes root@129.212.235.172
```

(On Windows PowerShell, use `$env:USERPROFILE\.ssh\id_ed25519`.)

Cancelling a remote deploy mid-build does **not** revoke SSH keys. It can fill the disk and make new SSH sessions fail until you prune Docker.

#### Docker rebuild looks “frozen”

- **~5–20 minutes** quiet at `Creating an optimized production build` → often normal (**LL-001**).
- **~30+ minutes / ~1 hour** still there, or Web Console idle-disconnects → **not** normal; treat as RAM thrash (**LL-002**): reopen console, check `free -h` / OOM, add swap, stop `web`/`api` during rebuild.

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
# --- Local (PC): verify → commit → push ---
npm run build
git add .
git commit -m "Describe the change"
git push

# --- Production (Droplet): pull → rebuild ---
ssh root@129.212.235.172
cd /opt/legisarc
# git config --global --add safe.directory /opt/legisarc   # once, if needed
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build

# Logs
docker compose -f deploy/docker-compose.prod.yml --env-file .env logs -f api
docker compose -f deploy/docker-compose.prod.yml --env-file .env logs -f web

# Health (on server)
curl -sS http://127.0.0.1:4000/api/health
curl -sS -I http://127.0.0.1:3000/

# Disk / Docker cleanup (Web Console if SSH drops after key accept)
df -h
docker builder prune -af
docker image prune -af

# nginx (only if nginx.conf changed)
sudo nginx -t && sudo systemctl reload nginx
```

> More detail: **§6 → Droplet access & deploy troubleshooting**. Lessons: **§16**.

---

## 15. Security reminders

1. Never commit `.env`, Spaces secrets, or DB passwords.  
2. Prefer strong unique `JWT_SECRET` and `POSTGRES_PASSWORD` in production.  
3. Firewall: only **22**, **80**, **443** public — not Postgres `5432` or `3000`/`4000`.  
4. Each developer: own SSH key + GitHub access; share secrets via a vault.  
5. Rotate Spaces keys if ever leaked in chat or screenshots.

---

## 16. Lessons learned

Operational notes from real deploys. Use the blank template below when adding a new entry so the format stays consistent.

### How to add a new lesson

1. Copy the **Blank template**.
2. Paste it under **Logged lessons** with the next ID (`LL-002`, `LL-003`, …).
3. Fill every field; keep **Status** as `Open` until the team agrees the note is accurate, then set `Closed`.
4. Link related handbook sections in **See also** when useful.

### Blank template

```markdown
### LL-XXX — Short title

| Field | Content |
|-------|---------|
| **Date** | YYYY-MM-DD |
| **Area** | Deploy / Docker / SSH / Spaces / DB / Auth / Other |
| **Status** | Open \| Closed |
| **Symptom** | What you saw (exact messages if possible) |
| **Context** | Where it happened (Droplet size, command, environment) |
| **Root cause** | Why it happened |
| **Resolution** | What fixed it or what to do |
| **Lesson** | One-sentence takeaway for next time |
| **See also** | Handbook §… / file paths |

**Notes (optional):**
- Extra detail, commands, or screenshots references
```

### Logged lessons

### LL-001 — Docker rebuild looks frozen on Next.js `npm run build`

| Field | Content |
|-------|---------|
| **Date** | 2026-07-18 |
| **Area** | Deploy / Docker |
| **Status** | Closed |
| **Symptom** | `docker compose … up -d --build` sits a long time on something like `[+] Building … (28/32)` → `[web build 5/5] RUN npm run build` → `Creating an optimized production build ...` with almost no new log lines. Easy to assume the process is hung. |
| **Context** | Production Droplet **Basic / 1 vCPU / 2 GB RAM / 50 GB disk** (SGP1). Command: `docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build` (Web Console or SSH). Next.js middleware→proxy deprecation warning may appear and is unrelated. |
| **Root cause** | The **Next.js production compile** (`npm run build` inside the `web` image) is CPU- and memory-heavy. On a small Droplet it is the slowest compose step and prints little progress while bundling. |
| **Resolution** | Quiet progress for **about 5–20 minutes** can still be normal. If it exceeds **~30 minutes** with no advance past `Creating an optimized production build`, treat it as **LL-002** (memory thrash / OOM), not “keep waiting forever.” |
| **Lesson** | Short quiet spells during Next.js compile are normal; **hour-long** builds on 2 GB are not — escalate to LL-002. |
| **See also** | LL-002; §6 Production; `deploy/docker-compose.prod.yml`; `client/Dockerfile` |

**Notes:**
- Prefer verifying `npm run build` on a local PC first so Droplet time is mostly image rebuild, not surprise compile errors.
- Web Console idle timeout does **not** stop Docker BuildKit — reopen the console and check whether the build is still running.

### LL-002 — Next.js Docker build runs ~1 hour / Web Console times out (2 GB Droplet)

| Field | Content |
|-------|---------|
| **Date** | 2026-07-18 |
| **Area** | Deploy / Docker |
| **Status** | Closed |
| **Symptom** | Build stuck on `[web build] RUN npm run build` for **~1 hour**; DigitalOcean **Web Console** disconnects from idle timeout while the build still appears unfinished. Site may stay on old containers. |
| **Context** | Same 1 vCPU / 2 GB Droplet. Stack during build often includes **Postgres + api + old web still running**, plus Docker BuildKit compiling Next.js 16 (`react-pdf`, Radix, Framer Motion, etc.). Physical RAM is insufficient for compile + running stack. |
| **Root cause** | **Memory pressure / OOM thrashing** (or silent `Killed` by the kernel). Console timeout is only a UI disconnect — not the cause. Without swap, Node can thrash for a very long time or die without a clear Next.js error in the compose output. |
| **Resolution** | Reopen Web Console and diagnose, then free memory + add swap, then rebuild: see commands in **Notes**. Also ship Dockerfile/`next.config` memory mitigations (`NODE_OPTIONS=--max-old-space-size=1536`, `webpackMemoryOptimizations`). Longer-term: resize Droplet (≥4 GB) or build images on a stronger machine and deploy prebuilt images. |
| **Lesson** | On a **2 GB** Droplet, an hour-long Next.js Docker compile means the host is **starving for RAM** — stop waiting, add swap / free memory / resize, then rebuild. |
| **See also** | LL-001; `client/Dockerfile`; `client/next.config.ts` |

**Notes — run in Web Console now:**

```bash
# 1) Is the build still alive? Any OOM?
free -h
df -h
dmesg -T | grep -iE 'oom|killed process' | tail -20
ps aux --sort=-%mem | head -15

# 2) Stop a stuck build and reclaim disk
cd /opt/legisarc
docker compose -f deploy/docker-compose.prod.yml --env-file .env stop web || true
docker builder prune -af
docker image prune -af

# 3) Add 4 GB swap if none (persists until reboot unless fstab added)
sudo fallocate -l 4G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h

# Optional persist across reboot:
# echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 4) Rebuild with more headroom (stop web first so RAM is free)
docker compose -f deploy/docker-compose.prod.yml --env-file .env stop web api
docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d --build
docker compose -f deploy/docker-compose.prod.yml --env-file .env ps
curl -sS http://127.0.0.1:4000/api/health
```

Push the latest `client/Dockerfile` + `next.config.ts` memory fixes to GitHub **before** step 4 if those commits are not on the Droplet yet (`git pull`).

### LL-003 — PDF viewer `ERR_NAME_NOT_RESOLVED` with `%20` in Spaces CDN host

| Field | Content |
|-------|---------|
| **Date** | 2026-07-18 |
| **Area** | Spaces / PDF |
| **Status** | Closed |
| **Symptom** | Browser DevTools: `GET https://%20legisarc-files.sgp1.cdn.digitaloceanspaces.com/.../file.pdf net::ERR_NAME_NOT_RESOLVED` |
| **Context** | Production PDF/image viewer after Spaces CDN is configured. |
| **Root cause** | `SPACES_CDN_URL` (or `SPACES_PUBLIC_URL`) contained a **space** (often after `https://`). That becomes `%20` in the hostname, so DNS cannot resolve it. |
| **Resolution** | On Droplet `.env`, set exactly `SPACES_CDN_URL=https://legisarc-files.sgp1.cdn.digitaloceanspaces.com` (no spaces). Restart API. Code also strips whitespace from Spaces base URLs when building public links. |
| **Lesson** | If PDF URLs show `%20` right after `https://`, fix the Spaces CDN env value — it is not a CORS or missing-file problem. |
| **See also** | §6 Spaces env; `server/src/config/env.ts`; `server/src/lib/storage.ts` |

### LL-004 — Spaces PDF/image URL returns XML `AccessDenied`

| Field | Content |
|-------|---------|
| **Date** | 2026-07-18 |
| **Area** | Spaces / PDF |
| **Status** | Closed |
| **Symptom** | Opening a PDF/image CDN URL shows `<Error><Code>AccessDenied</Code><BucketName>legisarc-files</BucketName>…` instead of the file. |
| **Context** | After Spaces host URL was fixed; uploads succeed but public view fails for ordinances, resolutions, minutes, SB members. |
| **Root cause** | Objects in DigitalOcean Spaces are **private by default**. Uploads that omit `ACL: public-read` (or a public bucket policy) are not readable anonymously via CDN. |
| **Resolution** | Upload with `public-read` ACL again; run `node server/db/make-spaces-objects-public.mjs` for existing keys; confirm Spaces CORS GET/HEAD for the site origin. |
| **Lesson** | A resolving CDN hostname is not enough — Spaces must grant **public GetObject** (ACL or bucket policy) for browser PDF viewers. |
| **See also** | §6 Spaces public access; `server/src/lib/spaces.ts`; `server/db/make-spaces-objects-public.mjs` |

---

*This handbook reflects the LegisArc state after the Express/Postgres migration, Spaces dual-storage work, and the legisarc.net DigitalOcean launch.*
