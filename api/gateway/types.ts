/**
 * Gateway Types
 * Core type definitions for the AI API proxy gateway
 */

export interface GatewayContext {
  platformKeyId: number;
  platformKeyName: string;
  ownerId: number | null;
  permissions: string[];
  rateLimit: number;
  modelId: number;
  modelName: string;
  provider: string;
  apiIdentifier: string;
  upstreamKeyId: number | null;
  upstreamKeyEncrypted: string | null;
  upstreamBaseUrl: string | null;
  platformPrice: string;
  inputCost: string;
  asyncSupport: boolean;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant" | "tool";
    content: string;
  }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description?: string;
      parameters: Record<string, any>;
    };
  }>;
  tool_choice?: string | { type: string; function?: { name: string } };
  response_format?: { type: string };
  seed?: number;
  [key: string]: any;
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
  encoding_format?: string;
  dimensions?: number;
}

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
  response_format?: string;
}

export interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface BillingResult {
  creditsUsed: string;
  promptCredits: string;
  completionCredits: string;
  balanceAfter: string | null;
}
