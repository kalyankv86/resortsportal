# Centurion Wellness Eco Tourism Resorts — Enterprise Portal

**CWETR Enterprise Portal v1.0** · Centurion University of Technology and Management
Production URL: `https://resorts.cutm.ac.in` · Tagline: *Heal • Stay • Reconnect with Nature*

A luxury wellness, Ayurveda and eco-tourism hospitality platform: public website + booking
engine + CRM + CMS + guest / doctor / therapist / housekeeping / restaurant portals + finance
& inventory ERP + analytics.

---

## Monorepo layout

```
resortsportal/
├── frontend/          Next.js 16 · React 19 · Tailwind 4 · TypeScript  (public site + portals UI)
├── backend/           Laravel 12 · PHP 8.3 · PostgreSQL · Redis        (REST API, added next milestone)
├── deploy/            Bare Ubuntu 22.04 provisioning + Nginx + PM2 + Supervisor (added with backend)
└── docs/              SRS · SDD · ER diagram · API reference · manuals  (progressive)
```

> **Deployment target:** a bare Ubuntu 22.04 server, **no Docker**. Everything is installed
> natively via `deploy/bootstrap.sh` (Node LTS, PHP 8.3, PostgreSQL 16, Redis, Nginx, PM2,
> Supervisor, Certbot). No cloud dependency — runs entirely inside CUTM infrastructure.

---

## Build status

| # | Milestone | Scope | State |
|---|-----------|-------|-------|
| 1 | Frontend foundation | Design system, layout shell, immersive Home, media abstraction | ✅ done |
| 2 | Server provisioning | Bare Ubuntu 22.04 → full native stack, frontend live behind Nginx+PM2 | ✅ done |
| 3 | Marketing pages | All 34 IA routes, data-driven, SEO | ✅ done |
| 4 | Media & branding | CUTM Google Photos ingest, real photos, CUTM logo/favicon | ✅ done |
| 5 | Backend foundation | Laravel 13, ~35-table schema, JWT auth, RBAC, seeders, `/api` live | ✅ done |
| 6 | Booking engine | Availability, quote, multi-step booking, promo codes, questionnaire, QR pass, cancel/reschedule, waitlist, admin management | ✅ done |
| 7 | Payments & finance | Pluggable gateway (mock + manual now, CUTM API drops in later), GST invoice PDFs, refund approval queue, finance dashboard | ✅ done |
| 8 | Guest portal | Stay + countdown + QR, schedule, dosha, diet chart, prescriptions, progress metrics, invoices, loyalty | ✅ done |
| 9 | Staff portals | Doctor (records + patient charts), Therapist (treatment notes), Housekeeping (room board + tasks), Restaurant (meal orders) | ✅ done |
| 10 | Admin & CMS | Tabbed admin, page/testimonial/FAQ CMS driving the public site, user management, settings editor, audit trail | ✅ done |
| 11 | Inventory · Analytics · AI · Notifications · Search | | ▢ next |
| 12 | Hardening & docs | Let's Encrypt SSL, backups, log rotation, CI/CD, SRS/SDD/ER diagram | ▢ |

### Live now

| | |
|---|---|
| Host | `192.168.5.51` (Ubuntu 22.04.5, 8 vCPU / 14 GiB) |
| Frontend | `http://192.168.5.51/` · `https://192.168.5.51/` (self-signed) — 42 pages, real CUTM photos |
| API | `http://192.168.5.51/api/*` — Laravel 13, JWT, `/api/health` green |
| Auth | `/guest-login` works end to end · `/guest` + `/admin` portals live |
| Booking | `/book-now` wizard → bookings + QR pass · `/booking/{ref}` lookup · pay (mock UPI/card) → auto-confirm + GST invoice PDF |
| Portals | `/guest` (stay/care plan/progress/billing) · `/doctor` `/therapist` `/housekeeping` `/restaurant` · `/admin` (7 tabs incl. CMS) |
| CMS | 33 pages editable in `/admin` → Content; edits publish live to the marketing site |
| Process mgr | PM2 `cwetr-frontend` ×2 · php8.3-fpm · systemd-persisted |
| Stack | Node 20.20.2 · PHP 8.3.33-FPM · PostgreSQL 16.15 (`cwetr`) · Redis · Nginx 1.18 · Supervisor |
| Firewall | ufw: OpenSSH + Nginx Full |

### Seeded logins (change after first login)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@resorts.cutm.ac.in` | `ChangeMe!CWETR2026` |
| Doctor | `doctor@resorts.cutm.ac.in` | `ChangeMe!CWETR2026` |
| Therapist | `therapist@resorts.cutm.ac.in` | `ChangeMe!CWETR2026` |
| Test Guest | `guest@example.com` | `ChangeMe!CWETR2026` |

---

## Milestone 1 — what's in `frontend/`

### Design system (`src/app/globals.css`)
Tailwind 4 `@theme` tokens for the full brand:

- **Palette** — Sage `#7AA874`, Forest `#14532D`, Ivory `#FAF8F2`, Sand `#E8DFC9`, Terracotta `#C26D4F`, accent gradient `#DFF5E3 → #F9F7EF`
- **Type** — Cormorant Garamond (headings), Inter (body), Manrope (UI) via `next/font`
- **Language** — 28px card radius, soft/lift shadows, `glass` + `glass-dark` frosted utilities, `eyebrow` kicker, floating-leaf keyframes, luxury easing `cubic-bezier(.16,1,.3,1)`
- Full light + dark token sets, `prefers-reduced-motion` honoured throughout

### Component library (`src/components/ui/`)
`Button` (4 variants, polymorphic link/button) · `GlassPanel` · `Badge` · `Reveal` (scroll fade-rise) ·
`Stat` / `StatRow` (animated count-up) · `MediaImage` · `Container` / `Section` / `SectionHeading` / `Eyebrow`

### Media library (`src/lib/media/`)
Provider abstraction — pages call `getMedia(category)` / `getCover(category)` and never touch a
source directly. 14 categories (`hero`, `rooms`, `spa`, `ayurveda`, `yoga`, `meditation`, `dining`,
`organic-farm`, `forest`, `waterfalls`, `drone`, `events`, `gallery`, `virtual-tour`).

- `placeholder` provider (default): deterministic **brand SVG duotones** — *not* stock, Unsplash,
  Pexels or AI imagery, per the brief.
- `google-photos` provider: stub, wired once CUTM supplies the official album share URL +
  credentials. No page changes needed to switch.

### Layout shell (`src/components/layout/`)
`SiteHeader` — transparent-over-hero → frosted-glass on scroll, full IA mega-menu, mobile drawer.
`SiteFooter` — nav columns, contact, utility links.
`BookingWidget` — glass check-in/out + guests + programme, routes to `/book-now` with query params.

### Home page (`src/app/page.tsx`)
`Hero` (parallax backdrop, floating leaves, staggered headline "Reconnect with Yourself.",
three CTAs, embedded booking widget) → `StatsBar` (animated: 50+ therapies, 64 rooms, 18 doctors,
120 acres, 40-acre farm) → `BentoShowcase` (6-item bento grid, media-backed) → `ExperiencesStrip`
(eco-tourism) → `ReviewsStrip` → `HomeCta`.

---

## Running the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (Home prerenders static)
npm run lint
```

Requires Node.js ≥ 20. Verified: `tsc --noEmit` clean, `next build` green, lint clean.
