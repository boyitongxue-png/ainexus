import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { webhookConfigs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const webhookRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(webhookConfigs).orderBy(desc(webhookConfigs.createdAt));
  }),

  create: authedQuery
    .input(z.object({
      url: z.string().url(),
      events: z.array(z.string()).default([]),
      secret: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(webhookConfigs).values({
        ...input,
        ownerId: ctx.user.id,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      url: z.string().url().optional(),
      events: z.array(z.string()).optional(),
      secret: z.string().optional(),
      status: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(webhookConfigs).set(data).where(eq(webhookConfigs.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(webhookConfigs).where(eq(webhookConfigs.id, input.id));
      return { success: true };
    }),
});
