// Admin-specific mock data for all 11 admin pages

export interface AdminCustomer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  totalRecharge: number;
  currentCredits: number;
  workspaceCount: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface AdminWorkspace {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  plan: string;
  memberCount: number;
  availableProviders: string[];
  platformKeyCount: number;
  currentCredits: number;
  lastCallTime: string;
  status: 'active' | 'inactive' | 'idle';
  modelsEnabled: string[];
  createdAt: string;
  todayCalls: number;
}

export interface RechargeRecord {
  id: string;
  customerId: string;
  customerName: string;
  workspaceId: string;
  workspaceName: string;
  paymentAmount: number;
  requestedCredits: number;
  paymentTime: string;
  voucherUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  bankName: string;
  accountLast4: string;
  reviewNote?: string;
  rejectReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CreditLedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  workspaceId: string;
  workspaceName: string;
  type: 'consume' | 'recharge' | 'gift' | 'refund' | 'adjust';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedId: string;
  operator: string;
  time: string;
  notes: string;
}

export interface ModelConfigEntry {
  id: string;
  provider: string;
  name: string;
  modelType: string;
  apiIdentifier: string;
  asyncSupport: boolean;
  defaultTimeout: number;
  defaultRetries: number;
  status: 'active' | 'inactive';
  capabilities: string[];
  costPer1KTokens: number;
  /** 上游供应商实际成本 (积分/1K tokens) — 管理端保密 */
  inputCost?: number;
  /** 平台积分定价 (积分/1K tokens) — 用户端可见的价格 */
  platformPrice?: number;
  /** 上游 Base URL */
  baseUrl?: string;
  /** 上游 API Key ID */
  upstreamKeyId?: string;
  /** 自定义请求路径 */
  customPath?: string;
  contextWindow: number;
  description: string;
}

export interface PricingRule {
  id: string;
  name: string;
  apiType: string;
  model: string;
  modelId: string;
  billingUnit: string;
  creditCost: number;
  tierRules: { threshold: number; discount: number }[];
  failRefund: boolean;
  effectiveTime: string;
  status: 'active' | 'inactive';
}

export interface RequestMonitorEntry {
  id: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  workspaceId: string;
  model: string;
  status: 'success' | 'error' | 'timeout';
  duration: number;
  creditsUsed: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface TaskMonitorEntry {
  id: string;
  customerId: string;
  customerName: string;
  taskType: 'image' | 'video';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  model: string;
  frozenCredits: number;
  actualCredits: number;
  createdTime: string;
  completedTime?: string;
  failureReason?: string;
  progress: number;
  prompt: string;
}

export interface AdminLogEntry {
  id: string;
  adminName: string;
  module: string;
  actionType: string;
  targetObject: string;
  beforeValue: string;
  afterValue: string;
  ipAddress: string;
  sensitivity: 'normal' | 'sensitive' | 'highrisk';
  time: string;
}

export interface SystemSettingItem {
  key: string;
  value: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'toggle' | 'select';
  options?: string[];
  description?: string;
}

export interface ProviderHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  avgResponse: string;
  successRate: string;
  todayCalls: string;
  modelCount: number;
}

export interface RecentAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  source: string;
}

// ---- MOCK DATA ----

export const adminCustomers: AdminCustomer[] = [
  { id: 'C-1001', name: '云启科技', contactPerson: '张明远', email: 'zhangmy@yunqi.com', phone: '138-0000-1001', plan: 'enterprise', status: 'active', totalRecharge: 500000, currentCredits: 128500, workspaceCount: 3, createdAt: '2024-01-10', lastLoginAt: '2024-12-10T14:30:00Z' },
  { id: 'C-1002', name: '智创未来', contactPerson: '李思涵', email: 'lish@zhichuang.com', phone: '139-0000-1002', plan: 'enterprise', status: 'active', totalRecharge: 350000, currentCredits: 56000, workspaceCount: 2, createdAt: '2024-01-08', lastLoginAt: '2024-12-10T12:00:00Z' },
  { id: 'C-1003', name: '星辰数据', contactPerson: '王浩宇', email: 'wanghy@xingchen.com', phone: '137-0000-1003', plan: 'pro', status: 'active', totalRecharge: 120000, currentCredits: 24500, workspaceCount: 1, createdAt: '2024-02-15', lastLoginAt: '2024-12-09T18:00:00Z' },
  { id: 'C-1004', name: '像素工坊', contactPerson: '陈晓晓', email: 'chenxx@xiangsugongfang.com', phone: '136-0000-1004', plan: 'pro', status: 'active', totalRecharge: 80000, currentCredits: 120000, workspaceCount: 1, createdAt: '2024-01-20', lastLoginAt: '2024-12-10T10:00:00Z' },
  { id: 'C-1005', name: '未来智能', contactPerson: '刘子轩', email: 'liuzx@weilaizhineng.com', phone: '135-0000-1005', plan: 'free', status: 'inactive', totalRecharge: 0, currentCredits: 1000, workspaceCount: 0, createdAt: '2024-03-01', lastLoginAt: '2024-03-01T09:00:00Z' },
  { id: 'C-1006', name: '蓝海集团', contactPerson: '赵志强', email: 'zhaozq@lanhai.com', phone: '133-0000-1006', plan: 'enterprise', status: 'active', totalRecharge: 800000, currentCredits: 450000, workspaceCount: 5, createdAt: '2023-11-15', lastLoginAt: '2024-12-10T15:00:00Z' },
  { id: 'C-1007', name: '灵动科技', contactPerson: '孙小曼', email: 'sunxm@lingdong.com', phone: '132-0000-1007', plan: 'pro', status: 'active', totalRecharge: 60000, currentCredits: 18000, workspaceCount: 1, createdAt: '2024-04-10', lastLoginAt: '2024-12-08T11:00:00Z' },
  { id: 'C-1008', name: '新纪元AI', contactPerson: '周明哲', email: 'zhoumz@xinjiyuan.com', phone: '131-0000-1008', plan: 'free', status: 'suspended', totalRecharge: 0, currentCredits: 0, workspaceCount: 0, createdAt: '2024-05-20', lastLoginAt: '2024-06-01T10:00:00Z' },
];

