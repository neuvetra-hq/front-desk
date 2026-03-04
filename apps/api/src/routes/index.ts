import { Hono } from "hono";

export const routes = new Hono();

// Health check
routes.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Route stubs — implement in dedicated files and mount here
// ---------------------------------------------------------------------------
// POST /webhooks/retell  →  Retell AI webhook (target: < 200 ms)
// POST /auth/...         →  Supabase Auth helpers
// GET  /appointments     →  Calendar reads
// ---------------------------------------------------------------------------
