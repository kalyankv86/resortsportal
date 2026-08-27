#!/usr/bin/env bash
# Install the CWETR nginx vhost + a self-signed cert (until Let's Encrypt).
# Run as root on the server AFTER bootstrap.sh:  sudo bash deploy/setup-nginx.sh
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "run as root"; exit 1; }

REPO_DIR="${REPO_DIR:-/opt/resorts/src}"
DOMAIN="${CWETR_DOMAIN:-wellness.cutm.ac.in}"

echo "▶ self-signed certificate"
install -d -m 0755 /etc/nginx/ssl
if [ ! -f /etc/nginx/ssl/cwetr-selfsigned.crt ]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout /etc/nginx/ssl/cwetr-selfsigned.key \
    -out /etc/nginx/ssl/cwetr-selfsigned.crt \
    -subj "/C=IN/O=Centurion University/CN=${DOMAIN}" \
    -addext "subjectAltName=DNS:${DOMAIN},IP:192.168.5.51"
fi

echo "▶ acme webroot"
install -d -m 0755 /var/www/html/.well-known/acme-challenge

echo "▶ vhost"
ln -sfn "${REPO_DIR}/deploy/nginx/wellness.cutm.ac.in.conf" \
        /etc/nginx/sites-enabled/wellness.cutm.ac.in.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
echo "▶ nginx reloaded"
echo
echo "When ${DOMAIN} resolves publicly to this host, run:"
echo "  certbot --nginx -d ${DOMAIN} --redirect -m resorts@cutm.ac.in --agree-tos -n"