export const adminWorkspaces: AdminWorkspace[] = [
  { id: 'WS-001', name: '云启-生产环境', customerId: 'C-1001', customerName: '云启科技', plan: 'enterprise', memberCount: 5, availableProviders: ['OpenAI', 'Anthropic'], platformKeyCount: 3, currentCredits: 85000, lastCallTime: '2024-12-10T15:30:00Z', status: 'active', modelsEnabled: ['gpt-4o', 'gpt-4', 'claude-3.5-sonnet'], createdAt: '2024-01-12', todayCalls: 8234 },
  { id: 'WS-002', name: '云启-测试环境', customerId: 'C-1001', customerName: '云启科技', plan: 'enterprise', memberCount: 3, availableProviders: ['OpenAI'], platformKeyCount: 2, currentCredits: 43500, lastCallTime: '2024-12-10T14:00:00Z', status: 'active', modelsEnabled: ['gpt-3.5-turbo'], createdAt: '2024-01-15', todayCalls: 2156 },
  { id: 'WS-003', name: '智创-主工作区', customerId: 'C-1002', customerName: '智创未来', plan: 'enterprise', memberCount: 4, availableProviders: ['OpenAI', 'Anthropic', 'Stability AI'], platformKeyCount: 2, currentCredits: 56000, lastCallTime: '2024-12-10T15:15:00Z', status: 'active', modelsEnabled: ['gpt-4o', 'claude-3-opus', 'dall-e-3'], createdAt: '2024-01-20', todayCalls: 5678 },
  { id: 'WS-004', name: '像素-设计空间', customerId: 'C-1004', customerName: '像素工坊', plan: 'pro', memberCount: 2, availableProviders: ['Stability AI', 'Runway'], platformKeyCount: 1, currentCredits: 120000, lastCallTime: '2024-12-10T15:00:00Z', status: 'active', modelsEnabled: ['sd3', 'runway-gen3'], createdAt: '2024-02-01', todayCalls: 1890 },
  { id: 'WS-005', name: '蓝海-核心系统', customerId: 'C-1006', customerName: '蓝海集团', plan: 'enterprise', memberCount: 8, availableProviders: ['OpenAI', 'Anthropic', 'Stability AI', 'Runway'], platformKeyCount: 5, currentCredits: 450000, lastCallTime: '2024-12-10T15:35:00Z', status: 'active', modelsEnabled: ['gpt-4o', 'gpt-4', 'claude-3.5-sonnet', 'dall-e-3', 'sd3'], createdAt: '2023-11-20', todayCalls: 12450 },
  { id: 'WS-006', name: '蓝海-研发部', customerId: 'C-1006', customerName: '蓝海集团', plan: 'enterprise', memberCount: 6, availableProviders: ['OpenAI', 'Anthropic'], platformKeyCount: 3, currentCredits: 200000, lastCallTime: '2024-12-10T15:20:00Z', status: 'active', modelsEnabled: ['gpt-4o', 'claude-3.5-sonnet'], createdAt: '2024-01-05', todayCalls: 8760 },
  { id: 'WS-007', name: '灵动-主工作区', customerId: 'C-1007', customerName: '灵动科技', plan: 'pro', memberCount: 2, availableProviders: ['OpenAI'], platformKeyCount: 1, currentCredits: 18000, lastCallTime: '2024-12-09T16:00:00Z', status: 'idle', modelsEnabled: ['gpt-3.5-turbo'], createdAt: '2024-04-15', todayCalls: 0 },
  { id: 'WS-008', name: '星辰-分析平台', customerId: 'C-1003', customerName: '星辰数据', plan: 'pro', memberCount: 3, availableProviders: ['OpenAI', 'Anthropic'], platformKeyCount: 2, currentCredits: 24500, lastCallTime: '2024-12-10T14:30:00Z', status: 'active', modelsEnabled: ['gpt-4o', 'text-embedding-3'], createdAt: '2024-02-20', todayCalls: 3456 },
];

