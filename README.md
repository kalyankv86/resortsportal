# Centurion Wellness Eco Tourism Resorts — Portal

**wellness.cutm.ac.in** · Centurion University of Technology and Management
*Heal • Stay • Reconnect with Nature*

The public website plus the operational platform behind it: a booking engine,
GST invoicing, a guest portal, staff portals (doctor, therapist, housekeeping,
kitchen), a finance dashboard and a CMS that drives the marketing pages.

---

## Repository

```
resortsportal/
├── frontend/   Next.js 16 · React 19 · Tailwind 4 · TypeScript   (site + portals)
├── backend/    Laravel 13 · PHP 8.3 · PostgreSQL 16 · Redis       (REST API)
├── deploy/     Native Ubuntu 22.04 provisioning — Nginx · PM2 · Supervisor (no containers)
└── scripts/    Media-library ingest
```

## Frontend

```bash
cd frontend
cp .env.example .env.local        # set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev                       # http://localhost:3000
npm run build && npm run lint
```

Design system in `src/app/globals.css` (Tailwind 4 `@theme` tokens — Sage /
Forest / Ivory / Sand / Terracotta, Cormorant Garamond + Inter + Manrope,
frosted-glass utilities, 28px radii). Marketing pages are data-driven: a route
resolves its content from `GET /api/pages/{slug}` (the CMS) and falls back to
the local registry in `src/content/pages.ts`.

## Backend

See [`backend/README.md`](backend/README.md). In short:

```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate && php artisan jwt:secret
php artisan migrate --seed
php artisan serve
```

## Deployment

Native install on a single Ubuntu 22.04 host — see [`deploy/README.md`](deploy/README.md).

```
/opt/resorts/{frontend,backend,media,storage,logs}
```

- `deploy/bootstrap.sh` — provisions Node LTS, PHP 8.3-FPM, PostgreSQL 16,
  Redis, Nginx, Supervisor, PM2, Certbot on a clean box.
- `deploy/deploy-frontend.sh` / `deploy/deploy-backend.sh` — build + release
  with an atomic symlink swap.

## Media

Estate photography lives in `/opt/resorts/media/library`, served by Nginx at
`/media/library/…`. `scripts/ingest-google-photos.mjs` imports and categorises a
shared album into that directory and writes the manifest the frontend reads.
