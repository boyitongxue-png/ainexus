/**
 * Request Proxy
 * Forwards requests to upstream providers and handles responses
 */

import { OpenAI } from "openai";
import { getDb } from "../queries/connection";
import { upstreamKeys, models } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  calculateCredits,
  freezeCredits,
  chargeCredits,
  recordCallLog,
  estimateTokens,
} from "./billing";
import type { GatewayContext, ChatCompletionRequest, UsageInfo } from "./types";

/**
 * Create OpenAI client for upstream provider
 */
async function createUpstreamClient(upstreamKeyId: number): Promise<OpenAI> {
  const db = getDb();
  const keys = await db
    .select()
    .from(upstreamKeys)
    .where(eq(upstreamKeys.id, upstreamKeyId))
    .limit(1);

  if (keys.length === 0) {
    throw new Error("Upstream key not found");
  }

  const key = keys[0];
  // Use key preview for now - in production decrypt keyEncrypted
  const apiKey = key.keyEncrypted.startsWith("enc_")
    ? key.keyEncrypted.replace("enc_", "sk-demo-") // placeholder
    : key.keyEncrypted;

  return new OpenAI({
    apiKey,
    baseURL: key.baseUrl || undefined,
  });
}

/**
 * Get model pricing for billing
 */
async function getModelPrice(modelId: number): Promise<{
  inputCost: number;
  outputCost: number;
}> {
  const db = getDb();
  const result = await db
    .select()
    .from(models)
    .where(eq(models.id, modelId))
    .limit(1);

  if (result.length === 0) {
    return { inputCost: 0, outputCost: 0 };
  }

  const m = result[0];
  // Use new multi-level pricing fields (per 1M tokens)
  // Fall back to legacy fields for backward compatibility
  const myInputCost = parseFloat(m.myInputCost || "0");
  const myOutputCost = parseFloat(m.myOutputCost || "0");
  const legacyInputCost = parseFloat(m.inputCost || "0");
  const legacyOutputCost = parseFloat(m.platformPrice || "0");

  // If new pricing fields are set (>0), use them (per 1M); otherwise use legacy (per 1K, need to scale)
  if (myInputCost > 0) {
    return {
      inputCost: myInputCost,
      outputCost: myOutputCost > 0 ? myOutputCost : legacyOutputCost * 1000,
    };
  }
  // Legacy: per 1K prices, scale to per 1M
  return {
    inputCost: legacyInputCost * 1000,
    outputCost: legacyOutputCost * 1000,
  };
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Build OpenAI SDK params from our generic request type
 */
function buildOpenAIParams(request: ChatCompletionRequest, apiIdentifier: string): any {
  const params: any = {
    model: apiIdentifier,
    messages: request.messages as any,
    stream: request.stream ?? false,
  };

  if (request.temperature !== undefined) params.temperature = request.temperature;
  if (request.max_tokens !== undefined) params.max_tokens = request.max_tokens;
  if (request.top_p !== undefined) params.top_p = request.top_p;
  if (request.frequency_penalty !== undefined) params.frequency_penalty = request.frequency_penalty;
  if (request.presence_penalty !== undefined) params.presence_penalty = request.presence_penalty;
  if (request.seed !== undefined) params.seed = request.seed;
  if (request.tools) params.tools = request.tools as any;
  if (request.tool_choice) params.tool_choice = request.tool_choice as any;
  if (request.response_format) params.response_format = request.response_format as any;

  return params;
}

/**
 * Proxy chat completion request (non-streaming)
 */
export async function proxyChatCompletion(
  ctx: GatewayContext,
  request: ChatCompletionRequest,
  userId: number | null
): Promise<Response> {
  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    // Get model pricing
    const pricing = await getModelPrice(ctx.modelId);

    // Estimate tokens and check/pre-deduct balance
    const estimatedTokens = estimateTokens(request.messages);
    const estimatedInputCredits = (estimatedTokens / 1000000) * pricing.inputCost;
    const estimatedTotalCredits = estimatedInputCredits * 3; // rough estimate for output

    if (userId) {
      const hasCredits = await freezeCredits(
        userId,
        estimatedTotalCredits,
        `Pre-auth: ${ctx.modelName}`
      );
      if (!hasCredits) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Insufficient credits. Please recharge.",
              type: "billing_error",
              code: "insufficient_credits",
            },
          }),
          { status: 402, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Create upstream client
    const client = await createUpstreamClient(ctx.upstreamKeyId!);

    // Call upstream API
    const params = buildOpenAIParams(request, ctx.apiIdentifier);
    params.stream = false;
    const completion = await client.chat.completions.create(params);

    const duration = Date.now() - startTime;

    // Extract usage and calculate actual credits
    const usage: UsageInfo = {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    };

    const billing = calculateCredits(usage, pricing.inputCost, pricing.outputCost);
    const actualCredits = parseFloat(billing.creditsUsed);

    // Adjust billing (refund if over-estimated)
    if (userId) {
      await chargeCredits(
        userId,
        actualCredits,
        estimatedTotalCredits,
        `${ctx.modelName} - ${usage.totalTokens} tokens`,
        requestId
      );
    }

    // Record call log
    await recordCallLog({
      requestId,
      type: "chat.completion",
      modelId: ctx.modelId,
      modelName: ctx.modelName,
      status: "success",
      duration,
      creditsUsed: billing.creditsUsed,
      tokensUsed: usage.totalTokens,
      userId,
    });

    // Return response in OpenAI-compatible format
    const responseBody = {
      id: completion.id,
      object: "chat.completion",
      created: completion.created,
      model: request.model, // Return user's requested model name
      choices: completion.choices.map((c: any) => ({
        index: c.index,
        message: {
          role: c.message.role,
          content: c.message.content || "",
          tool_calls: c.message.tool_calls,
        },
        finish_reason: c.finish_reason,
      })),
      usage: {
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.totalTokens,
      },
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Record error log
    await recordCallLog({
      requestId,
      type: "chat.completion",
      modelId: ctx.modelId,
      modelName: ctx.modelName,
      status: "error",
      duration,
      creditsUsed: "0",
      tokensUsed: 0,
      userId,
      errorCode: error.code || error.status?.toString(),
      errorMessage: error.message,
    });

    // Return error in OpenAI format
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || "Upstream error",
          type: error.type || "api_error",
          code: error.code || "upstream_error",
        },
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Proxy chat completion request (streaming with SSE)
 */
export async function proxyChatCompletionStream(
  ctx: GatewayContext,
  request: ChatCompletionRequest,
  userId: number | null
): Promise<Response> {
  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    // Get model pricing
    const pricing = await getModelPrice(ctx.modelId);

    // Pre-deduct estimated credits
    const estimatedTokens = estimateTokens(request.messages);
    const estimatedInputCredits = (estimatedTokens / 1000000) * pricing.inputCost;
    const estimatedTotalCredits = estimatedInputCredits * 3;

    if (userId) {
      const hasCredits = await freezeCredits(
        userId,
        estimatedTotalCredits,
        `Pre-auth (stream): ${ctx.modelName}`
      );
      if (!hasCredits) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Insufficient credits. Please recharge.",
              type: "billing_error",
              code: "insufficient_credits",
            },
          }),
          { status: 402, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Create upstream client
    const client = await createUpstreamClient(ctx.upstreamKeyId!);

    // Start streaming
    const params = buildOpenAIParams(request, ctx.apiIdentifier);
    params.stream = true;
    const streamResponse = await client.chat.completions.create(params);
    // Cast to stream since we set stream: true
    const stream = streamResponse as unknown as AsyncIterable<any>;

    // Track accumulated data
    let completionTokens = 0;
    let totalContent = "";
    const streamId = `chatcmpl-${Date.now()}`;
    let chunkIndex = 0;

    // Create ReadableStream for SSE
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial role chunk
          const initialChunk = {
            id: streamId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: request.model,
            choices: [
              {
                index: 0,
                delta: { role: "assistant" },
                finish_reason: null,
              },
            ],
          };
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify(initialChunk)}\n\n`
            )
          );

          // Process stream chunks
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            const content = delta?.content || "";
            const toolCalls = delta?.tool_calls;

            if (content) {
              totalContent += content;
              completionTokens++;
            }

            // Build and send SSE chunk
            const sseChunk: any = {
              id: streamId,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: request.model,
              choices: [
                {
                  index: chunkIndex++,
                  delta: {},
                  finish_reason: chunk.choices[0]?.finish_reason || null,
                },
              ],
            };

            if (content) {
              sseChunk.choices[0].delta.content = content;
            }
            if (toolCalls) {
              sseChunk.choices[0].delta.tool_calls = toolCalls;
            }

            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify(sseChunk)}\n\n`
              )
            );
          }

          // Send final chunk with done marker
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();

          // Post-stream billing
          const duration = Date.now() - startTime;

          // Estimate prompt tokens from messages
          const estPromptTokens = estimateTokens(request.messages);

          // More accurate completion token estimation
          const finalCompletionTokens = completionTokens > 0
            ? Math.ceil(completionTokens * 3.5) // SSE chunks ~ 1/3.5 of actual tokens
            : Math.ceil(totalContent.length / 3.5);

          const totalTok = estPromptTokens + finalCompletionTokens;

          const billing = calculateCredits(
            {
              promptTokens: estPromptTokens,
              completionTokens: finalCompletionTokens,
              totalTokens: totalTok,
            },
            pricing.inputCost,
            pricing.outputCost
          );

          // Adjust billing
          if (userId) {
            await chargeCredits(
              userId,
              parseFloat(billing.creditsUsed),
              estimatedTotalCredits,
              `${ctx.modelName} (stream) - ${totalTok} tokens`,
              requestId
            );
          }

          // Record call log
          await recordCallLog({
            requestId,
            type: "chat.completion.stream",
            modelId: ctx.modelId,
            modelName: ctx.modelName,
            status: "success",
            duration,
            creditsUsed: billing.creditsUsed,
            tokensUsed: totalTok,
            userId,
          });
        } catch (streamError: any) {
          controller.error(streamError);

          // Record error
          const duration = Date.now() - startTime;
          await recordCallLog({
            requestId,
            type: "chat.completion.stream",
            modelId: ctx.modelId,
            modelName: ctx.modelName,
            status: "error",
            duration,
            creditsUsed: "0",
            tokensUsed: 0,
            userId,
            errorMessage: streamError.message,
          });
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    await recordCallLog({
      requestId,
      type: "chat.completion.stream",
      modelId: ctx.modelId,
      modelName: ctx.modelName,
      status: "error",
      duration,
      creditsUsed: "0",
      tokensUsed: 0,
      userId,
      errorCode: error.code || error.status?.toString(),
      errorMessage: error.message,
    });

    return new Response(
      JSON.stringify({
        error: {
          message: error.message || "Stream error",
          type: error.type || "api_error",
          code: error.code || "stream_error",
        },
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Proxy embeddings request
 */
export async function proxyEmbeddings(
  ctx: GatewayContext,
  body: { input: string | string[]; model: string },
  userId: number | null
): Promise<Response> {
  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    const pricing = await getModelPrice(ctx.modelId);
    const client = await createUpstreamClient(ctx.upstreamKeyId!);

    const embedding = await client.embeddings.create({
      model: ctx.apiIdentifier,
      input: body.input as any,
    });

    const duration = Date.now() - startTime;
    const tokensUsed = embedding.usage?.total_tokens || 0;
    const creditsUsed = (tokensUsed / 1000000) * pricing.inputCost;

    if (userId) {
      await freezeCredits(userId, creditsUsed, `Embedding: ${ctx.modelName}`);
    }

    await recordCallLog({
      requestId,
      type: "embedding",
      modelId: ctx.modelId,
      modelName: ctx.modelName,
      status: "success",
      duration,
      creditsUsed: creditsUsed.toFixed(4),
      tokensUsed,
      userId,
    });

    return new Response(JSON.stringify(embedding), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    await recordCallLog({
      requestId,
      type: "embedding",
      modelId: ctx.modelId,
      modelName: ctx.modelName,
      status: "error",
      duration,
      creditsUsed: "0",
      tokensUsed: 0,
      userId,
      errorMessage: error.message,
    });

    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          type: "api_error",
          code: error.code,
        },
      }),
      { status: error.status || 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