export const rechargeRecords: RechargeRecord[] = [
  { id: 'CHG-001', customerId: 'C-1001', customerName: '云启科技', workspaceId: 'WS-001', workspaceName: '云启-生产环境', paymentAmount: 5000, requestedCredits: 50000, paymentTime: '2024-12-09T10:00:00Z', voucherUrl: '', status: 'pending', bankName: '招商银行', accountLast4: '6789' },
  { id: 'CHG-002', customerId: 'C-1002', customerName: '智创未来', workspaceId: 'WS-003', workspaceName: '智创-主工作区', paymentAmount: 10000, requestedCredits: 100000, paymentTime: '2024-12-08T14:30:00Z', voucherUrl: '', status: 'pending', bankName: '工商银行', accountLast4: '3456' },
  { id: 'CHG-003', customerId: 'C-1004', customerName: '像素工坊', workspaceId: 'WS-004', workspaceName: '像素-设计空间', paymentAmount: 2000, requestedCredits: 20000, paymentTime: '2024-12-07T09:00:00Z', voucherUrl: '', status: 'pending', bankName: '建设银行', accountLast4: '1234' },
  { id: 'CHG-004', customerId: 'C-1006', customerName: '蓝海集团', workspaceId: 'WS-005', workspaceName: '蓝海-核心系统', paymentAmount: 50000, requestedCredits: 500000, paymentTime: '2024-12-06T16:00:00Z', voucherUrl: '', status: 'approved', bankName: '中国银行', accountLast4: '9876', reviewNote: '大额充值已核实', reviewedBy: 'admin1', reviewedAt: '2024-12-07T09:00:00Z' },
  { id: 'CHG-005', customerId: 'C-1007', customerName: '灵动科技', workspaceId: 'WS-007', workspaceName: '灵动-主工作区', paymentAmount: 500, requestedCredits: 5000, paymentTime: '2024-12-05T11:00:00Z', voucherUrl: '', status: 'rejected', bankName: '支付宝', accountLast4: 'N/A', rejectReason: '转账金额与申请不符', reviewedBy: 'admin2', reviewedAt: '2024-12-06T10:00:00Z' },
  { id: 'CHG-006', customerId: 'C-1003', customerName: '星辰数据', workspaceId: 'WS-008', workspaceName: '星辰-分析平台', paymentAmount: 3000, requestedCredits: 30000, paymentTime: '2024-12-10T08:00:00Z', voucherUrl: '', status: 'pending', bankName: '招商银行', accountLast4: '5678' },
  { id: 'CHG-007', customerId: 'C-1001', customerName: '云启科技', workspaceId: 'WS-002', workspaceName: '云启-测试环境', paymentAmount: 1500, requestedCredits: 15000, paymentTime: '2024-12-10T12:00:00Z', voucherUrl: '', status: 'pending', bankName: '微信支付', accountLast4: 'N/A' },
];

export const creditLedgerEntries: CreditLedgerEntry[] = [
  { id: 'TX-20241210001', customerId: 'C-1001', customerName: '云启科技', workspaceId: 'WS-001', workspaceName: '云启-生产环境', type: 'consume', amount: -500, balanceBefore: 85500, balanceAfter: 85000, relatedId: 'req_abc123', operator: '系统', time: '2024-12-10T15:30:00Z', notes: 'API调用: gpt-4o' },
  { id: 'TX-20241210002', customerId: 'C-1001', customerName: '云启科技', workspaceId: 'WS-001', workspaceName: '云启-生产环境', type: 'consume', amount: -1200, balanceBefore: 86700, balanceAfter: 85500, relatedId: 'req_def456', operator: '系统', time: '2024-12-10T15:25:00Z', notes: '图片生成: dall-e-3' },
  { id: 'TX-20241209001', customerId: 'C-1002', customerName: '智创未来', workspaceId: 'WS-003', workspaceName: '智创-主工作区', type: 'recharge', amount: 100000, balanceBefore: 0, balanceAfter: 100000, relatedId: 'CHG-002', operator: 'admin1', time: '2024-12-09T10:00:00Z', notes: '充值审核通过' },
  { id: 'TX-20241209002', customerId: 'C-1002', customerName: '智创未来', workspaceId: 'WS-003', workspaceName: '智创-主工作区', type: 'consume', amount: -44000, balanceBefore: 100000, balanceAfter: 56000, relatedId: 'batch_dec', operator: '系统', time: '2024-12-09T12:00:00Z', notes: '批量API调用' },
  { id: 'TX-20241208001', customerId: 'C-1004', customerName: '像素工坊', workspaceId: 'WS-004', workspaceName: '像素-设计空间', type: 'gift', amount: 5000, balanceBefore: 115000, balanceAfter: 120000, relatedId: '', operator: 'admin2', time: '2024-12-08T09:00:00Z', notes: '新用户赠送' },
  { id: 'TX-20241208002', customerId: 'C-1006', customerName: '蓝海集团', workspaceId: 'WS-005', workspaceName: '蓝海-核心系统', type: 'recharge', amount: 500000, balanceBefore: 0, balanceAfter: 500000, relatedId: 'CHG-004', operator: 'admin1', time: '2024-12-07T09:00:00Z', notes: '大额充值: ¥50,000' },
  { id: 'TX-20241207001', customerId: 'C-1006', customerName: '蓝海集团', workspaceId: 'WS-005', workspaceName: '蓝海-核心系统', type: 'consume', amount: -50000, balanceBefore: 500000, balanceAfter: 450000, relatedId: 'batch_nov', operator: '系统', time: '2024-12-07T10:00:00Z', notes: '月度结算' },
  { id: 'TX-20241207002', customerId: 'C-1007', customerName: '灵动科技', workspaceId: 'WS-007', workspaceName: '灵动-主工作区', type: 'adjust', amount: 2000, balanceBefore: 16000, balanceAfter: 18000, relatedId: '', operator: 'admin1', time: '2024-12-06T14:00:00Z', notes: '手动调账: 补偿' },
  { id: 'TX-20241206001', customerId: 'C-1001', customerName: '云启科技', workspaceId: 'WS-001', workspaceName: '云启-生产环境', type: 'refund', amount: 200, balanceBefore: 86500, balanceAfter: 86700, relatedId: 'req_err789', operator: '系统', time: '2024-12-05T16:00:00Z', notes: '调用异常退款' },
  { id: 'TX-20241206002', customerId: 'C-1003', customerName: '星辰数据', workspaceId: 'WS-008', workspaceName: '星辰-分析平台', type: 'recharge', amount: 30000, balanceBefore: 0, balanceAfter: 30000, relatedId: 'CHG-006', operator: 'admin1', time: '2024-12-10T09:00:00Z', notes: '充值审核通过' },
  { id: 'TX-20241205001', customerId: 'C-1003', customerName: '星辰数据', workspaceId: 'WS-008', workspaceName: '星辰-分析平台', type: 'consume', amount: -5500, balanceBefore: 30000, balanceAfter: 24500, relatedId: 'batch_emb', operator: '系统', time: '2024-12-10T10:00:00Z', notes: 'Embedding批量处理' },
  { id: 'TX-20241205002', customerId: 'C-1004', customerName: '像素工坊', workspaceId: 'WS-004', workspaceName: '像素-设计空间', type: 'consume', amount: -8000, balanceBefore: 123000, balanceAfter: 115000, relatedId: 'video_001', operator: '系统', time: '2024-12-08T14:00:00Z', notes: '视频生成: runway-gen3' },
];

