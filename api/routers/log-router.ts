import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { callLogs, asyncTasks } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const logRouter = createRouter({
  // Call Logs
  list: publicQuery
    .input(z.object({
      limit: z.number().min(1).max(500).default(50),
      offset: z.number().min(0).default(0),
      status: z.enum(["success", "error", "timeout"]).optional(),
      modelId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      let query = db.select().from(callLogs).orderBy(desc(callLogs.timestamp)).limit(limit).offset(offset);
      const results = await query;
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(callLogs);
      return {
        items: results,
        total: countResult[0]?.count ?? 0,
      };
    }),

  create: publicQuery
    .input(z.object({
      requestId: z.string().min(1),
      type: z.string().min(1),
      modelId: z.number().optional(),
      modelName: z.string().optional(),
      status: z.enum(["success", "error", "timeout"]).default("success"),
      duration: z.number().default(0),
      creditsUsed: z.string().default("0"),
      tokensUsed: z.number().default(0),
      errorCode: z.string().optional(),
      errorMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(callLogs).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Async Tasks
  taskList: publicQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;
      const results = await db.select().from(asyncTasks).orderBy(desc(asyncTasks.createdAt)).limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(asyncTasks);
      return {
        items: results,
        total: countResult[0]?.count ?? 0,
      };
    }),

  taskCreate: publicQuery
    .input(z.object({
      taskType: z.enum(["image", "video"]),
      modelId: z.number().optional(),
      modelName: z.string().optional(),
      prompt: z.string().optional(),
      creditsUsed: z.string().default("0"),
      frozenCredits: z.string().default("0"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(asyncTasks).values(input);
      return { id: Number(result[0].insertId) };
    }),

  taskUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
      resultUrl: z.string().optional(),
      creditsUsed: z.string().optional(),
      progress: z.number().optional(),
      failureReason: z.string().optional(),
      completedAt: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(asyncTasks).set(data).where(eq(asyncTasks.id, id));
      return { success: true };
    }),

  taskDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(asyncTasks).where(eq(asyncTasks.id, input.id));
      return { success: true };
    }),
});
