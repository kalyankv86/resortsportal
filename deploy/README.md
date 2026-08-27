# CWETR — Deployment (bare Ubuntu 22.04, no Docker)

Target host: **`192.168.5.51`** → `wellness.cutm.ac.in` · user `ubuntu` (passwordless sudo)

Native stack, everything inside CUTM infrastructure:

| Component | Version | Managed by |
|-----------|---------|------------|
| Next.js frontend | Node 20 LTS | PM2 (`cluster`, 2 procs) on `127.0.0.1:3000` |
| Laravel API | PHP 8.3 + FPM | `php8.3-fpm` unix socket, nginx front controller |
| Database | PostgreSQL 16 | systemd, local socket |
| Cache / queue | Redis 7 | systemd |
| Reverse proxy / TLS | Nginx | systemd |
| Queue + scheduler | — | Supervisor |

## Directory layout (`/opt/resorts`)

```
/opt/resorts
├── src/                     this git repo (checkout / GitLab CI target)
├── frontend/
│   ├── releases/<ts>/       built Next.js releases
│   ├── current  ->          symlink to active release (PM2 cwd)
│   └── shared/.env.local    persisted env
├── backend/
│   ├── releases/<ts>/       Laravel releases
│   ├── current  ->          symlink to active release
│   └── shared/.env          persisted env
├── storage/                 shared uploads (g+rwx www-data)
├── media/                   media library, served at /media/
├── logs/                    nginx + pm2 + worker logs
└── .provision.env           DB / Redis creds written by bootstrap.sh
```

## First-time provisioning

```bash
# on the server, as root
git clone <repo-url> /opt/resorts/src && cd /opt/resorts/src
CWETR_DOMAIN=wellness.cutm.ac.in bash deploy/bootstrap.sh   # phases 1-10, idempotent
bash deploy/setup-nginx.sh                                  # vhost + self-signed cert

# as ubuntu
bash deploy/deploy-frontend.sh                              # build + release + PM2
sudo env PATH=$PATH pm2 startup systemd -u ubuntu --hp /home/ubuntu   # run printed cmd
```

## Routine frontend release

```bash
cd /opt/resorts/src && git pull
bash deploy/deploy-frontend.sh          # atomic symlink swap + pm2 reload, keeps 5 releases
```

## Media library (official CUTM Google Photos album)

Production serves local copies only — no cloud dependency at request time.

```bash
# one-time / on album update, on the server:
node /opt/resorts/src/scripts/ingest-google-photos.mjs \
  --album "https://photos.app.goo.gl/a4a4uCXvkiYRb8eo8" \
  --out /opt/resorts/media/library \
  --chrome /usr/bin/google-chrome   # or chromium

# then refresh the committed manifest if categories changed:
#   frontend/src/lib/media/library.manifest.json
```

Nginx serves the files at `/media/library/<id>.jpg`. Set `MEDIA_PROVIDER=library`
in `/opt/resorts/frontend/shared/.env.local` (default). Falls back to brand SVG
placeholders when the manifest is empty.

## TLS

`setup-nginx.sh` installs a self-signed cert so `:443` works on the LAN now.
When `wellness.cutm.ac.in` resolves publicly to this host:

```bash
sudo certbot --nginx -d wellness.cutm.ac.in --redirect -m resorts@cutm.ac.in --agree-tos -n
```

## Files

| Path | Purpose |
|------|---------|
| `bootstrap.sh` | provisions the whole stack from a clean 22.04 box |
| `setup-nginx.sh` | installs vhost + self-signed cert + ACME webroot |
| `deploy-frontend.sh` | build + atomic release of the Next.js app |
| `nginx/wellness.cutm.ac.in.conf` + `nginx/_app.conf` | vhost (`:80` + `:443`) and shared routing |
| `pm2/ecosystem.config.js` | PM2 process def for `cwetr-frontend` |
| `supervisor/cwetr-worker.conf` | Laravel queue + scheduler |