export const modelConfigEntries: ModelConfigEntry[] = [
  { id: 'MC-001', provider: 'OpenAI', name: 'GPT-4o', modelType: 'text', apiIdentifier: 'gpt-4o', asyncSupport: false, defaultTimeout: 30, defaultRetries: 3, status: 'active', capabilities: ['chat', 'function-calling', 'vision'], costPer1KTokens: 0.005, inputCost: 5, platformPrice: 15, contextWindow: 128000, description: 'OpenAI旗舰多模态模型' },
  { id: 'MC-002', provider: 'OpenAI', name: 'GPT-4 Turbo', modelType: 'text', apiIdentifier: 'gpt-4-turbo', asyncSupport: false, defaultTimeout: 30, defaultRetries: 3, status: 'active', capabilities: ['chat', 'function-calling', 'vision'], costPer1KTokens: 0.01, inputCost: 10, platformPrice: 30, contextWindow: 128000, description: '高性能文本模型' },
  { id: 'MC-003', provider: 'OpenAI', name: 'GPT-3.5 Turbo', modelType: 'text', apiIdentifier: 'gpt-3.5-turbo', asyncSupport: false, defaultTimeout: 20, defaultRetries: 2, status: 'active', capabilities: ['chat', 'function-calling'], costPer1KTokens: 0.0005, inputCost: 0.5, platformPrice: 1.5, contextWindow: 16000, description: '高性价比文本模型' },
  { id: 'MC-004', provider: 'Anthropic', name: 'Claude 3.5 Sonnet', modelType: 'text', apiIdentifier: 'claude-3-5-sonnet-20241022', asyncSupport: false, defaultTimeout: 45, defaultRetries: 3, status: 'active', capabilities: ['chat', 'function-calling', 'vision'], costPer1KTokens: 0.003, inputCost: 3, platformPrice: 9, contextWindow: 200000, description: 'Anthropic先进模型' },
  { id: 'MC-005', provider: 'Anthropic', name: 'Claude 3 Opus', modelType: 'text', apiIdentifier: 'claude-3-opus-20240229', asyncSupport: false, defaultTimeout: 60, defaultRetries: 3, status: 'active', capabilities: ['chat', 'function-calling', 'vision'], costPer1KTokens: 0.015, inputCost: 15, platformPrice: 45, contextWindow: 200000, description: 'Anthropic顶级模型' },
  { id: 'MC-006', provider: 'OpenAI', name: 'DALL-E 3', modelType: 'image', apiIdentifier: 'dall-e-3', asyncSupport: true, defaultTimeout: 60, defaultRetries: 2, status: 'active', capabilities: ['image-generation'], costPer1KTokens: 0.04, inputCost: 10, platformPrice: 40, contextWindow: 0, description: '高质量图片生成' },
  { id: 'MC-007', provider: 'Stability AI', name: 'Stable Diffusion 3', modelType: 'image', apiIdentifier: 'sd3', asyncSupport: true, defaultTimeout: 120, defaultRetries: 2, status: 'active', capabilities: ['image-generation'], costPer1KTokens: 0.025, inputCost: 6, platformPrice: 25, contextWindow: 0, description: '开源图片生成模型' },
  { id: 'MC-008', provider: 'Runway', name: 'Runway Gen-3', modelType: 'video', apiIdentifier: 'runway-gen3-alpha', asyncSupport: true, defaultTimeout: 300, defaultRetries: 2, status: 'active', capabilities: ['video-generation'], costPer1KTokens: 0.5, inputCost: 150, platformPrice: 500, contextWindow: 0, description: '高质量视频生成' },
  { id: 'MC-009', provider: 'Pika', name: 'Pika 1.5', modelType: 'video', apiIdentifier: 'pika-1.5', asyncSupport: true, defaultTimeout: 300, defaultRetries: 2, status: 'active', capabilities: ['video-generation'], costPer1KTokens: 0.45, inputCost: 120, platformPrice: 450, contextWindow: 0, description: '创意视频生成' },
  { id: 'MC-010', provider: 'OpenAI', name: 'Text Embedding 3', modelType: 'embedding', apiIdentifier: 'text-embedding-3-small', asyncSupport: false, defaultTimeout: 15, defaultRetries: 2, status: 'active', capabilities: ['embedding'], costPer1KTokens: 0.0001, inputCost: 0.05, platformPrice: 0.1, contextWindow: 8000, description: '文本向量化模型' },
  { id: 'MC-011', provider: 'OpenAI', name: 'Whisper v3', modelType: 'audio', apiIdentifier: 'whisper-1', asyncSupport: true, defaultTimeout: 120, defaultRetries: 2, status: 'inactive', capabilities: ['speech-to-text'], costPer1KTokens: 0.006, inputCost: 2, platformPrice: 6, contextWindow: 0, description: '语音转录模型' },
];

