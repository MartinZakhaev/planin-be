#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

# Only run seeds if RUN_SEEDS env var is set to "true"
if [ "$RUN_SEEDS" = "true" ]; then
  echo "Running database seeds..."
  npm run seed
fi

echo "Starting application..."
exec node dist/main
