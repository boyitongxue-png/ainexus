/**
 * Gateway Routes
 * Registers all OpenAI-compatible API endpoints
 */

import { Hono } from "hono";
import { platformKeyAuth } from "./auth";
import { resolveModel, listActiveModels } from "./routing";
import {
  proxyChatCompletion,
  proxyChatCompletionStream,
  proxyEmbeddings,
} from "./proxy";
import {
  freezeCredits,
  createAsyncTask,
  calculateImageCredits,
  calculateVideoCredits,
} from "./billing";
import { getDb } from "../queries/connection";
import { asyncTasks, models, userCredits } from "@db/schema";
import { eq } from "drizzle-orm";
import type { GatewayContext } from "./types";
import { getPlatformKey } from "./auth";

const gateway = new Hono();

// Apply Platform Key auth to all gateway routes
gateway.use("/*", platformKeyAuth);

// ===== /v1/models =====
gateway.get("/models", async (c) => {
  const modelList = await listActiveModels();

  return c.json({
    object: "list",
    data: modelList.map((m) => ({
      id: m.apiIdentifier,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      owned_by: m.provider,
    })),
  });
});

// ===== /v1/models/:model =====
gateway.get("/models/:model", async (c) => {
  const modelId = c.req.param("model");
  const ctx = await resolveModel(modelId);

  if (!ctx) {
    return c.json(
      {
        error: {
          message: `Model '${modelId}' not found`,
          type: "invalid_request_error",
          code: "model_not_found",
        },
      },
      404
    );
  }

  return c.json({
    id: modelId,
    object: "model",
    created: Math.floor(Date.now() / 1000),
    owned_by: ctx.provider,
  });
});

// ===== /v1/chat/completions =====
gateway.post("/chat/completions", async (c) => {
  const body = await c.req.json();
  const modelName = body.model;

  if (!modelName) {
    return c.json(
      {
        error: {
          message: "Missing required parameter: 'model'",
          type: "invalid_request_error",
          code: "missing_model",
        },
      },
      400
    );
  }

  // Resolve model
  const ctx = await resolveModel(modelName);
  if (!ctx) {
    return c.json(
      {
        error: {
          message: `Model '${modelName}' not found or unavailable`,
          type: "invalid_request_error",
          code: "model_not_found",
        },
      },
      404
    );
  }

  // Merge platform key info
  const pk = getPlatformKey(c);
  const fullCtx: GatewayContext = {
    ...ctx,
    platformKeyId: pk.id,
    platformKeyName: pk.name,
    ownerId: pk.ownerId,
    permissions: pk.permissions,
    rateLimit: pk.rateLimit,
  };

  // Check if streaming
  const isStream = body.stream === true;

  if (isStream) {
    return proxyChatCompletionStream(fullCtx, body, pk.ownerId);
  } else {
    return proxyChatCompletion(fullCtx, body, pk.ownerId);
  }
});

// ===== /v1/embeddings =====
gateway.post("/embeddings", async (c) => {
  const body = await c.req.json();
  const modelName = body.model;

  if (!modelName) {
    return c.json(
      {
        error: {
          message: "Missing required parameter: 'model'",
          type: "invalid_request_error",
          code: "missing_model",
        },
      },
      400
    );
  }

  const ctx = await resolveModel(modelName);
  if (!ctx) {
    return c.json(
      {
        error: {
          message: `Model '${modelName}' not found`,
          type: "invalid_request_error",
          code: "model_not_found",
        },
      },
      404
    );
  }

  const pk = getPlatformKey(c);
  const fullCtx: GatewayContext = {
    ...ctx,
    platformKeyId: pk.id,
    platformKeyName: pk.name,
    ownerId: pk.ownerId,
    permissions: pk.permissions,
    rateLimit: pk.rateLimit,
  };

  return proxyEmbeddings(fullCtx, body, pk.ownerId);
});

