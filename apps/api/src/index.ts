import { Elysia } from "elysia"
import { webhooks } from "./routes/webhooks"
import { businessesRoutes } from "./routes/businesses"

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .use(webhooks)
  .use(businessesRoutes)
  .listen(Bun.env.PORT ?? 3000)

export type App = typeof app

console.log(`API running at ${app.server?.hostname}:${app.server?.port}`)
