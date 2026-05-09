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
   IMPROVED: Models with Multi-Level Pricing
   ================================================================ */
export const models = mysqlTable("models", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  
  // 模型类型
  modelType: mysqlEnum("model_type", ["text", "image", "video", "embedding", "audio"]).notNull(),
  
  // API 标识
  apiIdentifier: varchar("api_identifier", { length: 255 }).notNull(),
  
  // 功能开关
  asyncSupport: boolean("async_support").default(false).notNull(),
  defaultTimeout: int("default_timeout").default(30).notNull(),
  defaultRetries: int("default_retries").default(3).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "beta"]).default("active").notNull(),
  capabilities: json("capabilities"),
  contextWindow: int("context_window").default(0).notNull(),
  description: text("description"),
  
  // ================================================================
  // NEW: Billing Mode - 计费模式
  // ================================================================
  billingMode: mysqlEnum("billing_mode", [
    "per_token",     // 按 Token（文本/embedding）
    "per_image",     // 按张（图片生成）
    "per_second",    // 按秒（视频/音频）
    "per_request",   // 按次（固定价格请求）
  ]).default("per_token").notNull(),
  
  // 计费单位说明（如：1M tokens, 1张, 1秒）
  billingUnit: varchar("billing_unit", { length: 50 }).default("1M").notNull(),
  
  // ================================================================
  // NEW: Supplier Cost (上游成本 - USD)
  // ================================================================
  // 上游输入成本（USD per unit）
  supplierInputCost: decimal("supplier_input_cost", { precision: 12, scale: 6 }).default("0").notNull(),
  // 上游输出成本（USD per unit，文本模型用）
  supplierOutputCost: decimal("supplier_output_cost", { precision: 12, scale: 6 }).default("0").notNull(),
  
  // ================================================================
  // NEW: Exchange Rate (汇率 USD -> RMB)
  // ================================================================
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("7.2000").notNull(),
  
  // ================================================================
  // NEW: My Cost (我的成本 - RMB)
  // 从上游采购的实际成本（含损耗、冗余等）
  // ================================================================
  myInputCost: decimal("my_input_cost", { precision: 12, scale: 6 }).default("0").notNull(),
  myOutputCost: decimal("my_output_cost", { precision: 12, scale: 6 }).default("0").notNull(),
  
  // ================================================================
  // NEW: Channel Partner Price (渠道伙伴进货价 - RMB)
  // 我给渠道伙伴的价格
  // ================================================================
  channelInputPrice: decimal("channel_input_price", { precision: 12, scale: 6 }).default("0").notNull(),
  channelOutputPrice: decimal("channel_output_price", { precision: 12, scale: 6 }).default("0").notNull(),
  
  // ================================================================
  // NEW: Retail Reference Price (零售指导价 - RMB)
  // 建议渠道伙伴给终端客户的价格
  // ================================================================
  retailInputPrice: decimal("retail_input_price", { precision: 12, scale: 6 }).default("0").notNull(),
  retailOutputPrice: decimal("retail_output_price", { precision: 12, scale: 6 }).default("0").notNull(),
  
  // 后端路由
  baseUrl: varchar("base_url", { length: 500 }),
  upstreamKeyId: bigint("upstream_key_id", { mode: "number", unsigned: true }),
  customPath: varchar("custom_path", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Model = typeof models.$inferSelect;

/* ================================================================
   NEW: Channel Partners (渠道伙伴)
   ================================================================ */
export const channelPartners = mysqlTable("channel_partners", {
  id: serial("id").primaryKey(),
  
  // 关联用户
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  
  // 渠道信息
  companyName: varchar("company_name", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  
  // 加价模式
  markupType: mysqlEnum("markup_type", [
    "fixed_amount",   // 固定金额加价
    "percentage",     // 百分比加价
    "custom",         // 自定义定价
  ]).default("percentage").notNull(),
  
  // 加价数值（百分比或固定金额）
  markupValue: decimal("markup_value", { precision: 10, scale: 4 }).default("20.0000").notNull(),
  
  // 信用额度（允许欠费的额度）
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0").notNull(),
  
  // 状态
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  
  // 备注
  remarks: text("remarks"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ChannelPartner = typeof channelPartners.$inferSelect;

/* ================================================================
   NEW: Custom Pricing Rules (渠道伙伴自定义定价)
   允许渠道伙伴为特定模型设置自定义价格
   ================================================================ */
export const customPricingRules = mysqlTable("custom_pricing_rules", {
  id: serial("id").primaryKey(),
  
  // 关联渠道伙伴
  channelPartnerId: bigint("channel_partner_id", { mode: "number", unsigned: true }).notNull(),
  
  // 关联模型
  modelId: bigint("model_id", { mode: "number", unsigned: true }).notNull(),
  
  // 自定义输入价格（覆盖默认渠道价）
  customInputPrice: decimal("custom_input_price", { precision: 12, scale: 6 }),
  
  // 自定义输出价格
  customOutputPrice: decimal("custom_output_price", { precision: 12, scale: 6 }),
  
  // 是否启用
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CustomPricingRule = typeof customPricingRules.$inferSelect;

/* ================================================================
   NEW: Usage Records (详细用量记录)
   替代简单的 call_logs，支持多种计费模式
   ================================================================ */
export const usageRecords = mysqlTable("usage_records", {
  id: serial("id").primaryKey(),
  
  // 请求信息
  requestId: varchar("request_id", { length: 255 }).notNull(),
  
  // 关联
  modelId: bigint("model_id", { mode: "number", unsigned: true }).notNull(),
  modelName: varchar("model_name", { length: 255 }),
  
  // 用户/渠道
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  platformKeyId: bigint("platform_key_id", { mode: "number", unsigned: true }),
  
  // 用量统计（根据计费模式不同）
  inputTokens: int("input_tokens").default(0),       // 输入 token 数
  outputTokens: int("output_tokens").default(0),      // 输出 token 数
  imageCount: int("image_count").default(0),          // 图片张数
  videoSeconds: decimal("video_seconds", { precision: 10, scale: 2 }).default("0"), // 视频秒数
  requestCount: int("request_count").default(1),      // 请求次数
  
  // 计费明细
  inputCost: decimal("input_cost", { precision: 12, scale: 6 }).default("0"),     // 输入成本
  outputCost: decimal("output_cost", { precision: 12, scale: 6 }).default("0"),   // 输出成本
  totalCost: decimal("total_cost", { precision: 12, scale: 6 }).default("0"),     // 总成本
  
  // 渠道加价
  channelMarkup: decimal("channel_markup", { precision: 12, scale: 6 }).default("0"), // 渠道加价金额
  finalPrice: decimal("final_price", { precision: 12, scale: 6 }).default("0"),     // 最终价格
  
  // 状态
  status: mysqlEnum("status", ["success", "error", "refunded"]).default("success").notNull(),
  
  // 时长
  duration: int("duration").default(0),
  
  // 错误信息
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UsageRecord = typeof usageRecords.$inferSelect;

/* ================================================================
   IMPROVED: Users - 添加 channel_partner 角色
   ================================================================ */
// 注意：需要修改现有 users 表的 role 枚举
// ALTER TABLE users MODIFY COLUMN role ENUM('user', 'channel_partner', 'admin') DEFAULT 'user';
