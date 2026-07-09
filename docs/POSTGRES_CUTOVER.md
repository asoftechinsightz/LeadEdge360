# PostgreSQL Cutover Playbook

This playbook explains how to migrate the running app from MongoDB to PostgreSQL **without downtime** for the mobile app.

## Why an adapter pattern?

The mobile app integrates against `/api/*` over JWT. Whether the data lives in MongoDB or PostgreSQL is an implementation detail. By introducing a small adapter, you can flip databases in production with a single env var, while keeping the demo on Mongo for fast iteration.

## Adapter contract

Each route handler will use `getRepo()` which returns either `mongoRepo` (current) or `pgRepo` (future). Both implement the same interface:

```js
repo.leads.list({ tenantId, filters, sort, page, pageSize })
repo.leads.create({ tenantId, data })
repo.leads.findById({ tenantId, id })
repo.leads.update({ tenantId, id, patch })
repo.leads.delete({ tenantId, id })
repo.users.findByEmail(email)
repo.users.create(data)
// ...same surface for followups, notifications, etc.
```

## Cutover steps

### Phase 1 — Provision Postgres (Day 1, ~30 min)

```bash
# On the VPS:
sudo apt install -y postgresql-15
sudo -u postgres /opt/asoftech/docs/sql/init-db.sh
# Note the printed DATABASE_URL

# Add to /opt/asoftech/.env
DATABASE_URL=postgresql://asoftech:<pass>@localhost:5432/asoftech
```

### Phase 2 — Build `pgRepo` for one entity (Day 1, ~2 hr)

Create `/app/lib/repo/pg-leads.js` implementing the same surface as the current Mongo leads usage. Example skeleton:

```js
import { pgMany, pgOne, pgQuery } from '@/lib/pg'

export const pgLeadsRepo = {
  async list({ tenantId, status, label, source, q, page = 1, pageSize = 50, sort = '-createdAt' }) {
    const where = ['tenant_id = $1']
    const args = [tenantId]
    if (status)    { where.push(`status = $${args.length + 1}`); args.push(status) }
    if (label)     { where.push(`label = $${args.length + 1}`);  args.push(label) }
    if (source)    { where.push(`source = $${args.length + 1}`); args.push(source) }
    if (q) {
      where.push(`(name ILIKE $${args.length + 1} OR email::text ILIKE $${args.length + 1} OR phone ILIKE $${args.length + 1})`)
      args.push(`%${q}%`)
    }
    const order = sort.startsWith('-') ? `${sort.slice(1)} DESC` : `${sort} ASC`
    args.push(pageSize, (page - 1) * pageSize)
    const sql = `SELECT * FROM leads WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT $${args.length - 1} OFFSET $${args.length}`
    const rows = await pgMany(sql, args)
    const { rows: [{ count }] } = await pgQuery(`SELECT COUNT(*)::int AS count FROM leads WHERE ${where.join(' AND ')}`, args.slice(0, -2))
    return { leads: rows, total: count }
  },

  async create({ tenantId, data }) {
    const sql = `INSERT INTO leads (tenant_id, name, email, phone, company, message, source, territory, budget, whatsapp_opted_in, score, label, scoring_reasons, scoring_engine, status, assigned_to)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'New', $15)
                 RETURNING *`
    return pgOne(sql, [
      tenantId, data.name, data.email, data.phone, data.company || null, data.message || null,
      data.source, data.territory, data.budget || 0, !!data.whatsappOptIn,
      data.score, data.label, JSON.stringify(data.scoringReasons), data.scoringEngine,
      data.assignedToId || null,
    ])
  },

  async findById({ tenantId, id }) {
    return pgOne(`SELECT * FROM leads WHERE tenant_id = $1 AND id = $2`, [tenantId, id])
  },

  async update({ tenantId, id, patch }) {
    const sets = []
    const args = [tenantId, id]
    for (const [k, v] of Object.entries(patch)) {
      sets.push(`${k} = $${args.length + 1}`); args.push(v)
    }
    if (!sets.length) return null
    const sql = `UPDATE leads SET ${sets.join(', ')} WHERE tenant_id = $1 AND id = $2 RETURNING *`
    return pgOne(sql, args)
  },

  async delete({ tenantId, id }) {
    await pgQuery(`DELETE FROM leads WHERE tenant_id = $1 AND id = $2`, [tenantId, id])
    return { ok: true }
  },
}
```