export const pricingRules: PricingRule[] = [
  { id: 'PR-001', name: 'GPT-4o标准定价', apiType: 'chat.completion', model: 'GPT-4o', modelId: 'MC-001', billingUnit: '1K tokens', creditCost: 15, tierRules: [{ threshold: 1000000, discount: 0.9 }, { threshold: 10000000, discount: 0.8 }], failRefund: true, effectiveTime: '2024-01-01', status: 'active' },
  { id: 'PR-002', name: 'GPT-4 Turbo标准定价', apiType: 'chat.completion', model: 'GPT-4 Turbo', modelId: 'MC-002', billingUnit: '1K tokens', creditCost: 30, tierRules: [{ threshold: 500000, discount: 0.85 }, { threshold: 5000000, discount: 0.75 }], failRefund: true, effectiveTime: '2024-01-01', status: 'active' },
  { id: 'PR-003', name: 'GPT-3.5 Turbo标准定价', apiType: 'chat.completion', model: 'GPT-3.5 Turbo', modelId: 'MC-003', billingUnit: '1K tokens', creditCost: 1.5, tierRules: [{ threshold: 5000000, discount: 0.9 }], failRefund: true, effectiveTime: '2024-01-01', status: 'active' },
  { id: 'PR-004', name: 'Claude 3.5 Sonnet标准定价', apiType: 'chat.completion', model: 'Claude 3.5 Sonnet', modelId: 'MC-004', billingUnit: '1K tokens', creditCost: 9, tierRules: [{ threshold: 1000000, discount: 0.9 }], failRefund: true, effectiveTime: '2024-02-01', status: 'active' },
  { id: 'PR-005', name: 'DALL-E 3标准定价', apiType: 'image.generation', model: 'DALL-E 3', modelId: 'MC-006', billingUnit: 'per image', creditCost: 40, tierRules: [{ threshold: 10000, discount: 0.9 }], failRefund: true, effectiveTime: '2024-01-01', status: 'active' },
  { id: 'PR-006', name: 'SD3标准定价', apiType: 'image.generation', model: 'Stable Diffusion 3', modelId: 'MC-007', billingUnit: 'per image', creditCost: 25, tierRules: [{ threshold: 20000, discount: 0.85 }], failRefund: true, effectiveTime: '2024-03-01', status: 'active' },
  { id: 'PR-007', name: 'Runway Gen-3标准定价', apiType: 'video.generation', model: 'Runway Gen-3', modelId: 'MC-008', billingUnit: 'per video', creditCost: 500, tierRules: [], failRefund: false, effectiveTime: '2024-04-01', status: 'active' },
  { id: 'PR-008', name: 'Embedding标准定价', apiType: 'embedding', model: 'Text Embedding 3', modelId: 'MC-010', billingUnit: '1K tokens', creditCost: 0.1, tierRules: [{ threshold: 10000000, discount: 0.8 }], failRefund: true, effectiveTime: '2024-01-01', status: 'active' },
  { id: 'PR-009', name: 'Pika 1.5标准定价', apiType: 'video.generation', model: 'Pika 1.5', modelId: 'MC-009', billingUnit: 'per video', creditCost: 450, tierRules: [], failRefund: false, effectiveTime: '2024-05-01', status: 'inactive' },
];

export const requestMonitorEntries: RequestMonitorEntry[] = Array.from({ length: 100 }, (_, i) => ({
  id: `REQ-${String(i + 1).padStart(6, '0')}`,
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
  customerId: ['C-1001', 'C-1002', 'C-1003', 'C-1004', 'C-1006', 'C-1007'][Math.floor(Math.random() * 6)],
  customerName: ['云启科技', '智创未来', '星辰数据', '像素工坊', '蓝海集团', '灵动科技'][Math.floor(Math.random() * 6)],
  workspaceId: ['WS-001', 'WS-002', 'WS-003', 'WS-004', 'WS-005', 'WS-006'][Math.floor(Math.random() * 6)],
  model: ['GPT-4o', 'GPT-3.5 Turbo', 'Claude 3.5 Sonnet', 'DALL-E 3', 'SD3', 'Runway Gen-3'][Math.floor(Math.random() * 6)],
  status: ['success', 'success', 'success', 'success', 'error', 'timeout'][Math.floor(Math.random() * 6)] as 'success' | 'error' | 'timeout',
  duration: Math.floor(Math.random() * 10000) + 50,
  creditsUsed: Math.floor(Math.random() * 2000) + 1,
  errorCode: Math.random() > 0.8 ? ['400', '401', '429', '500', '502'][Math.floor(Math.random() * 5)] : undefined,
  errorMessage: Math.random() > 0.8 ? 'Upstream timeout or rate limited' : undefined,
}));

