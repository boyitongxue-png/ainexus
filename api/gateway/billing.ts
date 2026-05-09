/**
 * Billing Engine
 * Calculates credits from token usage and manages balance deductions
 */

import { getDb } from "../queries/connection";
import {
  userCredits,
  creditTransactions,
  callLogs,
  asyncTasks,
} from "@db/schema";
import { eq, sql, and } from "drizzle-orm";
import type { BillingResult, UsageInfo } from "./types";

// Credit cost per 1M tokens for different operation types
const CREDIT_MULTIPLIER = 100; // 1 RMB = 100 credits

/**
 * Calculate credits needed based on token usage and model pricing
 * Billing unit: per 1M tokens (not per 1K)
 */
export function calculateCredits(
  usage: UsageInfo,
  inputCostPer1M: number,   // credits per 1M input tokens
  outputCostPer1M: number   // credits per 1M output tokens
): BillingResult {
  const promptCredits = (usage.promptTokens / 1000000) * inputCostPer1M;
  const completionCredits =
    (usage.completionTokens / 1000000) * outputCostPer1M;
  const totalCredits = promptCredits + completionCredits;

  // Round to 4 decimal places
  return {
    creditsUsed: totalCredits.toFixed(4),
    promptCredits: promptCredits.toFixed(4),
    completionCredits: completionCredits.toFixed(4),
    balanceAfter: null,
  };
}

/**
 * Calculate credits for image generation (fixed price per image)
 */
export function calculateImageCredits(
  imageCount: number,
  pricePerImage: number
): string {
  return (imageCount * pricePerImage).toFixed(4);
}

/**
 * Calculate credits for video generation (fixed price per video)
 */
export function calculateVideoCredits(
  videoCount: number,
  pricePerVideo: number
): string {
  return (videoCount * pricePerVideo).toFixed(4);
}

/**
 * Check if user has sufficient balance
 */
export async function checkBalance(
  userId: number,
  requiredCredits: number
): Promise<{ sufficient: boolean; currentBalance: number }> {
  const db = getDb();

  const result = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  if (result.length === 0) {
    return { sufficient: false, currentBalance: 0 };
  }

  const balance = parseFloat(result[0].balance);
  return {
    sufficient: balance >= requiredCredits,
    currentBalance: balance,
  };
}

/**
 * Pre-authorize (freeze) credits before request
 */
export async function freezeCredits(
  userId: number,
  amount: number,
  description: string
): Promise<boolean> {
  const db = getDb();

  const result = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  if (result.length === 0) {
    // Auto-create credit record
    await db.insert(userCredits).values({
      userId,
      balance: "0",
      totalRecharged: "0",
      totalConsumed: "0",
    });
    return false;
  }

  const current = parseFloat(result[0].balance);
  if (current < amount) return false;

  // Deduct from balance
  const newBalance = (current - amount).toFixed(4);
  await db
    .update(userCredits)
    .set({
      balance: newBalance,
      totalConsumed: (
        parseFloat(result[0].totalConsumed) + amount
      ).toFixed(4),
    })
    .where(eq(userCredits.userId, userId));

  // Record transaction
  await db.insert(creditTransactions).values({
    txType: "consume",
    amount: (-amount).toFixed(4),
    balanceBefore: current.toFixed(4),
    balanceAfter: newBalance,
    description,
    userId,
  });

  return true;
}

/**
 * Charge credits after request completion
 * (Deduction already done by freeze, this records actual usage)
 */
export async function chargeCredits(
  userId: number,
  actualUsage: number,
  frozenAmount: number,
  description: string,
  relatedId?: string
): Promise<BillingResult> {
  const db = getDb();

  const result = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  if (result.length === 0) {
    return {
      creditsUsed: actualUsage.toFixed(4),
      promptCredits: "0",
      completionCredits: "0",
      balanceAfter: "0",
    };
  }

  const credit = result[0];
  const currentBalance = parseFloat(credit.balance);

  // If actual usage < frozen amount, refund the difference
  const diff = frozenAmount - actualUsage;
  let finalBalance = currentBalance;

  if (diff > 0) {
    // Refund excess
    finalBalance = currentBalance + diff;
    await db
      .update(userCredits)
      .set({
        balance: finalBalance.toFixed(4),
        totalConsumed: (
          parseFloat(credit.totalConsumed) - diff
        ).toFixed(4),
      })
      .where(eq(userCredits.userId, userId));

    // Record refund transaction
    await db.insert(creditTransactions).values({
      txType: "refund",
      amount: diff.toFixed(4),
      balanceBefore: currentBalance.toFixed(4),
      balanceAfter: finalBalance.toFixed(4),
      description: `Refund: ${description}`,
      relatedId,
      userId,
    });
  }

  return {
    creditsUsed: actualUsage.toFixed(4),
    promptCredits: "0",
    completionCredits: "0",
    balanceAfter: finalBalance.toFixed(4),
  };
}

/**
 * Record a call log entry
 */
export async function recordCallLog(params: {
  requestId: string;
  type: string;
  modelId: number;
  modelName: string;
  status: "success" | "error" | "timeout";
  duration: number;
  creditsUsed: string;
  tokensUsed: number;
  userId: number | null;
  errorCode?: string;
  errorMessage?: string;
}) {
  const db = getDb();
  await db.insert(callLogs).values(params);
}

/**
 * Create an async task record
 */
export async function createAsyncTask(params: {
  taskType: "image" | "video";
  modelId: number;
  modelName: string;
  prompt: string;
  frozenCredits: string;
  userId: number | null;
}): Promise<number> {
  const db = getDb();
  const result = await db.insert(asyncTasks).values({
    ...params,
    status: "pending",
    progress: 0,
    creditsUsed: "0",
  });
  return Number(result[0].insertId);
}

/**
 * Update async task status
 */
export async function updateAsyncTask(
  taskId: number,
  updates: {
    status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
    resultUrl?: string;
    creditsUsed?: string;
    progress?: number;
    failureReason?: string;
  }
) {
  const db = getDb();
  await db
    .update(asyncTasks)
    .set({
      ...updates,
      completedAt:
        updates.status === "completed" || updates.status === "failed"
          ? new Date()
          : undefined,
    })
    .where(eq(asyncTasks.id, taskId));
}

/**
 * Estimate token count from messages (rough estimation)
 */
export function estimateTokens(messages: Array<{ content: string }>): number {
  // Simple heuristic: ~4 chars per token for English, ~2 for Chinese
  let total = 0;
  for (const msg of messages) {
    const content = msg.content || "";
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const otherChars = content.length - chineseChars;
    total += Math.ceil(chineseChars / 2) + Math.ceil(otherChars / 4);
  }
  return total;
}

/**
 * Extract usage from upstream response
 */
export function extractUsage(responseBody: any): UsageInfo {
  const usage = responseBody?.usage || {};
  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
  };
}
