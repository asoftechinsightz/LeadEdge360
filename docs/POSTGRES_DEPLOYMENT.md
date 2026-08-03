# PostgreSQL Deployment Guide — Ubuntu 22.04+

This guide deploys PostgreSQL 15 alongside AsoftechInsightz on a fresh Ubuntu VPS, runs the canonical schema (`docs/sql/*.sql`) and creates the seed admin.

## 1. Install PostgreSQL 15

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update && sudo apt install -y postgresql-15 postgresql-client-15
sudo systemctl enable --now postgresql
```

Verify:
```bash
sudo -u postgres psql -c "SELECT version();"
```

## 2. Create role, DB, and run the schema (one command)

```bash
cd /opt/asoftech/docs/sql
sudo chmod +x init-db.sh
sudo -u postgres DB_NAME=asoftech DB_USER=asoftech DB_PASS=$(openssl rand -hex 24) ./init-db.sh
```

The script:
- Creates role `asoftech` and database `asoftech`
- Runs `01_schema.sql` (tables, FKs, triggers)
- Runs `02_indexes.sql` (incl. trigram search on leads)
- Runs `03_seed.sql` (permissions, products, plans, system tenant, super-admin)

At the end it prints the connection URL — save it as `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://asoftech:<password>@localhost:5432/asoftech
```

## 3. Tune Postgres for production

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```
Key settings for a 4 GB / 2 vCPU VPS:
```conf
listen_addresses = 'localhost'       # set '*' only if you connect from outside
shared_buffers = 1GB
work_mem = 16MB
maintenance_work_mem = 256MB
effective_cache_size = 3GB
random_page_cost = 1.1                # SSD
max_connections = 100
log_min_duration_statement = 250      # ms — log slow queries
```
Then restart:
```bash
sudo systemctl restart postgresql
```

## 4. Allow Docker app container to reach Postgres on host

If the app runs in Docker but Postgres on host, edit:
```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```
Add at the top:
```
host asoftech asoftech 172.17.0.0/16 scram-sha-256
```
And in `postgresql.conf`:
```
listen_addresses = 'localhost,172.17.0.1'
```
Restart Postgres. Set `DATABASE_URL=postgresql://asoftech:...@host.docker.internal:5432/asoftech` (or the bridge gateway IP) in the app's `.env`.

## 5. Daily backup (cron)

```bash
sudo mkdir -p /var/backups/postgres && sudo chown postgres /var/backups/postgres
sudo crontab -u postgres -e
```
Add:
```
0 3 * * * pg_dump -F c -Z 9 -f /var/backups/postgres/asoftech-$(date +\%F).dump asoftech
0 4 * * 0 find /var/backups/postgres -mtime +30 -delete   # keep 30 days
```

For offsite copies (S3 / Backblaze):
```bash
sudo apt install -y rclone && sudo -u postgres rclone copy /var/backups/postgres remote:asoftech-backups
```

## 6. Restore procedure

```bash
# Stop the app first to avoid race conditions
docker compose -f /opt/asoftech/docker-compose.yml stop app

# Drop + recreate empty DB
sudo -u postgres dropdb asoftech
sudo -u postgres createdb -O asoftech asoftech

# Restore
sudo -u postgres pg_restore --no-owner --role=asoftech -d asoftech /var/backups/postgres/asoftech-2025-06-15.dump

# Re-start app
docker compose -f /opt/asoftech/docker-compose.yml start app
```

## 7. Health checks

```bash
sudo -u postgres psql -d asoftech -c "SELECT count(*) FROM leads;"
sudo -u postgres psql -d asoftech -c "\du"      # list roles
sudo -u postgres psql -d asoftech -c "\dt"      # list tables
```
