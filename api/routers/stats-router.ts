import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { callLogs, asyncTasks, models, users, creditTransactions } from "@db/schema";
import { sql, eq, desc } from "drizzle-orm";

export const statsRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();

    const [totalCallsResult, activeModelsResult, totalUsersResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(callLogs),
      db.select({ count: sql<number>`count(*)` }).from(models).where(eq(models.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ]);

    const recentCalls = await db.select().from(callLogs)
      .orderBy(desc(callLogs.timestamp))
      .limit(5);

    const creditTrend = await db.select({
      date: sql<string>`DATE(created_at)`,
      credits: sql<number>`SUM(ABS(amount))`,
    }).from(creditTransactions)
      .groupBy(sql`DATE(created_at)`)
      .orderBy(desc(sql`DATE(created_at)`))
      .limit(7);

    return {
      totalApiCalls: totalCallsResult[0]?.count ?? 0,
      activeModels: activeModelsResult[0]?.count ?? 0,
      totalUsers: totalUsersResult[0]?.count ?? 0,
      recentCalls,
      creditTrend: creditTrend.reverse(),
    };
  }),

  adminDashboard: adminQuery.query(async () => {
    const db = getDb();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalCallsResult,
      activeModelsResult,
      totalUsersResult,
      pendingTasksResult,
      pendingRechargesResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(callLogs),
      db.select({ count: sql<number>`count(*)` }).from(models).where(eq(models.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(asyncTasks).where(eq(asyncTasks.status, "pending")),
      db.select({ count: sql<number>`count(*)` }).from(creditTransactions).where(eq(creditTransactions.txType, "recharge")),
    ]);

    const hourlyData = await db.select({
      hour: sql<string>`HOUR(timestamp)`,
      requests: sql<number>`count(*)`,
      success: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
      failed: sql<number>`SUM(CASE WHEN status != 'success' THEN 1 ELSE 0 END)`,
      avgDuration: sql<number>`AVG(duration)`,
    }).from(callLogs)
      .groupBy(sql`HOUR(timestamp)`)
      .orderBy(sql`HOUR(timestamp)`);

    const topModels = await db.select({
      name: callLogs.modelName,
      requests: sql<number>`count(*)`,
      avgResponse: sql<number>`AVG(duration)`,
      successRate: sql<number>`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / count(*)`,
    }).from(callLogs)
      .groupBy(callLogs.modelName)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return {
      totalApiCalls: totalCallsResult[0]?.count ?? 0,
      activeModels: activeModelsResult[0]?.count ?? 0,
      totalUsers: totalUsersResult[0]?.count ?? 0,
      pendingTasks: pendingTasksResult[0]?.count ?? 0,
      pendingRecharges: pendingRechargesResult[0]?.count ?? 0,
      hourlyData,
      topModels,
    };
  }),
});
