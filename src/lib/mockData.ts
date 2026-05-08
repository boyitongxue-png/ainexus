export interface UpstreamKey {
  id: string;
  name: string;
  provider: string;
  keyPreview: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface PlatformKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: string[];
  rateLimit: number;
  ipWhitelist: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'beta';
  costPer1KTokens: number;
  /** 平台积分定价 (用户端看到的价格) */
  platformPrice?: number;
  description: string;
}

export interface RouteStrategy {
  id: string;
  name: string;
  primaryModel: string;
  fallbackModels: string[];
  timeout: number;
  priority: 'cost' | 'quality' | 'speed';
  createdAt: string;
}

export interface CallLog {
  id: string;
  requestId: string;
  timestamp: string;
  type: string;
  model: string;
  status: 'success' | 'error' | 'timeout';
  duration: number;
  creditsUsed: number;
  tokensUsed: number;
}

export interface AsyncTask {
  id: string;
  type: 'image' | 'video';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model: string;
  prompt: string;
  resultUrl?: string;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
}

export interface CreditTransaction {
  id: string;
  type: 'recharge' | 'consume' | 'refund' | 'freeze';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface RechargeApplication {
  id: string;
  amount: number;
  method: 'bank_transfer' | 'alipay' | 'wechat';
  status: 'pending' | 'approved' | 'rejected';
  remark: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive';
  joinedAt: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SecuritySetting {
  mfaEnabled: boolean;
  ipRestriction: boolean;
  allowedIps: string[];
  sessionTimeout: number;
  passwordPolicy: 'standard' | 'strict';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'suspended';
  credits: number;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  customerId: string;
  status: 'active' | 'inactive';
  modelsEnabled: string[];
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  ip: string;
  createdAt: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalApiCalls: number;
  activeModels: number;
  totalCredits: number;
  membersCount: number;
  recentCalls: CallLog[];
  creditTrend: { date: string; credits: number }[];
}

// Mock Data
export const upstreamKeys: UpstreamKey[] = [
  { id: 'uk_1', name: 'OpenAI Production', provider: 'OpenAI', keyPreview: 'sk-...x7a2', status: 'active', createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'uk_2', name: 'Anthropic Claude', provider: 'Anthropic', keyPreview: 'sk-ant-...k3m1', status: 'active', createdAt: '2024-02-20', updatedAt: '2024-11-28' },
  { id: 'uk_3', name: 'Stability AI', provider: 'Stability AI', keyPreview: 'sk-...b4c9', status: 'active', createdAt: '2024-03-10', updatedAt: '2024-12-05' },
  { id: 'uk_4', name: 'Runway API', provider: 'Runway', keyPreview: 'rk-...p2n8', status: 'inactive', createdAt: '2024-05-01', updatedAt: '2024-10-15' },
];

export const platformKeys: PlatformKey[] = [
  { id: 'pk_1', name: 'Production Key', keyPreview: 'nxpk_...a3f7', permissions: ['chat', 'image', 'embedding'], rateLimit: 1000, ipWhitelist: ['192.168.1.0/24'], status: 'active', createdAt: '2024-06-01', lastUsedAt: '2024-12-10T08:30:00Z' },
  { id: 'pk_2', name: 'Development Key', keyPreview: 'nxpk_...b8e2', permissions: ['chat', 'image'], rateLimit: 100, ipWhitelist: [], status: 'active', createdAt: '2024-07-15', lastUsedAt: '2024-12-09T16:45:00Z' },
  { id: 'pk_3', name: 'Testing Key', keyPreview: 'nxpk_...c1d4', permissions: ['chat'], rateLimit: 50, ipWhitelist: ['10.0.0.0/8'], status: 'inactive', createdAt: '2024-08-01', lastUsedAt: null },
];

export const modelCatalog: ModelEntry[] = [
  { id: 'm1', name: 'GPT-4o', provider: 'OpenAI', type: 'text', capabilities: ['聊天', '函数调用', '视觉'], status: 'active', costPer1KTokens: 0.005, platformPrice: 15, description: 'OpenAI 最新旗舰模型' },
  { id: 'm2', name: 'GPT-4', provider: 'OpenAI', type: 'text', capabilities: ['聊天', '函数调用'], status: 'active', costPer1KTokens: 0.03, platformPrice: 30, description: '高性能文本模型' },
  { id: 'm3', name: 'GPT-3.5 Turbo', provider: 'OpenAI', type: 'text', capabilities: ['聊天', '函数调用'], status: 'active', costPer1KTokens: 0.0005, platformPrice: 1.5, description: '高性价比文本模型' },
  { id: 'm4', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'text', capabilities: ['聊天', '函数调用', '长上下文'], status: 'active', costPer1KTokens: 0.003, platformPrice: 9, description: 'Anthropic 先进模型' },
  { id: 'm5', name: 'Claude 3 Opus', provider: 'Anthropic', type: 'text', capabilities: ['聊天', '函数调用', '长上下文'], status: 'active', costPer1KTokens: 0.015, platformPrice: 45, description: 'Anthropic 顶级模型' },
  { id: 'm6', name: 'DALL-E 3', provider: 'OpenAI', type: 'image', capabilities: ['图片生成'], status: 'active', costPer1KTokens: 0.04, platformPrice: 40, description: '高质量图片生成' },
  { id: 'm7', name: 'Stable Diffusion 3', provider: 'Stability AI', type: 'image', capabilities: ['图片生成'], status: 'active', costPer1KTokens: 0.025, platformPrice: 25, description: '开源图片生成模型' },
  { id: 'm8', name: 'Runway Gen-3', provider: 'Runway', type: 'video', capabilities: ['视频生成'], status: 'beta', costPer1KTokens: 0.5, platformPrice: 500, description: '高质量视频生成' },
  { id: 'm9', name: 'Pika 1.5', provider: 'Pika', type: 'video', capabilities: ['视频生成'], status: 'beta', costPer1KTokens: 0.45, platformPrice: 450, description: '创意视频生成' },
  { id: 'm10', name: 'Text Embedding 3', provider: 'OpenAI', type: 'embedding', capabilities: ['Embedding'], status: 'active', costPer1KTokens: 0.0001, platformPrice: 0.1, description: '文本向量化' },
  { id: 'm11', name: 'Whisper v3', provider: 'OpenAI', type: 'audio', capabilities: ['语音转文字'], status: 'active', costPer1KTokens: 0.006, platformPrice: 6, description: '语音转录模型' },
];

export const routeStrategies: RouteStrategy[] = [
  { id: 'rs_1', name: '默认文本路由', primaryModel: 'GPT-4o', fallbackModels: ['Claude 3.5 Sonnet', 'GPT-4'], timeout: 30000, priority: 'quality', createdAt: '2024-06-01' },
  { id: 'rs_2', name: '成本优先路由', primaryModel: 'GPT-3.5 Turbo', fallbackModels: ['Claude 3.5 Sonnet'], timeout: 20000, priority: 'cost', createdAt: '2024-07-15' },
  { id: 'rs_3', name: '图片生成路由', primaryModel: 'DALL-E 3', fallbackModels: ['Stable Diffusion 3'], timeout: 60000, priority: 'quality', createdAt: '2024-08-01' },
];

export const callLogs: CallLog[] = Array.from({ length: 50 }, (_, i) => ({
  id: `log_${i + 1}`,
  requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  type: ['chat.completion', 'image.generation', 'embedding', 'audio.transcription'][Math.floor(Math.random() * 4)],
  model: ['GPT-4o', 'GPT-3.5 Turbo', 'Claude 3.5 Sonnet', 'DALL-E 3', 'Text Embedding 3'][Math.floor(Math.random() * 5)],
  status: ['success', 'success', 'success', 'error', 'timeout'][Math.floor(Math.random() * 5)] as 'success' | 'error' | 'timeout',
  duration: Math.floor(Math.random() * 5000) + 100,
  creditsUsed: Math.floor(Math.random() * 1000) + 1,
  tokensUsed: Math.floor(Math.random() * 10000) + 50,
}));

export const asyncTasks: AsyncTask[] = [
  { id: 'task_1', type: 'image', status: 'completed', model: 'DALL-E 3', prompt: 'A futuristic cityscape at night with neon lights', resultUrl: '#', creditsUsed: 40, createdAt: '2024-12-10T08:00:00Z', completedAt: '2024-12-10T08:00:15Z' },
  { id: 'task_2', type: 'image', status: 'processing', model: 'Stable Diffusion 3', prompt: 'Abstract art with geometric shapes', creditsUsed: 25, createdAt: '2024-12-10T08:05:00Z' },
  { id: 'task_3', type: 'video', status: 'pending', model: 'Runway Gen-3', prompt: 'Slow motion waterfall in nature', creditsUsed: 500, createdAt: '2024-12-10T08:10:00Z' },
  { id: 'task_4', type: 'image', status: 'failed', model: 'DALL-E 3', prompt: 'Portrait of a cyberpunk character', creditsUsed: 0, createdAt: '2024-12-10T07:55:00Z', completedAt: '2024-12-10T07:55:30Z' },
  { id: 'task_5', type: 'video', status: 'completed', model: 'Pika 1.5', prompt: 'Animated logo reveal', resultUrl: '#', creditsUsed: 450, createdAt: '2024-12-10T07:30:00Z', completedAt: '2024-12-10T07:35:00Z' },
];

export const creditTransactions: CreditTransaction[] = [
  { id: 'tx_1', type: 'recharge', amount: 10000, balance: 15000, description: '支付宝充值', createdAt: '2024-12-01T10:00:00Z' },
  { id: 'tx_2', type: 'consume', amount: -500, balance: 14500, description: 'API 调用消费', createdAt: '2024-12-02T14:30:00Z' },
  { id: 'tx_3', type: 'consume', amount: -1200, balance: 13300, description: '图片生成消费', createdAt: '2024-12-03T09:15:00Z' },
  { id: 'tx_4', type: 'refund', amount: 200, balance: 13500, description: '调用异常退款', createdAt: '2024-12-04T16:00:00Z' },
  { id: 'tx_5', type: 'consume', amount: -800, balance: 12700, description: 'API 调用消费', createdAt: '2024-12-05T11:20:00Z' },
];

export const rechargeApplications: RechargeApplication[] = [
  { id: 'ra_1', amount: 50000, method: 'bank_transfer', status: 'approved', remark: '对公转账 - 云启科技', createdAt: '2024-11-28', reviewedAt: '2024-11-29' },
  { id: 'ra_2', amount: 20000, method: 'alipay', status: 'pending', remark: '支付宝转账', createdAt: '2024-12-09' },
  { id: 'ra_3', amount: 100000, method: 'bank_transfer', status: 'pending', remark: '对公转账 - 智创未来', createdAt: '2024-12-10' },
  { id: 'ra_4', amount: 5000, method: 'wechat', status: 'rejected', remark: '微信支付 - 金额异常', createdAt: '2024-12-08', reviewedAt: '2024-12-08' },
];

export const teamMembers: TeamMember[] = [
  { id: 'tm_1', name: '张明远', email: 'zhangmy@example.com', role: 'owner', status: 'active', joinedAt: '2024-01-15' },
  { id: 'tm_2', name: '李思涵', email: 'lish@example.com', role: 'admin', status: 'active', joinedAt: '2024-03-01' },
  { id: 'tm_3', name: '王浩宇', email: 'wanghy@example.com', role: 'developer', status: 'active', joinedAt: '2024-06-20' },
  { id: 'tm_4', name: '陈晓晓', email: 'chenxx@example.com', role: 'viewer', status: 'inactive', joinedAt: '2024-09-10' },
];

export const webhookConfigs: WebhookConfig[] = [
  { id: 'wh_1', url: 'https://api.example.com/webhooks/ainexus', events: ['task.completed', 'task.failed'], secret: 'whsec_...x9a2', status: 'active', createdAt: '2024-08-01' },
  { id: 'wh_2', url: 'https://hooks.slack.com/services/xxx', events: ['task.completed'], secret: 'whsec_...b3c5', status: 'active', createdAt: '2024-09-15' },
];

export const securitySettings: SecuritySetting = {
  mfaEnabled: true,
  ipRestriction: false,
  allowedIps: ['192.168.1.0/24', '10.0.0.0/8'],
  sessionTimeout: 30,
  passwordPolicy: 'strict',
};

export const customers: Customer[] = [
  { id: 'c1', name: '云启科技', email: 'admin@yunqi.com', company: '云启科技', status: 'active', credits: 50000, createdAt: '2024-01-15' },
  { id: 'c2', name: '智创未来', email: 'admin@zhichuang.com', company: '智创未来', status: 'active', credits: 120000, createdAt: '2024-02-20' },
  { id: 'c3', name: '像素工坊', email: 'admin@xiangsu.com', company: '像素工坊', status: 'active', credits: 30000, createdAt: '2024-03-10' },
  { id: 'c4', name: '数据先锋', email: 'admin@shuju.com', company: '数据先锋', status: 'suspended', credits: 0, createdAt: '2024-05-01' },
];

export const workspaces: Workspace[] = [
  { id: 'ws_1', name: '云启-生产环境', customerId: 'c1', status: 'active', modelsEnabled: ['m1', 'm2', 'm3', 'm4', 'm6'], createdAt: '2024-01-20' },
  { id: 'ws_2', name: '云启-测试环境', customerId: 'c1', status: 'active', modelsEnabled: ['m3', 'm6'], createdAt: '2024-02-01' },
  { id: 'ws_3', name: '智创-主工作区', customerId: 'c2', status: 'active', modelsEnabled: ['m1', 'm3', 'm4', 'm5', 'm6', 'm7'], createdAt: '2024-03-01' },
  { id: 'ws_4', name: '像素-设计工作区', customerId: 'c3', status: 'active', modelsEnabled: ['m6', 'm7', 'm8', 'm9'], createdAt: '2024-04-01' },
];

export const adminLogs: AdminLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `al_${i + 1}`,
  adminName: ['系统管理员', '运营专员', '技术支持'][Math.floor(Math.random() * 3)],
  action: ['审核充值', '修改模型配置', '禁用账户', '调整价格', '导出数据'][Math.floor(Math.random() * 5)],
  target: ['客户#100' + i, '模型GPT-4o', '充值申请#' + i, '系统设置'][Math.floor(Math.random() * 4)],
  ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
  createdAt: new Date(Date.now() - i * 7200000).toISOString(),
}));

