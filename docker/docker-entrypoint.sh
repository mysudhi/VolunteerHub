#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -q 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema prisma/schema.prisma

echo "Starting ContributorHub API server..."
exec node server/dist/index.js
