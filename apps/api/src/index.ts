import { Elysia, t } from "elysia"
import { webhooks } from "./routes/webhooks"
import { businessesRoutes } from "./routes/businesses"
import { searchAvailableNumbers } from "./services/twilio"

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))

  // Public endpoint — search available numbers before a business exists
  .get("/available-numbers", async ({ query }) => {
    const areaCode = (query as Record<string, string>).areaCode ?? "415"
    const numbers = await searchAvailableNumbers(areaCode)
    return { numbers }
  })

  .use(webhooks)
  .use(businessesRoutes)
  .listen(Bun.env.PORT ?? 3000)

export type App = typeof app

console.log(`API running at ${app.server?.hostname}:${app.server?.port}`)