export const systemSettings: SystemSetting[] = [
  { key: 'default_rate_limit', value: '1000', description: '默认 API 速率限制（请求/分钟）', updatedAt: '2024-12-01' },
  { key: 'max_request_timeout', value: '60000', description: '最大请求超时时间（毫秒）', updatedAt: '2024-12-01' },
  { key: 'credit_exchange_rate', value: '1', description: '积分兑换比例（1元 = N积分）', updatedAt: '2024-11-15' },
  { key: 'free_trial_credits', value: '1000', description: '新用户免费积分额度', updatedAt: '2024-10-01' },
  { key: 'task_retention_days', value: '30', description: '异步任务数据保留天数', updatedAt: '2024-09-01' },
];

export const dashboardStats: DashboardStats = {
  totalApiCalls: 1258473,
  activeModels: 11,
  totalCredits: 12700,
  membersCount: 4,
  recentCalls: callLogs.slice(0, 5),
  creditTrend: [
    { date: '2024-12-04', credits: 8500 },
    { date: '2024-12-05', credits: 7800 },
    { date: '2024-12-06', credits: 10200 },
    { date: '2024-12-07', credits: 9500 },
    { date: '2024-12-08', credits: 11000 },
    { date: '2024-12-09', credits: 13500 },
    { date: '2024-12-10', credits: 12700 },
  ],
};

