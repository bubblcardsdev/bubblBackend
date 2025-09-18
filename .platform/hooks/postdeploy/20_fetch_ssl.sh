#!/bin/bash
set -euo pipefail

# Install target dirs
mkdir -p /etc/letsencrypt/live/devapii.bubbl.cards
mkdir -p /etc/letsencrypt

# Copy files from repo to system paths
aws s3 cp s3://ssl-secrets/devapii/fullchain.pem \
   /etc/letsencrypt/live/devapii.bubbl.cards/fullchain.pem
aws s3 cp s3://ssl-secrets/devapii/privkey.pem \
   /etc/letsencrypt/live/devapii.bubbl.cards/privkey.pem
aws s3 cp s3://ssl-secrets/devapii/options-ssl-nginx.conf \
   /etc/letsencrypt/options-ssl-nginx.conf
aws s3 cp s3://ssl-secrets/devapii/ssl-dhparams.pem \
   /etc/letsencrypt/ssl-dhparams.pem

# Permissions
chown root:root /etc/letsencrypt/options-ssl-nginx.conf /etc/letsencrypt/ssl-dhparams.pem
chown root:root /etc/letsencrypt/live/devapii.bubbl.cards/fullchain.pem
chown root:root /etc/letsencrypt/live/devapii.bubbl.cards/privkey.pem
chmod 400 /etc/letsencrypt/live/devapii.bubbl.cards/privkey.pem

# Validate and reload
nginx -t
systemctl reload nginx
