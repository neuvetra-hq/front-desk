import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { retellRoutes } from "./routes/retell.routes.js";

const app = new Hono();

// Health check
app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));

// Route groups
app.route("/webhooks/retell", retellRoutes);

const PORT = Number(process.env.PORT) || 3001;

serve(
  { fetch: app.fetch, port: PORT },
  (info) => {
    process.stdout.write(`[api] listening on http://localhost:${info.port}\n`);
  },
);

export default app;
