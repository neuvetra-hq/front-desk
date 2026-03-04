# db-reset

Resets the local Supabase database and re-applies all migrations.

```bash
supabase db reset
```

This will:
1. Drop all tables in the local database
2. Re-run all migrations in `supabase/migrations/` in order
3. Apply `supabase/seed.sql`

> **Warning:** This destroys all local data. Never run against production.
