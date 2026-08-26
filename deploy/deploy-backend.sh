#!/usr/bin/env bash
# Deploy / update the Laravel API at /opt/resorts/backend.
# Run as the app user on the server:  bash deploy/deploy-backend.sh [--fresh]
set -euo pipefail

APP=/opt/resorts/backend
SRC=/opt/resorts/src/backend
PROV=/opt/resorts/.provision.env
FRESH="${1:-}"

echo "▶ sync source"
rsync -a --delete \
  --exclude vendor --exclude node_modules --exclude .env \
  --exclude 'storage/logs/*' --exclude 'storage/framework/cache/*' \
  --exclude 'storage/framework/sessions/*' --exclude 'storage/framework/views/*' \
  --exclude 'bootstrap/cache/*' \
  "$SRC/" "$APP/"

cd "$APP"

# ---- .env (created once, then preserved) --------------------------------
if [ ! -f .env ]; then
  echo "▶ writing .env"
  set -a; . "$PROV"; set +a
  APP_KEY_LINE="APP_KEY="
  cat > .env <<EOF
APP_NAME="CWETR API"
APP_ENV=production
${APP_KEY_LINE}
APP_DEBUG=false
APP_URL=https://${CWETR_DOMAIN:-resorts.cutm.ac.in}
APP_TIMEZONE=Asia/Kolkata

LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD="${DB_PASSWORD}"

SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
CACHE_STORE=redis
REDIS_CLIENT=predis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}

JWT_SECRET=
JWT_TTL=1440
JWT_REFRESH_TTL=20160

CORS_ALLOWED_ORIGINS=http://localhost:3000,https://${CWETR_DOMAIN:-resorts.cutm.ac.in},http://192.168.5.51

MAIL_MAILER=log
EOF
fi

echo "▶ composer install"
composer install --no-dev --optimize-autoloader --no-interaction

echo "▶ publish vendor config (idempotent)"
# spatie/laravel-permission: publishes config/permission.php + the
# create_permission_tables migration (only if not already present).
if [ ! -f config/permission.php ]; then
  php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --force
fi
php artisan vendor:publish --provider="PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider" --force >/dev/null 2>&1 || true

grep -q '^APP_KEY=.\+' .env || php artisan key:generate --force
grep -q '^JWT_SECRET=.\+' .env || php artisan jwt:secret --force

echo "▶ storage + permissions"
mkdir -p storage/framework/{cache/data,sessions,views} storage/logs bootstrap/cache
chgrp -R www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache
[ -L public/storage ] || php artisan storage:link || true

if [ "$FRESH" = "--fresh" ]; then
  echo "▶ migrate:fresh --seed"
  php artisan migrate:fresh --seed --force
else
  echo "▶ migrate"
  php artisan migrate --force
fi

echo "▶ optimise"
php artisan config:cache
php artisan route:cache
php artisan event:cache || true

echo "▶ reload php-fpm"
sudo systemctl reload php8.3-fpm

echo "✓ backend deployed"
php artisan --version