// Price data for pricing page
export const pricingPlans = [
  {
    name: '免费版',
    description: '适合个人开发者体验',
    price: '¥0',
    period: '/月',
    features: ['1000 积分/月', '5 个模型访问', '100 次 API 调用/天', '社区支持', '基础统计分析'],
    cta: '免费开始',
    popular: false,
  },
  {
    name: '专业版',
    description: '适合小型团队和项目',
    price: '¥299',
    period: '/月',
    features: ['50000 积分/月', '全部模型访问', '无限 API 调用', '优先技术支持', '高级统计分析', '自定义路由策略', 'Webhook 支持'],
    cta: '立即升级',
    popular: true,
  },
  {
    name: '企业版',
    description: '适合大型团队和企业',
    price: '¥999',
    period: '/月',
    features: ['200000 积分/月', '全部模型访问', '无限 API 调用', '专属技术支持', '完整统计分析', 'SSO 单点登录', 'SLA 保障', '私有化部署选项'],
    cta: '联系销售',
    popular: false,
  },
];

export const modelPrices = [
  { model: 'GPT-4o', type: '文本', inputPrice: '¥0.015/1K tokens', outputPrice: '¥0.045/1K tokens' },
  { model: 'GPT-4', type: '文本', inputPrice: '¥0.09/1K tokens', outputPrice: '¥0.18/1K tokens' },
  { model: 'GPT-3.5 Turbo', type: '文本', inputPrice: '¥0.0015/1K tokens', outputPrice: '¥0.002/1K tokens' },
  { model: 'Claude 3.5 Sonnet', type: '文本', inputPrice: '¥0.009/1K tokens', outputPrice: '¥0.015/1K tokens' },
  { model: 'DALL-E 3', type: '图片', inputPrice: '-', outputPrice: '¥0.04/张' },
  { model: 'Stable Diffusion 3', type: '图片', inputPrice: '-', outputPrice: '¥0.025/张' },
  { model: 'Text Embedding 3', type: 'Embedding', inputPrice: '¥0.0005/1K tokens', outputPrice: '-' },
];

