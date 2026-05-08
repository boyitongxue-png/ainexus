import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { modelRouter } from "./routers/model-router";
import { keyRouter } from "./routers/key-router";
import { logRouter } from "./routers/log-router";
import { creditRouter } from "./routers/credit-router";
import { teamRouter } from "./routers/team-router";
import { webhookRouter } from "./routers/webhook-router";
import { adminRouter } from "./routers/admin-router";
import { cmsRouter } from "./routers/cms-router";
import { statsRouter } from "./routers/stats-router";
import { routeStrategyRouter } from "./routers/route-strategy-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  model: modelRouter,
  key: keyRouter,
  log: logRouter,
  credit: creditRouter,
  team: teamRouter,
  webhook: webhookRouter,
  admin: adminRouter,
  cms: cmsRouter,
  stats: statsRouter,
  routeStrategy: routeStrategyRouter,
});

export type AppRouter = typeof appRouter;