export const taskMonitorEntries: TaskMonitorEntry[] = [
  { id: 'TASK-001', customerId: 'C-1001', customerName: '云启科技', taskType: 'image', status: 'completed', model: 'DALL-E 3', frozenCredits: 40, actualCredits: 40, createdTime: '2024-12-10T14:00:00Z', completedTime: '2024-12-10T14:00:15Z', progress: 100, prompt: 'A futuristic cityscape' },
  { id: 'TASK-002', customerId: 'C-1002', customerName: '智创未来', taskType: 'image', status: 'processing', model: 'SD3', frozenCredits: 25, actualCredits: 0, createdTime: '2024-12-10T15:10:00Z', progress: 65, prompt: 'Abstract geometric art' },
  { id: 'TASK-003', customerId: 'C-1004', customerName: '像素工坊', taskType: 'video', status: 'pending', model: 'Runway Gen-3', frozenCredits: 500, actualCredits: 0, createdTime: '2024-12-10T15:20:00Z', progress: 0, prompt: 'Slow motion waterfall' },
  { id: 'TASK-004', customerId: 'C-1006', customerName: '蓝海集团', taskType: 'video', status: 'processing', model: 'Runway Gen-3', frozenCredits: 500, actualCredits: 0, createdTime: '2024-12-10T15:15:00Z', progress: 30, prompt: 'Product showcase animation' },
  { id: 'TASK-005', customerId: 'C-1001', customerName: '云启科技', taskType: 'image', status: 'failed', model: 'DALL-E 3', frozenCredits: 40, actualCredits: 0, createdTime: '2024-12-10T14:30:00Z', completedTime: '2024-12-10T14:30:45Z', failureReason: 'Content policy violation', progress: 0, prompt: 'Cyberpunk character portrait' },
  { id: 'TASK-006', customerId: 'C-1003', customerName: '星辰数据', taskType: 'image', status: 'completed', model: 'SD3', frozenCredits: 25, actualCredits: 25, createdTime: '2024-12-10T13:00:00Z', completedTime: '2024-12-10T13:00:20Z', progress: 100, prompt: 'Data visualization illustration' },
  { id: 'TASK-007', customerId: 'C-1006', customerName: '蓝海集团', taskType: 'video', status: 'pending', model: 'Pika 1.5', frozenCredits: 450, actualCredits: 0, createdTime: '2024-12-10T15:25:00Z', progress: 0, prompt: 'Logo animation reveal' },
  { id: 'TASK-008', customerId: 'C-1007', customerName: '灵动科技', taskType: 'image', status: 'failed', model: 'DALL-E 3', frozenCredits: 40, actualCredits: 0, createdTime: '2024-12-10T12:00:00Z', completedTime: '2024-12-10T12:01:00Z', failureReason: 'Upstream API error: timeout', progress: 0, prompt: '3D rendered product mockup' },
  { id: 'TASK-009', customerId: 'C-1002', customerName: '智创未来', taskType: 'video', status: 'completed', model: 'Pika 1.5', frozenCredits: 450, actualCredits: 450, createdTime: '2024-12-10T11:00:00Z', completedTime: '2024-12-10T11:05:00Z', progress: 100, prompt: 'Animated explainer video' },
  { id: 'TASK-010', customerId: 'C-1004', customerName: '像素工坊', taskType: 'image', status: 'processing', model: 'DALL-E 3', frozenCredits: 40, actualCredits: 0, createdTime: '2024-12-10T15:18:00Z', progress: 45, prompt: 'Fantasy landscape artwork' },
  { id: 'TASK-011', customerId: 'C-1001', customerName: '云启科技', taskType: 'image', status: 'pending', model: 'SD3', frozenCredits: 25, actualCredits: 0, createdTime: '2024-12-10T15:28:00Z', progress: 0, prompt: 'Tech startup team photo' },
  { id: 'TASK-012', customerId: 'C-1006', customerName: '蓝海集团', taskType: 'video', status: 'cancelled', model: 'Runway Gen-3', frozenCredits: 500, actualCredits: 0, createdTime: '2024-12-10T10:00:00Z', completedTime: '2024-12-10T10:30:00Z', progress: 0, prompt: 'Training video generation' },
];

