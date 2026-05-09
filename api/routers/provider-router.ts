import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { providers } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";

export const providerRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(providers).orderBy(asc(providers.sortOrder), desc(providers.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(providers).where(eq(providers.id, input.id));
      return result[0] ?? null;
    }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1).max(100),
      displayName: z.string().min(1).max(255),
      baseUrl: z.string().max(500).optional(),
      description: z.string().optional(),
      sortOrder: z.number().default(0),
      status: z.enum(["active", "inactive"]).default("active"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(providers).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      displayName: z.string().min(1).max(255).optional(),
      baseUrl: z.string().max(500).optional(),
      description: z.string().optional(),
      sortOrder: z.number().optional(),
      status: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(providers).set(data).where(eq(providers.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(providers).where(eq(providers.id, input.id));
      return { success: true };
    }),
});
