import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { adminLogs, systemSettings } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const adminRouter = createRouter({
  // Admin Logs
  logList: adminQuery
    .input(z.object({
      limit: z.number().min(1).max(200).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;
      const results = await db.select().from(adminLogs)
        .orderBy(desc(adminLogs.createdAt))
        .limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(adminLogs);
      return { items: results, total: countResult[0]?.count ?? 0 };
    }),

  logCreate: adminQuery
    .input(z.object({
      adminName: z.string().min(1),
      module: z.string().min(1),
      actionType: z.string().min(1),
      targetObject: z.string().optional(),
      beforeValue: z.string().optional(),
      afterValue: z.string().optional(),
      ipAddress: z.string().optional(),
      sensitivity: z.enum(["normal", "sensitive", "highrisk"]).default("normal"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(adminLogs).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // System Settings
  settingList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(systemSettings).orderBy(systemSettings.settingKey);
  }),

  settingGet: adminQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(systemSettings)
        .where(eq(systemSettings.settingKey, input.key));
      return result[0] ?? null;
    }),

  settingUpdate: adminQuery
    .input(z.object({
      key: z.string(),
      value: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(systemSettings)
        .set({ settingValue: input.value })
        .where(eq(systemSettings.settingKey, input.key));
      return { success: true };
    }),

  settingCreate: adminQuery
    .input(z.object({
      settingKey: z.string().min(1),
      settingValue: z.string(),
      label: z.string().optional(),
      settingType: z.enum(["text", "number", "password", "toggle", "select"]).default("text"),
      options: z.array(z.string()).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Try update first, then insert
      const existing = await db.select().from(systemSettings)
        .where(eq(systemSettings.settingKey, input.settingKey));
      
      if (existing.length > 0) {
        await db.update(systemSettings)
          .set({ settingValue: input.settingValue })
          .where(eq(systemSettings.settingKey, input.settingKey));
      } else {
        await db.insert(systemSettings).values(input);
      }
      return { success: true };
    }),
});
