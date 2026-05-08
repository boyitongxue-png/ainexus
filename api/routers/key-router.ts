import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { upstreamKeys, platformKeys } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const keyRouter = createRouter({
  // Upstream Keys
  upstreamList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(upstreamKeys).orderBy(desc(upstreamKeys.createdAt));
  }),

  upstreamCreate: adminQuery
    .input(z.object({
      name: z.string().min(1),
      provider: z.string().min(1),
      keyEncrypted: z.string().min(1),
      keyPreview: z.string().min(1),
      baseUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(upstreamKeys).values(input);
      return { id: Number(result[0].insertId) };
    }),

  upstreamUpdate: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      provider: z.string().min(1).optional(),
      status: z.enum(["active", "inactive", "expired"]).optional(),
      baseUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(upstreamKeys).set(data).where(eq(upstreamKeys.id, id));
      return { success: true };
    }),

  upstreamDelete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(upstreamKeys).where(eq(upstreamKeys.id, input.id));
      return { success: true };
    }),

  // Platform Keys
  platformList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(platformKeys).orderBy(desc(platformKeys.createdAt));
  }),

  platformCreate: authedQuery
    .input(z.object({
      name: z.string().min(1),
      keyEncrypted: z.string().min(1),
      keyPreview: z.string().min(1),
      permissions: z.array(z.string()).default([]),
      rateLimit: z.number().default(1000),
      ipWhitelist: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(platformKeys).values({
        ...input,
        ownerId: ctx.user.id,
      });
      return { id: Number(result[0].insertId) };
    }),

  platformUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      status: z.enum(["active", "inactive"]).optional(),
      permissions: z.array(z.string()).optional(),
      rateLimit: z.number().optional(),
      ipWhitelist: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(platformKeys).set(data).where(eq(platformKeys.id, id));
      return { success: true };
    }),

  platformDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(platformKeys).where(eq(platformKeys.id, input.id));
      return { success: true };
    }),
});
