/**
 * Model Routing Engine
 * Maps user-requested models to upstream providers and keys
 */

import { getDb } from "../queries/connection";
import { models, upstreamKeys } from "@db/schema";
import { eq, and } from "drizzle-orm";
import type { GatewayContext } from "./types";

/**
 * Resolve a model request to its upstream configuration
 */
export async function resolveModel(
  modelName: string
): Promise<GatewayContext | null> {
  const db = getDb();

  // Find model by API identifier or name
  const modelResults = await db
    .select()
    .from(models)
    .where(
      and(
        eq(models.apiIdentifier, modelName),
        eq(models.status, "active")
      )
    )
    .limit(1);

  if (modelResults.length === 0) {
    // Try matching by model name
    const byName = await db
      .select()
      .from(models)
      .where(
        and(eq(models.name, modelName), eq(models.status, "active"))
      )
      .limit(1);

    if (byName.length === 0) return null;
  }

  const model = modelResults[0] || (await db.select().from(models).where(and(eq(models.name, modelName), eq(models.status, "active"))).limit(1))[0];
  if (!model) return null;

  // Fetch upstream key if configured
  let upstreamKey: typeof upstreamKeys.$inferSelect | null = null;
  if (model.upstreamKeyId) {
    const uk = await db
      .select()
      .from(upstreamKeys)
      .where(
        and(
          eq(upstreamKeys.id, model.upstreamKeyId),
          eq(upstreamKeys.status, "active")
        )
      )
      .limit(1);
    upstreamKey = uk[0] || null;
  }

  // Fallback: find any key for this provider
  if (!upstreamKey) {
    const fallback = await db
      .select()
      .from(upstreamKeys)
      .where(
        and(
          eq(upstreamKeys.provider, model.provider),
          eq(upstreamKeys.status, "active")
        )
      )
      .limit(1);
    upstreamKey = fallback[0] || null;
  }

  if (!upstreamKey) {
    return null;
  }

  return {
    platformKeyId: 0, // filled by auth middleware
    platformKeyName: "",
    ownerId: null,
    permissions: [],
    rateLimit: 1000,
    modelId: model.id,
    modelName: model.name,
    provider: model.provider,
    apiIdentifier: model.apiIdentifier,
    upstreamKeyId: upstreamKey.id,
    upstreamKeyEncrypted: upstreamKey.keyEncrypted,
    upstreamBaseUrl: upstreamKey.baseUrl,
    platformPrice: model.platformPrice || "0",
    inputCost: model.inputCost || "0",
    asyncSupport: model.asyncSupport,
  };
}

/**
 * Get model pricing info for billing
 */
export async function getModelPricing(modelId: number) {
  const db = getDb();
  const result = await db
    .select()
    .from(models)
    .where(eq(models.id, modelId))
    .limit(1);

  if (result.length === 0) return null;

  const m = result[0];
  return {
    modelId: m.id,
    name: m.name,
    provider: m.provider,
    inputCost: parseFloat(m.inputCost || "0"), // credits per 1M input tokens
    platformPrice: parseFloat(m.platformPrice || "0"), // credits per 1M output tokens
    costPer1M: parseFloat(m.costPer1MTokens || "0"),
  };
}

/**
 * List all active models (for /v1/models endpoint)
 */
export async function listActiveModels() {
  const db = getDb();
  return db
    .select({
      id: models.id,
      name: models.name,
      apiIdentifier: models.apiIdentifier,
      provider: models.provider,
      modelType: models.modelType,
      description: models.description,
      asyncSupport: models.asyncSupport,
    })
    .from(models)
    .where(eq(models.status, "active"));
}

/**
 * Convert model ID to OpenAI-compatible model ID format
 */
export function toOpenAIModelId(model: {
  apiIdentifier: string;
  provider: string;
}): string {
  // Use the model's API identifier directly for OpenAI-compatible naming
  return model.apiIdentifier;
}
