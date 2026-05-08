import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  json,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/* ================================================================
   1. Users (OAuth)
   ================================================================ */
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ================================================================
   2. Upstream Keys
   ================================================================ */
export const upstreamKeys = mysqlTable("upstream_keys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  keyEncrypted: text("key_encrypted").notNull(),
  keyPreview: varchar("key_preview", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  baseUrl: varchar("base_url", { length: 500 }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UpstreamKey = typeof upstreamKeys.$inferSelect;

/* ================================================================
   3. Platform Keys
   ================================================================ */
export const platformKeys = mysqlTable("platform_keys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  keyEncrypted: text("key_encrypted").notNull(),
  keyPreview: varchar("key_preview", { length: 50 }).notNull(),
  permissions: json("permissions"),
  rateLimit: int("rate_limit").default(1000).notNull(),
  ipWhitelist: json("ip_whitelist"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  ownerId: bigint("owner_id", { mode: "number", unsigned: true }),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlatformKey = typeof platformKeys.$inferSelect;

/* ================================================================
   4. Models
   ================================================================ */
export const models = mysqlTable("models", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  modelType: mysqlEnum("model_type", ["text", "image", "video", "embedding", "audio"]).notNull(),
  apiIdentifier: varchar("api_identifier", { length: 255 }).notNull(),
  asyncSupport: boolean("async_support").default(false).notNull(),
  defaultTimeout: int("default_timeout").default(30).notNull(),
  defaultRetries: int("default_retries").default(3).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "beta"]).default("active").notNull(),
  capabilities: json("capabilities"),
  costPer1KTokens: decimal("cost_per_1k_tokens", { precision: 10, scale: 6 }).default("0").notNull(),
  inputCost: decimal("input_cost", { precision: 10, scale: 2 }).default("0").notNull(),
  platformPrice: decimal("platform_price", { precision: 10, scale: 2 }).default("0").notNull(),
  baseUrl: varchar("base_url", { length: 500 }),
  upstreamKeyId: bigint("upstream_key_id", { mode: "number", unsigned: true }),
  customPath: varchar("custom_path", { length: 500 }),
  contextWindow: int("context_window").default(0).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Model = typeof models.$inferSelect;

/* ================================================================
   5. Route Strategies
   ================================================================ */
export const routeStrategies = mysqlTable("route_strategies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  primaryModelId: bigint("primary_model_id", { mode: "number", unsigned: true }),
  fallbackModelIds: json("fallback_model_ids"),
  timeout: int("timeout").default(30000).notNull(),
  priority: mysqlEnum("priority", ["cost", "quality", "speed"]).default("quality").notNull(),
  ownerId: bigint("owner_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RouteStrategy = typeof routeStrategies.$inferSelect;

/* ================================================================
   6. Call Logs
   ================================================================ */
export const callLogs = mysqlTable("call_logs", {
  id: serial("id").primaryKey(),
  requestId: varchar("request_id", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  modelId: bigint("model_id", { mode: "number", unsigned: true }),
  modelName: varchar("model_name", { length: 255 }),
  status: mysqlEnum("status", ["success", "error", "timeout"]).default("success").notNull(),
  duration: int("duration").default(0).notNull(),
  creditsUsed: decimal("credits_used", { precision: 12, scale: 2 }).default("0").notNull(),
  tokensUsed: int("tokens_used").default(0).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message"),
});

export type CallLog = typeof callLogs.$inferSelect;

/* ================================================================
   7. Async Tasks
   ================================================================ */
export const asyncTasks = mysqlTable("async_tasks", {
  id: serial("id").primaryKey(),
  taskType: mysqlEnum("task_type", ["image", "video"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  modelId: bigint("model_id", { mode: "number", unsigned: true }),
  modelName: varchar("model_name", { length: 255 }),
  prompt: text("prompt"),
  resultUrl: text("result_url"),
  creditsUsed: decimal("credits_used", { precision: 12, scale: 2 }).default("0").notNull(),
  frozenCredits: decimal("frozen_credits", { precision: 12, scale: 2 }).default("0").notNull(),
  progress: int("progress").default(0).notNull(),
  failureReason: text("failure_reason"),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type AsyncTask = typeof asyncTasks.$inferSelect;

/* ================================================================
   8. Credit Transactions
   ================================================================ */
export const creditTransactions = mysqlTable("credit_transactions", {
  id: serial("id").primaryKey(),
  txType: mysqlEnum("tx_type", ["recharge", "consume", "refund", "gift", "adjust"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).default("0").notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).default("0").notNull(),
  description: text("description"),
  relatedId: varchar("related_id", { length: 255 }),
  operator: varchar("operator", { length: 255 }).default("system").notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;

/* ================================================================
   9. Recharge Applications
   ================================================================ */
export const rechargeApplications = mysqlTable("recharge_applications", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  creditsRequested: decimal("credits_requested", { precision: 12, scale: 2 }).notNull(),
  method: mysqlEnum("method", ["bank_transfer", "alipay", "wechat"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  remark: text("remark"),
  bankName: varchar("bank_name", { length: 255 }),
  accountLast4: varchar("account_last4", { length: 20 }),
  voucherUrl: text("voucher_url"),
  reviewNote: text("review_note"),
  rejectReason: text("reject_reason"),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true }),
  reviewedAt: timestamp("reviewed_at"),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RechargeApplication = typeof rechargeApplications.$inferSelect;

/* ================================================================
   10. Team Members
   ================================================================ */
export const teamMembers = mysqlTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["owner", "admin", "developer", "viewer"]).default("developer").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  invitedBy: bigint("invited_by", { mode: "number", unsigned: true }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;

/* ================================================================
   11. Webhook Configs
   ================================================================ */
export const webhookConfigs = mysqlTable("webhook_configs", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 1000 }).notNull(),
  events: json("events"),
  secret: varchar("secret", { length: 500 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  ownerId: bigint("owner_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WebhookConfig = typeof webhookConfigs.$inferSelect;

/* ================================================================
   12. Admin Logs
   ================================================================ */
export const adminLogs = mysqlTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminName: varchar("admin_name", { length: 255 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  targetObject: varchar("target_object", { length: 500 }),
  beforeValue: text("before_value"),
  afterValue: text("after_value"),
  ipAddress: varchar("ip_address", { length: 50 }),
  sensitivity: mysqlEnum("sensitivity", ["normal", "sensitive", "highrisk"]).default("normal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;

/* ================================================================
   13. System Settings
   ================================================================ */
export const systemSettings = mysqlTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 255 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  label: varchar("label", { length: 255 }),
  settingType: mysqlEnum("setting_type", ["text", "number", "password", "toggle", "select"]).default("text").notNull(),
  options: json("options"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SystemSetting = typeof systemSettings.$inferSelect;

/* ================================================================
   14. CMS Configs
   ================================================================ */
export const cmsConfigs = mysqlTable("cms_configs", {
  id: serial("id").primaryKey(),
  configKey: varchar("config_key", { length: 255 }).notNull().unique(),
  configData: json("config_data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CmsConfig = typeof cmsConfigs.$inferSelect;

/* ================================================================
   15. User Credits
   ================================================================ */
export const userCredits = mysqlTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalRecharged: decimal("total_recharged", { precision: 12, scale: 2 }).default("0").notNull(),
  totalConsumed: decimal("total_consumed", { precision: 12, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserCredit = typeof userCredits.$inferSelect;
