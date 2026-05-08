import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { creditTransactions, rechargeApplications, userCredits } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const creditRouter = createRouter({
  // User Credits
  getBalance: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.select().from(userCredits).where(eq(userCredits.userId, ctx.user.id));
    if (result.length === 0) {
      await db.insert(userCredits).values({ userId: ctx.user.id, balance: "0", totalRecharged: "0", totalConsumed: "0" });
      return { balance: "0", totalRecharged: "0", totalConsumed: "0" };
    }
    return result[0];
  }),

  // Transactions
  transactionList: authedQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;
      const results = await db.select().from(creditTransactions)
        .where(eq(creditTransactions.userId, ctx.user.id))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, ctx.user.id));
      return { items: results, total: countResult[0]?.count ?? 0 };
    }),

  transactionCreate: adminQuery
    .input(z.object({
      txType: z.enum(["recharge", "consume", "refund", "gift", "adjust"]),
      amount: z.string(),
      balanceBefore: z.string().default("0"),
      balanceAfter: z.string().default("0"),
      description: z.string().optional(),
      relatedId: z.string().optional(),
      operator: z.string().default("system"),
      userId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(creditTransactions).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Recharge Applications
  rechargeList: adminQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z.enum(["pending", "approved", "rejected"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;
      const results = await db.select().from(rechargeApplications)
        .orderBy(desc(rechargeApplications.createdAt))
        .limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(rechargeApplications);
      return { items: results, total: countResult[0]?.count ?? 0 };
    }),

  rechargeCreate: authedQuery
    .input(z.object({
      amount: z.string(),
      creditsRequested: z.string(),
      method: z.enum(["bank_transfer", "alipay", "wechat"]),
      remark: z.string().optional(),
      bankName: z.string().optional(),
      accountLast4: z.string().optional(),
      voucherUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(rechargeApplications).values({
        ...input,
        userId: ctx.user.id,
      });
      return { id: Number(result[0].insertId) };
    }),

  rechargeReview: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected"]),
      reviewNote: z.string().optional(),
      rejectReason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(rechargeApplications).set({
        status: input.status,
        reviewNote: input.reviewNote,
        rejectReason: input.rejectReason,
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
      }).where(eq(rechargeApplications.id, input.id));
      return { success: true };
    }),
});
