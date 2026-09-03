#!/usr/bin/env bash
# GymBuddy one-command deploy
# Usage: ./deploy.sh  (after creating: GitHub repo, Neon DB, Netlify account)
set -e

echo "==================== GymBuddy Deploy ===================="

# ---- 1. Config ----
read -p "Your GitHub username (from SSH key): " GH_USER
if [ -z "$GH_USER" ]; then GH_USER="EventipDev"; fi
read -p "Your Neon PostgreSQL URL: " NEON_URL
read -p "Your Netlify site subdomain (e.g. gym-buddy-demo): " SITE_NAME
if [ -z "$SITE_NAME" ]; then SITE_NAME="gym-buddy-demo"; fi

AUTH_SECRET=$(openssl rand -base64 32)
APP_URL="https://$SITE_NAME.netlify.app"

echo ""
echo "1/4 Pushing code to GitHub ($GH_USER/gym-buddy)..."
git remote set-url origin "git@github.com:$GH_USER/gym-buddy.git" 2>/dev/null || true
git branch -M main
git push -u origin main

echo ""
echo "2/4 Creating database tables in Neon..."
DATABASE_URL="$NEON_URL" npx prisma db push

echo ""
echo "3/4 Seeding demo data (demo@example.com / password123)..."
DATABASE_URL="$NEON_URL" npx tsx prisma/seed.ts

echo ""
echo "4/4 Deploying to Netlify..."
netlify deploy --prod --site "$SITE_NAME" --build \
  --env DATABASE_URL="$NEON_URL" \
  --env AUTH_SECRET="$AUTH_SECRET" \
  --env AUTH_TRUST_HOST=true \
  --env NEXT_PUBLIC_APP_URL="$APP_URL"

echo ""
echo "========================================================"
echo "✅ DONE! Live at: $APP_URL"
echo "   Demo login: demo@example.com / password123"
echo "========================================================"
