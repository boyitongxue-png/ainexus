import { sql } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import {
  upstreamKeys,
  platformKeys,
  models,
  routeStrategies,
  callLogs,
  asyncTasks,
  creditTransactions,
  rechargeApplications,
  teamMembers,
  webhookConfigs,
  adminLogs,
  systemSettings,
  cmsConfigs,
  userCredits,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed System Settings - insert one by one to handle duplicates
  const settings = [
    { settingKey: "default_rate_limit", settingValue: "1000", label: "默认 API 速率限制（请求/分钟）", settingType: "number" as const, description: "默认 API 速率限制（请求/分钟）" },
    { settingKey: "max_request_timeout", settingValue: "60000", label: "最大请求超时时间（毫秒）", settingType: "number" as const, description: "最大请求超时时间（毫秒）" },
    { settingKey: "credit_exchange_rate", settingValue: "10", label: "积分兑换比例（1元 = N积分）", settingType: "number" as const, description: "积分兑换比例" },
    { settingKey: "free_trial_credits", settingValue: "1000", label: "新用户免费积分额度", settingType: "number" as const, description: "新用户免费积分额度" },
    { settingKey: "task_retention_days", settingValue: "30", label: "异步任务数据保留天数", settingType: "number" as const, description: "异步任务数据保留天数" },
    { settingKey: "platform_name", settingValue: "AI Nexus", label: "平台名称", settingType: "text" as const, description: "网站显示名称" },
    { settingKey: "maintenance_mode", settingValue: "false", label: "维护模式", settingType: "toggle" as const, description: "是否开启维护模式" },
  ];

  for (const s of settings) {
    try {
      await db.insert(systemSettings).values(s);
    } catch {
      // Skip duplicates
    }
  }
  console.log("System settings seeded");

  // Seed Upstream Keys
  const upstreamKeyList = [
    { name: "OpenAI Production", provider: "OpenAI", keyEncrypted: "enc_sk_openai_1", keyPreview: "sk-...x7a2", status: "active" as const, baseUrl: "https://api.openai.com/v1" },
    { name: "Anthropic Claude", provider: "Anthropic", keyEncrypted: "enc_sk_anthropic_1", keyPreview: "sk-ant-...k3m1", status: "active" as const, baseUrl: "https://api.anthropic.com/v1" },
    { name: "Stability AI", provider: "Stability AI", keyEncrypted: "enc_sk_stability_1", keyPreview: "sk-...b4c9", status: "active" as const, baseUrl: "https://api.stability.ai/v1" },
    { name: "Runway API", provider: "Runway", keyEncrypted: "enc_sk_runway_1", keyPreview: "rk-...p2n8", status: "inactive" as const, baseUrl: "https://api.runwayml.com/v1" },
  ];

  for (const k of upstreamKeyList) {
    try {
      await db.insert(upstreamKeys).values(k);
    } catch {
      // Skip duplicates
    }
  }
  console.log("Upstream keys seeded");

  // Seed Models
  const modelList = [
    { name: "GPT-4o", provider: "OpenAI", modelType: "text" as const, apiIdentifier: "gpt-4o", asyncSupport: false, defaultTimeout: 30, defaultRetries: 3, status: "active" as const, costPer1MTokens: "5", inputCost: "5", platformPrice: "15", contextWindow: 128000, description: "OpenAI 最新旗舰模型" },
    { name: "GPT-4", provider: "OpenAI", modelType: "text" as const, apiIdentifier: "gpt-4", asyncSupport: false, defaultTimeout: 30, defaultRetries: 3, status: "active" as const, costPer1MTokens: "30", inputCost: "10", platformPrice: "30", contextWindow: 128000, description: "高性能文本模型" },
    { name: "GPT-3.5 Turbo", provider: "OpenAI", modelType: "text" as const, apiIdentifier: "gpt-3.5-turbo", asyncSupport: false, defaultTimeout: 20, defaultRetries: 2, status: "active" as const, costPer1MTokens: "0.5", inputCost: "0.5", platformPrice: "1.5", contextWindow: 16000, description: "高性价比文本模型" },
    { name: "Claude 3.5 Sonnet", provider: "Anthropic", modelType: "text" as const, apiIdentifier: "claude-3-5-sonnet", asyncSupport: false, defaultTimeout: 45, defaultRetries: 3, status: "active" as const, costPer1MTokens: "3", inputCost: "3", platformPrice: "9", contextWindow: 200000, description: "Anthropic 先进模型" },
    { name: "Claude 3 Opus", provider: "Anthropic", modelType: "text" as const, apiIdentifier: "claude-3-opus", asyncSupport: false, defaultTimeout: 60, defaultRetries: 3, status: "active" as const, costPer1MTokens: "15", inputCost: "15", platformPrice: "45", contextWindow: 200000, description: "Anthropic 顶级模型" },
    { name: "DALL-E 3", provider: "OpenAI", modelType: "image" as const, apiIdentifier: "dall-e-3", asyncSupport: true, defaultTimeout: 60, defaultRetries: 2, status: "active" as const, costPer1MTokens: "40", inputCost: "10", platformPrice: "40", contextWindow: 0, description: "高质量图片生成" },
    { name: "Stable Diffusion 3", provider: "Stability AI", modelType: "image" as const, apiIdentifier: "sd3", asyncSupport: true, defaultTimeout: 120, defaultRetries: 2, status: "active" as const, costPer1MTokens: "25", inputCost: "6", platformPrice: "25", contextWindow: 0, description: "开源图片生成模型" },
    { name: "Runway Gen-3", provider: "Runway", modelType: "video" as const, apiIdentifier: "runway-gen3", asyncSupport: true, defaultTimeout: 300, defaultRetries: 2, status: "beta" as const, costPer1MTokens: "500", inputCost: "150", platformPrice: "500", contextWindow: 0, description: "高质量视频生成" },
    { name: "Pika 1.5", provider: "Pika", modelType: "video" as const, apiIdentifier: "pika-1.5", asyncSupport: true, defaultTimeout: 300, defaultRetries: 2, status: "beta" as const, costPer1MTokens: "450", inputCost: "120", platformPrice: "450", contextWindow: 0, description: "创意视频生成" },
    { name: "Text Embedding 3", provider: "OpenAI", modelType: "embedding" as const, apiIdentifier: "text-embedding-3", asyncSupport: false, defaultTimeout: 15, defaultRetries: 2, status: "active" as const, costPer1MTokens: "0.1", inputCost: "0.05", platformPrice: "0.1", contextWindow: 8000, description: "文本向量化模型" },
    { name: "Whisper v3", provider: "OpenAI", modelType: "audio" as const, apiIdentifier: "whisper-1", asyncSupport: true, defaultTimeout: 120, defaultRetries: 2, status: "active" as const, costPer1MTokens: "6", inputCost: "2", platformPrice: "6", contextWindow: 0, description: "语音转录模型" },
  ];

  for (const m of modelList) {
    try {
      await db.insert(models).values(m);
    } catch {
      // Skip duplicates
    }
  }
  console.log("Models seeded");

  // Seed Team Members
  const memberList = [
    { name: "张明远", email: "zhangmy@example.com", role: "owner" as const, status: "active" as const },
    { name: "李思涵", email: "lish@example.com", role: "admin" as const, status: "active" as const },
    { name: "王浩宇", email: "wanghy@example.com", role: "developer" as const, status: "active" as const },
    { name: "陈晓晓", email: "chenxx@example.com", role: "viewer" as const, status: "inactive" as const },
  ];

  for (const m of memberList) {
    try {
      await db.insert(teamMembers).values(m);
    } catch {
      // Skip duplicates
    }
  }
  console.log("Team members seeded");

  // Seed Webhook Configs
  const webhookList = [
    { url: "https://api.example.com/webhooks/ainexus", events: ["task.completed", "task.failed"], secret: "whsec_...x9a2", status: "active" as const },
    { url: "https://hooks.slack.com/services/xxx", events: ["task.completed"], secret: "whsec_...b3c5", status: "active" as const },
  ];

  for (const w of webhookList) {
    try {
      await db.insert(webhookConfigs).values(w);
    } catch {
      // Skip duplicates
    }
  }
  console.log("Webhook configs seeded");

  // Seed Admin Logs
  const modules = ["积分调整", "充值审核", "模型配置", "客户管理", "系统设置", "价格规则"];
  const actions = ["credit_adjust", "recharge_approve", "model_update", "customer_suspend", "setting_update", "pricing_update"];
  const sensitivities: ("normal" | "sensitive" | "highrisk")[] = ["normal", "sensitive", "highrisk"];
  const admins = ["admin1", "admin2", "admin3"];

  for (let i = 0; i < 12; i++) {
    await db.insert(adminLogs).values({
      adminName: admins[i % 3],
      module: modules[i % 6],
      actionType: actions[i % 6],
      targetObject: `Target #${i + 1}`,
      beforeValue: JSON.stringify({ status: "before" }),
      afterValue: JSON.stringify({ status: "after" }),
      ipAddress: `192.168.1.${100 + i}`,
      sensitivity: sensitivities[i % 3],
    });
  }
  console.log("Admin logs seeded");

  // Seed CMS Configs
  const siteData = {
    configKey: "site",
    configData: {
      name: "AI Nexus",
      logo: "/logo.svg",
      favicon: "/favicon.ico",
      tagline: "一站式大模型聚合平台",
      footerText: " 2024 AI Nexus. All rights reserved.",
      contactEmail: "support@ainexus.com",
      contactPhone: "400-888-0000",
      icp: "",
    },
  };

  const homeData = {
    configKey: "home",
    configData: {
      hero: {
        title: "聚合全球顶尖 AI 模型，\n一个接口，无限可能",
        subtitle: "AI Nexus 统一接入 GPT-4o、Claude、DALL-E、Runway 等 50+ 大模型。一套 API Key，一个接口规范，轻松调用文本、图像、视频、语音等全部 AI 能力。",
        ctaPrimary: "免费开始",
        ctaSecondary: "查看价格",
        stats: [
          { label: "可用模型", value: "50", suffix: "+" },
          { label: "日均调用量", value: "2", suffix: "亿+" },
          { label: "服务客户", value: "1000", suffix: "+" },
          { label: "SLA 可用性", value: "99.9", suffix: "%" },
        ],
      },
      features: [
        { title: "统一 API 接口", description: "OpenAI-compatible 接口，一套代码切换任意模型", icon: "Zap" },
        { title: "智能路由", description: "自动选择最优模型和供应商，失败自动降级", icon: "Route" },
        { title: "完整异步支持", description: "图片、视频生成自动转异步，实时查询进度", icon: "Clock" },
        { title: "企业级安全", description: "IP 白名单、用量配额、密钥分级管理", icon: "Shield" },
        { title: "透明计费", description: "按实际调用量计费，失败自动退款", icon: "Coins" },
        { title: "实时观测", description: "QPS、延迟、成功率实时大盘", icon: "Activity" },
      ],
      showPartners: true,
      showSteps: true,
      showPreview: true,
      showTestimonials: true,
      showFaq: true,
    },
  };

  try {
    await db.insert(cmsConfigs).values(siteData);
  } catch {
    // Skip duplicates
  }
  try {
    await db.insert(cmsConfigs).values(homeData);
  } catch {
    // Skip duplicates
  }
  console.log("CMS configs seeded");

  console.log("Seeding complete!");
}

seed().catch(console.error);
