import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { models } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const modelRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(models).orderBy(desc(models.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(models).where(eq(models.id, input.id));
      return result[0] ?? null;
    }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1),
      provider: z.string().min(1),
      modelType: z.enum(["text", "image", "video", "embedding", "audio"]),
      apiIdentifier: z.string().min(1),
      asyncSupport: z.boolean().default(false),
      defaultTimeout: z.number().default(30),
      defaultRetries: z.number().default(3),
      status: z.enum(["active", "inactive", "beta"]).default("active"),
      capabilities: z.array(z.string()).default([]),
      costPer1KTokens: z.string().default("0"),
      inputCost: z.string().default("0"),
      platformPrice: z.string().default("0"),
      contextWindow: z.number().default(0),
      description: z.string().optional(),
      baseUrl: z.string().optional(),
      upstreamKeyId: z.number().optional(),
      customPath: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(models).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      provider: z.string().min(1).optional(),
      modelType: z.enum(["text", "image", "video", "embedding", "audio"]).optional(),
      apiIdentifier: z.string().min(1).optional(),
      asyncSupport: z.boolean().optional(),
      defaultTimeout: z.number().optional(),
      defaultRetries: z.number().optional(),
      status: z.enum(["active", "inactive", "beta"]).optional(),
      capabilities: z.array(z.string()).optional(),
      costPer1KTokens: z.string().optional(),
      inputCost: z.string().optional(),
      platformPrice: z.string().optional(),
      contextWindow: z.number().optional(),
      description: z.string().optional(),
      baseUrl: z.string().optional(),
      upstreamKeyId: z.number().optional(),
      customPath: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(models).set(data).where(eq(models.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(models).where(eq(models.id, input.id));
      return { success: true };
    }),
});
