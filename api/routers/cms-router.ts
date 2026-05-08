import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { cmsConfigs } from "@db/schema";
import { eq } from "drizzle-orm";

export const cmsRouter = createRouter({
  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(cmsConfigs)
        .where(eq(cmsConfigs.configKey, input.key));
      return result[0] ?? null;
    }),

  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(cmsConfigs);
  }),

  update: adminQuery
    .input(z.object({
      key: z.string(),
      data: z.custom<Record<string, any>>(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(cmsConfigs)
        .where(eq(cmsConfigs.configKey, input.key));
      
      if (existing.length > 0) {
        await db.update(cmsConfigs)
          .set({ configData: input.data })
          .where(eq(cmsConfigs.configKey, input.key));
      } else {
        await db.insert(cmsConfigs).values({
          configKey: input.key,
          configData: input.data,
        });
      }
      return { success: true };
    }),

  updatePartial: adminQuery
    .input(z.object({
      key: z.string(),
      data: z.custom<Record<string, any>>(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(cmsConfigs)
        .where(eq(cmsConfigs.configKey, input.key));

      if (existing.length === 0) {
        await db.insert(cmsConfigs).values({
          configKey: input.key,
          configData: input.data,
        });
      } else {
        const merged = { ...(existing[0].configData as object), ...input.data };
        await db.update(cmsConfigs)
          .set({ configData: merged })
          .where(eq(cmsConfigs.configKey, input.key));
      }
      return { success: true };
    }),
});
