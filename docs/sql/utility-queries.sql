-- =============================================================================
--  PostgreSQL backup / restore helper SQL
-- =============================================================================

-- Quick stats: row count per table
SELECT relname AS table, n_live_tup AS rows
FROM   pg_stat_user_tables
ORDER  BY n_live_tup DESC;

-- Tenant-scoped soft delete (DPDP “right to be forgotten”)
-- Replace :tenant with the UUID, then run inside a transaction.
-- BEGIN;
-- DELETE FROM leads      WHERE tenant_id = :tenant;
-- DELETE FROM follow_ups WHERE tenant_id = :tenant;
-- DELETE FROM whatsapp_messages WHERE tenant_id = :tenant;
-- DELETE FROM notifications     WHERE tenant_id = :tenant;
-- DELETE FROM users      WHERE tenant_id = :tenant;
-- DELETE FROM tenants    WHERE id = :tenant;
-- COMMIT;
