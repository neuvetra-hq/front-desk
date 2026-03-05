import { Elysia } from "elysia"
import { webhooks } from "./routes/webhooks"

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .use(webhooks)
  .listen(process.env.PORT ?? 3000)

export type App = typeof app

console.log(`API running at ${app.server?.hostname}:${app.server?.port}`)
