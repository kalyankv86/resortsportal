#!/usr/bin/env bash
# Build + release the Next.js frontend with atomic symlink swap.
# Run as the app user on the server:  bash deploy/deploy-frontend.sh
#
# Layout:
#   /opt/resorts/src                     git checkout (this repo)
#   /opt/resorts/frontend/releases/<ts>  built release
#   /opt/resorts/frontend/current        symlink → active release  (PM2 cwd)
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/resorts/src}"
REL_ROOT=/opt/resorts/frontend/releases
TS="$(date +%Y%m%d%H%M%S)"
REL="${REL_ROOT}/${TS}"

echo "▶ release ${TS}"
mkdir -p "${REL_ROOT}"
rsync -a --delete \
  --exclude node_modules --exclude .next --exclude .git \
  "${REPO_DIR}/frontend/" "${REL}/"

cd "${REL}"
[ -f .env.local ] || cp /opt/resorts/frontend/shared/.env.local .env.local 2>/dev/null || true

echo "▶ npm ci"
npm ci --no-audit --no-fund

echo "▶ next build"
npm run build

echo "▶ activate"
ln -sfn "${REL}" /opt/resorts/frontend/current

echo "▶ reload pm2"
if pm2 describe cwetr-frontend >/dev/null 2>&1; then
  pm2 reload cwetr-frontend --update-env
else
  pm2 start "${REPO_DIR}/deploy/pm2/ecosystem.config.js"
  pm2 save
fi

echo "▶ prune old releases (keep 5)"
ls -1dt "${REL_ROOT}"/*/ | tail -n +6 | xargs -r rm -rf

echo "✓ frontend live on 127.0.0.1:3000"
