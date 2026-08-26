#!/usr/bin/env bash
# =============================================================================
# CWETR Enterprise Portal — bare-metal provisioning for Ubuntu 22.04 LTS
# Target: resorts.cutm.ac.in  ·  no Docker  ·  no cloud dependency
#
# Installs the full native stack:
#   Node.js 20 LTS · PHP 8.3 + FPM · PostgreSQL 16 · Redis 7 · Nginx · Supervisor
#   PM2 (global) · Certbot · build toolchain
#
# Idempotent: safe to re-run. Run as root (or via sudo).
#   sudo bash deploy/bootstrap.sh
# =============================================================================
set -euo pipefail

APP_ROOT=/opt/resorts
APP_USER=ubuntu
DB_NAME=cwetr
DB_USER=cwetr
DB_PASS="${CWETR_DB_PASS:-$(head -c 18 /dev/urandom | base64 | tr -d '/+=' | head -c 24)}"
NODE_MAJOR=20
PG_MAJOR=16
DOMAIN="${CWETR_DOMAIN:-resorts.cutm.ac.in}"

log() { printf '\n\033[1;32m▶ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "run as root"; exit 1; }

# ---------------------------------------------------------------------------
log "Phase 1 · base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
  ca-certificates curl gnupg lsb-release apt-transport-https \
  build-essential git unzip zip acl ufw fail2ban \
  software-properties-common jq

# ---------------------------------------------------------------------------
log "Phase 2 · apt repositories (NodeSource · ondrej/php · PGDG)"
install -d -m 0755 /etc/apt/keyrings

if [ ! -f /etc/apt/keyrings/nodesource.gpg ]; then
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
fi

if [ ! -f /etc/apt/sources.list.d/ondrej-ubuntu-php-jammy.list ]; then
  add-apt-repository -y ppa:ondrej/php
fi

if [ ! -f /etc/apt/keyrings/pgdg.gpg ]; then
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /etc/apt/keyrings/pgdg.gpg
  echo "deb [signed-by=/etc/apt/keyrings/pgdg.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
fi

apt-get update -qq

# ---------------------------------------------------------------------------
log "Phase 3 · Node.js ${NODE_MAJOR} LTS + PM2"
apt-get install -y -qq nodejs
corepack enable || true
npm install -g pm2@latest >/dev/null 2>&1
pm2 --version

# ---------------------------------------------------------------------------
log "Phase 4 · PHP 8.3 + FPM + extensions"
apt-get install -y -qq \
  php8.3-fpm php8.3-cli php8.3-common php8.3-pgsql php8.3-redis \
  php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath \
  php8.3-gd php8.3-intl php8.3-readline php8.3-opcache
systemctl enable --now php8.3-fpm

if ! command -v composer >/dev/null; then
  curl -fsSL https://getcomposer.org/installer -o /tmp/composer-setup.php
  php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
  rm -f /tmp/composer-setup.php
fi
composer --version

# ---------------------------------------------------------------------------
log "Phase 5 · PostgreSQL ${PG_MAJOR}"
apt-get install -y -qq "postgresql-${PG_MAJOR}" "postgresql-client-${PG_MAJOR}"
systemctl enable --now postgresql

sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};" >/dev/null

# ---------------------------------------------------------------------------
log "Phase 6 · Redis"
apt-get install -y -qq redis-server
sed -i 's/^# *maxmemory .*/maxmemory 512mb/; s/^# *maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
systemctl enable --now redis-server

# ---------------------------------------------------------------------------
log "Phase 7 · Nginx + Supervisor + Certbot"
apt-get install -y -qq nginx supervisor certbot python3-certbot-nginx
systemctl enable --now nginx supervisor

# ---------------------------------------------------------------------------
log "Phase 8 · directory layout at ${APP_ROOT}"
install -d -o "${APP_USER}" -g www-data -m 2775 \
  "${APP_ROOT}" \
  "${APP_ROOT}/frontend" \
  "${APP_ROOT}/backend" \
  "${APP_ROOT}/storage" \
  "${APP_ROOT}/media" \
  "${APP_ROOT}/logs" \
  "${APP_ROOT}/releases"
setfacl -R -d -m g:www-data:rwx "${APP_ROOT}/storage" "${APP_ROOT}/media" 2>/dev/null || true

# ---------------------------------------------------------------------------
log "Phase 9 · firewall (OpenSSH + HTTP + HTTPS)"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null
ufw status

# ---------------------------------------------------------------------------
log "Phase 10 · write connection facts to ${APP_ROOT}/.provision.env"
cat > "${APP_ROOT}/.provision.env" <<EOF
# generated by bootstrap.sh on $(date -Is)
CWETR_DOMAIN=${DOMAIN}
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
EOF
chmod 640 "${APP_ROOT}/.provision.env"
chown "${APP_USER}":www-data "${APP_ROOT}/.provision.env"

log "DONE — stack provisioned"
echo "  Node    : $(node -v)"
echo "  PHP     : $(php -r 'echo PHP_VERSION;')"
echo "  Postgres: $(sudo -u postgres psql -tAc 'show server_version;' | xargs)"
echo "  Redis   : $(redis-cli --version | awk '{print $2}')"
echo "  Nginx   : $(nginx -v 2>&1 | awk -F/ '{print $2}')"
echo "  DB creds written to ${APP_ROOT}/.provision.env"
