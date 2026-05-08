/**
 * Platform Key Authentication Middleware
 * Validates API keys, checks IP whitelist and rate limits
 */

import type { MiddlewareHandler } from "hono";
import { getDb } from "../queries/connection";
import { platformKeys } from "@db/schema";
import { eq, and, gt } from "drizzle-orm";

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (val.resetAt < now) rateLimitStore.delete(key);
  }
}, 60000);

/**
 * Extract and validate Platform Key from Authorization header
 */
export const platformKeyAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json(
      {
        error: {
          message: "Missing Authorization header. Expected 'Bearer nxpk_...'",
          type: "authentication_error",
          code: "missing_auth_header",
        },
      },
      401
    );
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return c.json(
      {
        error: {
          message: "Invalid Authorization header format. Expected 'Bearer nxpk_...'",
          type: "authentication_error",
          code: "invalid_auth_format",
        },
      },
      401
    );
  }

  const apiKey = match[1];

  // Query database for valid key
  const db = getDb();
  const keys = await db
    .select()
    .from(platformKeys)
    .where(and(eq(platformKeys.status, "active")))
    .limit(100);

  // Find matching key (compare key preview or full encrypted key)
  const foundKey = keys.find((k) => {
    // Match by key preview prefix
    if (apiKey.startsWith("nxpk_")) {
      const preview = k.keyPreview.replace(/\./g, "");
      return apiKey === preview || apiKey.includes(k.keyPreview.replace(/^nxpk_/, ""));
    }
    return false;
  });

  if (!foundKey) {
    return c.json(
      {
        error: {
          message: "Invalid API key",
          type: "authentication_error",
          code: "invalid_api_key",
        },
      },
      401
    );
  }

  // Check IP whitelist
  if (foundKey.ipWhitelist) {
    const whitelist = foundKey.ipWhitelist as string[];
    if (whitelist.length > 0) {
      const clientIp =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown";
      const normalizedIp = clientIp.split(",")[0].trim();
      const allowed = whitelist.some((allowedIp) => {
        if (allowedIp.includes("/")) {
          // CIDR range check (simplified)
          return normalizedIp.startsWith(allowedIp.split("/")[0].replace(/\.\d+$/, ""));
        }
        return normalizedIp === allowedIp;
      });
      if (!allowed) {
        return c.json(
          {
            error: {
              message: `IP ${normalizedIp} not in whitelist`,
              type: "authentication_error",
              code: "ip_not_allowed",
            },
          },
          403
        );
      }
    }
  }

  // Check rate limit
  const rateKey = `pk_${foundKey.id}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const current = rateLimitStore.get(rateKey);

  if (current && current.resetAt > now) {
    if (current.count >= foundKey.rateLimit) {
      return c.json(
        {
          error: {
            message: `Rate limit exceeded. Limit: ${foundKey.rateLimit} requests/minute`,
            type: "rate_limit_error",
            code: "rate_limit_exceeded",
          },
        },
        429
      );
    }
    current.count++;
  } else {
    rateLimitStore.set(rateKey, { count: 1, resetAt: now + windowMs });
  }

  // Store validated key info in context
  c.set("platformKey", {
    id: foundKey.id,
    name: foundKey.name,
    ownerId: foundKey.ownerId,
    permissions: (foundKey.permissions as string[]) || [],
    rateLimit: foundKey.rateLimit,
  });

  await next();
};

/**
 * Get platform key info from context
 */
export function getPlatformKey(c: any) {
  return c.get("platformKey") as {
    id: number;
    name: string;
    ownerId: number | null;
    permissions: string[];
    rateLimit: number;
  };
}

/**
 * Check if platform key has a specific permission
 */
export function hasPermission(c: any, permission: string): boolean {
  const key = getPlatformKey(c);
  return key.permissions.includes(permission) || key.permissions.includes("*");
}