### Phase 3 — Build adapter selector (Day 1, ~30 min)

```js
// /app/lib/repo/index.js
import { pgEnabled } from '@/lib/pg'
import { mongoLeadsRepo } from './mongo-leads'
import { pgLeadsRepo }    from './pg-leads'

export function getRepo() {
  return pgEnabled() ? { leads: pgLeadsRepo /*, users: pgUsersRepo, ...*/ }
                     : { leads: mongoLeadsRepo /*, users: mongoUsersRepo, ...*/ }
}
```

Then swap each handler from:
```js
const lead = await db.collection('leads').findOne(...)
```
to:
```js
const lead = await getRepo().leads.findById({ tenantId: orgId, id })
```

### Phase 4 — Migrate existing data (Day 2, ~3 hr)

A one-shot Node script reads from Mongo, writes to Postgres:

```js
// /app/scripts/migrate-mongo-to-pg.js
import { getDb } from '../lib/mongo.js'
import { pgQuery } from '../lib/pg.js'

async function migrateLeads() {
  const db = await getDb()
  const leads = await db.collection('leads').find({}).toArray()
  for (const l of leads) {
    await pgQuery(
      `INSERT INTO leads (id, tenant_id, name, email, phone, company, message, source, territory, budget, whatsapp_opted_in, score, label, scoring_reasons, scoring_engine, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO NOTHING`,
      [l.id, l.orgId, l.name, l.email, l.phone, l.company, l.message, l.source, l.territory,
       l.budget || 0, l.whatsapp || false, l.score, l.label, JSON.stringify(l.reasons || []),
       l.engine, l.status, l.createdAt, l.updatedAt]
    )
  }
  console.log(`Migrated ${leads.length} leads`)
}

async function migrateUsers() { /* ... same pattern ... */ }
async function migrateFollowups() { /* ... */ }
async function migrateNotifications() { /* ... */ }

await migrateLeads()
await migrateUsers()
await migrateFollowups()
await migrateNotifications()
console.log('Done')
process.exit(0)
```

Run:
```bash
cd /opt/asoftech && node scripts/migrate-mongo-to-pg.js
```

### Phase 5 — Flip the switch (Day 2, 5 min)

```bash
# DATABASE_URL is set → app uses Postgres
# (Unset DATABASE_URL to instantly roll back to Mongo)
docker compose restart app
curl https://app.asoftechinsightz.com/api/leads -H "authorization: Bearer <jwt>" | jq '.meta'
# Should still work; data now read from Postgres
```

### Phase 6 — Verify & decommission (Day 3)

- Run the full Postman collection against the live API → all green
- Watch logs for 24h → no errors
- Stop Mongo container: `docker compose stop mongo`
- After 7 days of stability, remove Mongo from `docker-compose.yml`

## Total effort

- Phase 1 (Postgres install + seed): **30 min**
- Phase 2 (leads repo + 5 other entities × 1 hr): **6 hr**
- Phase 3 (adapter wiring): **30 min**
- Phase 4 (data migration script): **2 hr**
- Phase 5–6 (cutover + verify): **2 hr**
- **Total: ~11 hr / 1.5 working days for one developer**

## What's already done

- ✅ Canonical Postgres schema (`docs/sql/01_schema.sql`)
- ✅ Indexes incl. trigram for full-text search (`docs/sql/02_indexes.sql`)
- ✅ Seed data + admin user (`docs/sql/03_seed.sql`)
- ✅ One-shot DB init script (`docs/sql/init-db.sh`)
- ✅ `pg` driver installed in `package.json`
- ✅ Connection pool helper (`lib/pg.js`)
- ✅ Example `pgLeadsRepo` snippet above

## Next step

When ready, instruct the engineer:

> Implement the 6 repo adapters (`pg-leads.js`, `pg-users.js`, `pg-followups.js`, `pg-notifications.js`, `pg-whatsapp.js`, `pg-payments.js`) under `/app/lib/repo/`, wire them through `getRepo()`, and run the migration script. Estimated 1.5 days.
