#!/usr/bin/env bash
# =============================================================================
#  AsoftechInsightz — one-shot Postgres database bootstrapper
#  Ubuntu 22.04+ / PostgreSQL 15+
#  Reads DB credentials from environment.
#  Usage:
#    sudo PGHOST=localhost PGUSER=postgres PGPASSWORD=secret \
#         DB_NAME=asoftech DB_USER=asoftech DB_PASS=$(openssl rand -hex 24) \
#         ./init-db.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_NAME="${DB_NAME:-asoftech}"
DB_USER="${DB_USER:-asoftech}"
DB_PASS="${DB_PASS:-$(openssl rand -hex 24)}"
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
ADMIN_USER="${PGUSER:-postgres}"
ADMIN_PASS="${PGADMIN_PASS:-${PGPASSWORD:-}}"

echo "▶ Creating role & database ‘$DB_NAME’…"
PGPASSWORD="$ADMIN_PASS" psql -h "$PGHOST" -p "$PGPORT" -U "$ADMIN_USER" -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE "$DB_USER" WITH LOGIN PASSWORD '$DB_PASS';
  ELSE
    ALTER ROLE "$DB_USER" WITH LOGIN PASSWORD '$DB_PASS';
  END IF;
END \$\$;
SQL

PGPASSWORD="$ADMIN_PASS" psql -h "$PGHOST" -p "$PGPORT" -U "$ADMIN_USER" -v ON_ERROR_STOP=1 -tAc \
  "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 \
  || PGPASSWORD="$ADMIN_PASS" createdb -h "$PGHOST" -p "$PGPORT" -U "$ADMIN_USER" -O "$DB_USER" "$DB_NAME"

PGPASSWORD="$ADMIN_PASS" psql -h "$PGHOST" -p "$PGPORT" -U "$ADMIN_USER" -d "$DB_NAME" -c \
  "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";\
   GRANT ALL ON SCHEMA public TO \"$DB_USER\";"

echo "▶ Running schema scripts…"
for f in 01_schema.sql 02_indexes.sql 03_seed.sql; do
  echo "  ✓ $f"
  PGPASSWORD="$DB_PASS" psql -h "$PGHOST" -p "$PGPORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$SCRIPT_DIR/$f" >/dev/null
done

cat <<EOF

========================================================================
  ✓ Database ready
========================================================================
  Host:     $PGHOST:$PGPORT
  Database: $DB_NAME
  User:     $DB_USER
  Password: $DB_PASS                    ← save this!
  Conn URL: postgresql://$DB_USER:$DB_PASS@$PGHOST:$PGPORT/$DB_NAME

  Admin login (CHANGE PASSWORD IMMEDIATELY):
     email:    admin@asoftechinsightz.com
     password: ChangeMe@2025
========================================================================
EOF