export const adminLogEntries: AdminLogEntry[] = [
  { id: 'AL-001', adminName: 'admin1', module: '积分调整', actionType: 'credit_adjust', targetObject: '云启科技 (C-1001)', beforeValue: '{"credits": 85500}', afterValue: '{"credits": 86700}', ipAddress: '192.168.1.101', sensitivity: 'highrisk', time: '2024-12-10T15:30:00Z' },
  { id: 'AL-002', adminName: 'admin2', module: '充值审核', actionType: 'recharge_approve', targetObject: 'CHG-004', beforeValue: '{"status": "pending"}', afterValue: '{"status": "approved", "credits": 500000}', ipAddress: '192.168.1.102', sensitivity: 'sensitive', time: '2024-12-07T09:00:00Z' },
  { id: 'AL-003', adminName: 'admin1', module: '模型配置', actionType: 'model_update', targetObject: 'GPT-4o (MC-001)', beforeValue: '{"timeout": 30}', afterValue: '{"timeout": 45}', ipAddress: '192.168.1.101', sensitivity: 'sensitive', time: '2024-12-06T14:00:00Z' },
  { id: 'AL-004', adminName: 'admin3', module: '客户管理', actionType: 'customer_suspend', targetObject: '新纪元AI (C-1008)', beforeValue: '{"status": "active"}', afterValue: '{"status": "suspended"}', ipAddress: '192.168.1.103', sensitivity: 'sensitive', time: '2024-12-05T11:00:00Z' },
  { id: 'AL-005', adminName: 'admin1', module: '系统设置', actionType: 'setting_update', targetObject: 'credit_exchange_rate', beforeValue: '{"rate": "100"}', afterValue: '{"rate": "1000"}', ipAddress: '192.168.1.101', sensitivity: 'highrisk', time: '2024-12-04T16:00:00Z' },
  { id: 'AL-006', adminName: 'admin2', module: '价格规则', actionType: 'pricing_update', targetObject: 'PR-007 (Runway Gen-3)', beforeValue: '{"creditCost": 400}', afterValue: '{"creditCost": 500}', ipAddress: '192.168.1.102', sensitivity: 'sensitive', time: '2024-12-03T10:00:00Z' },
  { id: 'AL-007', adminName: 'admin3', module: '工作区管理', actionType: 'workspace_create', targetObject: 'WS-009', beforeValue: '{}', afterValue: '{"name": "蓝海-新品事业部", "plan": "pro"}', ipAddress: '192.168.1.103', sensitivity: 'normal', time: '2024-12-02T09:00:00Z' },
  { id: 'AL-008', adminName: 'admin1', module: '积分调整', actionType: 'credit_adjust', targetObject: '灵动科技 (C-1007)', beforeValue: '{"credits": 16000}', afterValue: '{"credits": 18000}', ipAddress: '192.168.1.101', sensitivity: 'highrisk', time: '2024-12-01T14:00:00Z' },
  { id: 'AL-009', adminName: 'admin2', module: '充值审核', actionType: 'recharge_reject', targetObject: 'CHG-005', beforeValue: '{"status": "pending"}', afterValue: '{"status": "rejected", "reason": "金额不符"}', ipAddress: '192.168.1.102', sensitivity: 'sensitive', time: '2024-11-30T10:00:00Z' },
  { id: 'AL-010', adminName: 'admin1', module: '登录/登出', actionType: 'login', targetObject: '系统', beforeValue: '{}', afterValue: '{"session": "active"}', ipAddress: '192.168.1.101', sensitivity: 'normal', time: '2024-12-10T08:00:00Z' },
  { id: 'AL-011', adminName: 'admin3', module: '客户管理', actionType: 'customer_update', targetObject: '星辰数据 (C-1003)', beforeValue: '{"plan": "free"}', afterValue: '{"plan": "pro"}', ipAddress: '192.168.1.103', sensitivity: 'normal', time: '2024-11-28T09:00:00Z' },
  { id: 'AL-012', adminName: 'admin2', module: '模型配置', actionType: 'model_disable', targetObject: 'Whisper v3 (MC-011)', beforeValue: '{"status": "active"}', afterValue: '{"status": "inactive"}', ipAddress: '192.168.1.102', sensitivity: 'sensitive', time: '2024-11-25T11:00:00Z' },
];

export const providerHealthData: ProviderHealth[] = [
  { name: 'OpenAI', status: 'healthy', avgResponse: '145ms', successRate: '99.8%', todayCalls: '1.2M', modelCount: 5 },
  { name: 'Anthropic', status: 'healthy', avgResponse: '320ms', successRate: '99.5%', todayCalls: '580K', modelCount: 2 },
  { name: 'Stability AI', status: 'healthy', avgResponse: '2.1s', successRate: '98.2%', todayCalls: '45K', modelCount: 1 },
  { name: 'Runway', status: 'warning', avgResponse: '8.5s', successRate: '95.1%', todayCalls: '12K', modelCount: 1 },
  { name: 'Pika', status: 'healthy', avgResponse: '6.2s', successRate: '97.8%', todayCalls: '8K', modelCount: 1 },
  { name: 'Google', status: 'healthy', avgResponse: '180ms', successRate: '99.1%', todayCalls: '0', modelCount: 0 },
];

export const recentAlerts: RecentAlert[] = [
  { id: 'ALT-001', severity: 'critical', message: 'Runway Gen-3 上游响应异常，成功率降至 85%', time: '15分钟前', source: 'Runway' },
  { id: 'ALT-002', severity: 'warning', message: '工作区 WS-001 积分余额低于 5000', time: '30分钟前', source: '监控' },
  { id: 'ALT-003', severity: 'warning', message: 'Claude 3.5 Sonnet 响应时间超过 5s', time: '1小时前', source: 'Anthropic' },
  { id: 'ALT-004', severity: 'info', message: '新用户注册: 灵动科技', time: '2小时前', source: '系统' },
  { id: 'ALT-005', severity: 'warning', message: '充值审核队列积压 3 单', time: '3小时前', source: '审核' },
];

// Hourly request data for charts
export const hourlyRequestData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  requests: Math.floor(800 + Math.sin(i / 3) * 600 + Math.random() * 400),
  success: Math.floor(780 + Math.sin(i / 3) * 580 + Math.random() * 380),
  failed: Math.floor(20 + Math.random() * 30),
  avgDuration: Math.floor(100 + Math.random() * 200),
}));