// FAQ data
export const faqData = [
  {
    question: 'AI Nexus 的计费方式是怎样的？',
    answer: '我们采用积分制计费。不同类型的 API 调用消耗不同数量的积分，积分单价根据底层供应商成本和平台服务费计算。新用户注册即送 1000 积分免费额度。',
  },
  {
    question: '如何接入 AI Nexus？需要改造现有代码吗？',
    answer: 'AI Nexus 的 API 接口与 OpenAI 官方 API 完全兼容。如果您已经在使用 OpenAI SDK，只需修改 base URL 和 API Key 即可无缝切换，无需改动业务代码。',
  },
  {
    question: '支持哪些 AI 模型？',
    answer: '目前支持 OpenAI 全系模型（GPT-4o、GPT-4、DALL·E、Whisper 等）、Anthropic Claude 系列、Stable Diffusion 图片生成、Runway/Pika 视频生成等，且持续增加中。',
  },
  {
    question: '数据安全如何保障？',
    answer: '平台通过 HTTPS/TLS 加密所有数据传输，API Key 采用 AES-256 加密存储。支持 IP 白名单、请求频率限制等多重安全策略。所有操作均有审计日志。',
  },
  {
    question: '可以团队成员共用吗？',
    answer: '可以。支持创建多个工作区，每个工作区可邀请团队成员，并可设置不同成员的权限级别（管理员/开发者/只读）。',
  },
  {
    question: '如何充值积分？',
    answer: '支持在线支付（支付宝/微信）和线下对公转账。线下转账提交充值申请后，财务审核通过即可到账。',
  },
];

// Testimonials data
export const testimonials = [
  {
    quote: 'AI Nexus 帮我们将 AI 供应商对接时间从 2 周缩短到 1 天。统一的 API 接口意味着我们的工程师只需要维护一套代码。',
    name: '张明远',
    title: 'CTO, 云启科技',
    rating: 5,
  },
  {
    quote: '路由策略功能太棒了。我们可以根据成本和速度自动切换模型，每月节省了 30% 的 AI 调用成本。',
    name: '李思涵',
    title: '技术负责人, 智创未来',
    rating: 5,
  },
  {
    quote: '异步任务管理让我们的图片批量生成流程变得简单可控。Webhook 回调稳定可靠，任务状态实时同步。',
    name: '王浩宇',
    title: 'AI 工程师, 像素工坊',
    rating: 5,
  },
];