// ===== /v1/images/generations =====
gateway.post("/images/generations", async (c) => {
  const body = await c.req.json();
  const modelName = body.model || "dall-e-3";

  const ctx = await resolveModel(modelName);
  if (!ctx) {
    return c.json(
      {
        error: {
          message: `Model '${modelName}' not found`,
          type: "invalid_request_error",
          code: "model_not_found",
        },
      },
      404
    );
  }

  // Check async support
  if (!ctx.asyncSupport) {
    return c.json(
      {
        error: {
          message: `Model '${modelName}' does not support async generation`,
          type: "invalid_request_error",
          code: "async_not_supported",
        },
      },
      400
    );
  }

  const pk = getPlatformKey(c);
  const imageCount = body.n || 1;

  // Get model pricing
  const db = getDb();
  const modelData = await db
    .select()
    .from(models)
    .where(eq(models.id, ctx.modelId))
    .limit(1);

  const pricePerImage = modelData[0]
    ? parseFloat(modelData[0].platformPrice || "0")
    : 0;
  const totalCredits = calculateImageCredits(imageCount, pricePerImage);

  // Check balance
  if (pk.ownerId) {
    const hasCredits = await freezeCredits(
      pk.ownerId,
      parseFloat(totalCredits),
      `Image generation: ${ctx.modelName} x${imageCount}`
    );
    if (!hasCredits) {
      return c.json(
        {
          error: {
            message: "Insufficient credits",
            type: "billing_error",
            code: "insufficient_credits",
          },
        },
        402
      );
    }
  }

  // Create async task
  const taskId = await createAsyncTask({
    taskType: "image",
    modelId: ctx.modelId,
    modelName: ctx.modelName,
    prompt: body.prompt || "",
    frozenCredits: totalCredits,
    userId: pk.ownerId,
  });

  // Return task info (user polls for result)
  return c.json({
    object: "image.generation.task",
    id: `task_${taskId}`,
    status: "pending",
    model: modelName,
    prompt: body.prompt,
    credits_used: totalCredits,
    created_at: Math.floor(Date.now() / 1000),
    result_url: null,
  });
});

// ===== /v1/tasks/:taskId =====
gateway.get("/tasks/:taskId", async (c) => {
  const taskId = c.req.param("taskId").replace("task_", "");

  const db = getDb();
  const tasks = await db
    .select()
    .from(asyncTasks)
    .where(eq(asyncTasks.id, parseInt(taskId)))
    .limit(1);

  if (tasks.length === 0) {
    return c.json(
      {
        error: {
          message: "Task not found",
          type: "invalid_request_error",
          code: "task_not_found",
        },
      },
      404
    );
  }

  const task = tasks[0];
  return c.json({
    id: `task_${task.id}`,
    object: "async_task",
    status: task.status,
    model: task.modelName,
    prompt: task.prompt,
    progress: task.progress,
    credits_used: task.creditsUsed,
    frozen_credits: task.frozenCredits,
    result_url: task.resultUrl,
    failure_reason: task.failureReason,
    created_at: Math.floor(task.createdAt.getTime() / 1000),
    completed_at: task.completedAt
      ? Math.floor(task.completedAt.getTime() / 1000)
      : null,
  });
});

// ===== /v1/credits =====
gateway.get("/credits", async (c) => {
  const pk = getPlatformKey(c);

  if (!pk.ownerId) {
    return c.json({
      object: "credit_balance",
      balance: "0",
      currency: "credits",
    });
  }

  const db = getDb();
  const credits = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, pk.ownerId))
    .limit(1);

  if (credits.length === 0) {
    return c.json({
      object: "credit_balance",
      balance: "0",
      currency: "credits",
    });
  }

  return c.json({
    object: "credit_balance",
    balance: credits[0].balance,
    total_recharged: credits[0].totalRecharged,
    total_consumed: credits[0].totalConsumed,
    currency: "credits",
  });
});

export default gateway;