// QPS real-time data (last 60 minutes)
export const qpsRealtimeData = Array.from({ length: 60 }, (_, i) => ({
  minute: `${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
  qps: Math.floor(2000 + Math.sin(i / 10) * 1000 + Math.random() * 500),
  textQps: Math.floor(1500 + Math.sin(i / 10) * 800 + Math.random() * 300),
  imageQps: Math.floor(300 + Math.sin(i / 8) * 150 + Math.random() * 100),
  videoQps: Math.floor(50 + Math.sin(i / 5) * 30 + Math.random() * 20),
}));

// Task distribution by type
export const taskDistributionData = [
  { name: '图片生成', value: 65, color: '#3366FF' },
  { name: '视频生成', value: 35, color: '#A855F7' },
];

// Top customers by request
export const topCustomersByRequest = [
  { name: '蓝海集团', requests: 21210, percentage: '35%', creditsUsed: 125000, avgResponse: '168ms' },
  { name: '云启科技', requests: 12390, percentage: '20%', creditsUsed: 68000, avgResponse: '142ms' },
  { name: '智创未来', requests: 7890, percentage: '13%', creditsUsed: 52000, avgResponse: '155ms' },
  { name: '星辰数据', requests: 5340, percentage: '9%', creditsUsed: 31000, avgResponse: '178ms' },
  { name: '像素工坊', requests: 4230, percentage: '7%', creditsUsed: 45000, avgResponse: '210ms' },
];

// Top models by usage
export const topModelsByUsage = [
  { name: 'GPT-4o', provider: 'OpenAI', requests: 28500, percentage: '47%', avgResponse: '145ms', successRate: '99.8%' },
  { name: 'GPT-3.5 Turbo', provider: 'OpenAI', requests: 12300, percentage: '20%', avgResponse: '85ms', successRate: '99.9%' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', requests: 8900, percentage: '15%', avgResponse: '320ms', successRate: '99.5%' },
  { name: 'DALL-E 3', provider: 'OpenAI', requests: 4500, percentage: '7%', avgResponse: '2.1s', successRate: '98.5%' },
  { name: 'SD3', provider: 'Stability AI', requests: 3200, percentage: '5%', avgResponse: '3.2s', successRate: '98.0%' },
];

// Top error codes
export const topErrorCodes = [
  { code: '429', message: 'Rate Limited', count: 1250, percentage: '42%' },
  { code: '500', message: 'Server Error', count: 680, percentage: '23%' },
  { code: '400', message: 'Bad Request', count: 520, percentage: '17%' },
  { code: '502', message: 'Bad Gateway', count: 340, percentage: '11%' },
  { code: '401', message: 'Unauthorized', count: 210, percentage: '7%' },
];

// Activity timeline
export const activityTimeline = [
  { time: '14:32', type: 'customer', color: '#3366FF', content: '新客户注册: 灵动科技' },
  { time: '14:28', type: 'recharge', color: '#34D399', content: '充值审核通过: 智创未来 ¥10,000' },
  { time: '14:25', type: 'alert', color: '#F43F5E', content: '系统告警: Runway 响应超时' },
  { time: '14:20', type: 'workspace', color: '#A855F7', content: '工作区创建: WS-009 蓝海-新品事业部' },
  { time: '14:15', type: 'config', color: '#FBBF24', content: '模型配置更新: GPT-4o 超时调整为 45s' },
  { time: '14:10', type: 'recharge', color: '#34D399', content: '充值申请提交: 星辰科技 ¥3,000' },
  { time: '14:05', type: 'customer', color: '#3366FF', content: 'API Key 创建: WS-005' },
  { time: '14:00', type: 'customer', color: '#3366FF', content: '客户登录: 蓝海集团' },
  { time: '13:55', type: 'config', color: '#FBBF24', content: '路由策略更新: WS-008' },
  { time: '13:50', type: 'alert', color: '#F43F5E', content: '积分预警: WS-001 余额低于 5000' },
];

// Default system settings
export const defaultSystemSettings = {
  platformName: 'AI Nexus',
  logRetentionDays: '30',
  defaultRateLimit: '1000',
  defaultTaskTimeout: '300',
  smtpHost: 'smtp.example.com',
  smtpPort: '587',
  smtpUsername: 'noreply@ainexus.com',
  smtpPassword: 'encrypted_password',
  smtpSender: 'AI Nexus <noreply@ainexus.com>',
  emailAlerts: 'true',
  webhookAlerts: 'false',
  webhookUrl: '',
  maintenanceMode: 'false',
  maintenanceTitle: '系统维护中',
  maintenanceMessage: '我们正在升级系统，请稍后再试。',
  failRateAlertThreshold: '5',
  responseTimeAlertThreshold: '5000',
  queueAlertThreshold: '50',
};

// Credit transaction type colors
export const creditTypeColors: Record<string, string> = {
  consume: '#EF4444',
  recharge: '#10B981',
  gift: '#A855F7',
  refund: '#F59E0B',
  adjust: '#94A3B8',
};

export const creditTypeLabels: Record<string, string> = {
  consume: '消耗',
  recharge: '充值',
  gift: '赠送',
  refund: '退款',
  adjust: '调账',
};

// Provider colors
export const providerColors: Record<string, string> = {
  OpenAI: '#10B981',
  Anthropic: '#A855F7',
  'Stability AI': '#F59E0B',
  Runway: '#F43F5E',
  Pika: '#22D3EE',
  Google: '#3B82F6',
};

// Status badge config
export const statusBadgeConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', label: '活跃' },
  inactive: { bg: 'bg-[var(--slate-700)]', text: 'text-[var(--slate-400)]', label: '停用' },
  suspended: { bg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', label: '暂停' },
  idle: { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', label: '空闲' },
  pending: { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', label: '待审核' },
  approved: { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', label: '已通过' },
  rejected: { bg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', label: '已拒绝' },
  healthy: { bg: 'bg-emerald-500', text: 'text-white', label: '正常' },
  warning: { bg: 'bg-amber-500', text: 'text-white', label: '告警' },
  error: { bg: 'bg-rose-500', text: 'text-white', label: '异常' },
  completed: { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', label: '已完成' },
  processing: { bg: 'bg-[#3366FF]/15', text: 'text-[#3366FF]', label: '处理中' },
  failed: { bg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', label: '失败' },
  cancelled: { bg: 'bg-[var(--slate-700)]', text: 'text-[var(--slate-400)]', label: '已取消' },
  normal: { bg: 'bg-[var(--slate-700)]', text: 'text-[var(--slate-400)]', label: '普通' },
  sensitive: { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', label: '敏感' },
  highrisk: { bg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', label: '高危' },
};
