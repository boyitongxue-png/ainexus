import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { routeStrategies } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const routeStrategyRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(routeStrategies).orderBy(desc(routeStrategies.createdAt));
  }),

  create: authedQuery
    .input(z.object({
      name: z.string().min(1),
      primaryModelId: z.number(),
      fallbackModelIds: z.array(z.number()).default([]),
      timeout: z.number().default(30000),
      priority: z.enum(["cost", "quality", "speed"]).default("quality"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(routeStrategies).values({
        ...input,
        ownerId: ctx.user.id,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      primaryModelId: z.number().optional(),
      fallbackModelIds: z.array(z.number()).optional(),
      timeout: z.number().optional(),
      priority: z.enum(["cost", "quality", "speed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(routeStrategies).set(data).where(eq(routeStrategies.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(routeStrategies).where(eq(routeStrategies.id, input.id));
      return { success: true };
    }),
});
