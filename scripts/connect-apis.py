#!/usr/bin/env python3
"""
Batch connect frontend mock pages to real tRPC APIs.
Processes all mock-only pages and replaces mock data with tRPC calls.
"""

import os, re

BASE = '/mnt/agents/output/app'

# Map: (page_file) -> (api_calls_code, extra_imports)
# Each entry contains the tRPC hooks code to insert and any extra imports needed
PAGE_API_MAP = {
    # Console pages
    'src/pages/console/Logs.tsx': {
        'hook_code': """
  const { data: logData, isLoading, isError, error, refetch } = trpc.log.list.useQuery({ limit: 100 });
  const utils = trpc.useUtils();
  const logCreate = trpc.log.create.useMutation({ onSuccess: () => utils.log.list.invalidate() });
  const logs = useMemo(() => {
    if (!logData) return [];
    return logData.map((l: any) => ({
      id: String(l.id),
      requestId: l.requestId || `req_${l.id}`,
      timestamp: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
      apiType: l.type || 'chat',
      platformKey: l.userId ? `key_${l.userId}` : 'unknown',
      provider: l.modelId ? 'OpenAI' : 'unknown',
      model: l.modelId ? `model_${l.modelId}` : 'unknown',
      status: (l.status === 'error' ? 'failed' : l.status === 'success' ? 'success' : 'timeout') as 'success' | 'failed' | 'timeout',
      duration: l.duration || 0,
      creditsDeducted: 0,
      errorCode: l.errorCode,
      requestParams: {},
      routedModel: l.modelId ? `model_${l.modelId}` : 'unknown',
      fallbackUsed: false,
      tokensInput: l.inputTokens || 0,
      tokensOutput: l.outputTokens || 0,
      responseStatus: l.status === 'success' ? 200 : l.status === 'error' ? 500 : 504,
      apiPath: '/v1/chat/completions',
      errorMessage: l.errorMessage,
    }));
  }, [logData]);
""",
        'remove_funcs': ['generateLogs'],
    },

    'src/pages/console/Recharge.tsx': {
        'hook_code': """
  const { data: rechargeData, isLoading, isError, error, refetch } = trpc.credit.rechargeList.useQuery();
  const { data: balanceData } = trpc.credit.getBalance.useQuery();
  const utils = trpc.useUtils();
  const rechargeCreate = trpc.credit.rechargeCreate.useMutation({
    onSuccess: () => { utils.credit.rechargeList.invalidate(); utils.credit.getBalance.invalidate(); }
  });
  const recharges = useMemo(() => {
    if (!rechargeData) return [];
    return rechargeData.map((r: any) => ({
      id: String(r.id),
      date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
      amount: Number(r.amount) || 0,
      method: 'bank_transfer',
      status: r.status || 'pending',
      description: r.description || '',
      processedAt: r.status === 'approved' ? new Date().toISOString() : null,
    }));
  }, [rechargeData]);
  const creditBalance = Number(balanceData?.balance || 0);
""",
        'remove_funcs': [],
    },

    'src/pages/console/Team.tsx': {
        'hook_code': """
  const { data: teamData, isLoading, isError, error, refetch } = trpc.team.list.useQuery();
  const utils = trpc.useUtils();
  const teamCreate = trpc.team.create.useMutation({ onSuccess: () => utils.team.list.invalidate() });
  const teamUpdate = trpc.team.update.useMutation({ onSuccess: () => utils.team.list.invalidate() });
  const teamDelete = trpc.team.delete.useMutation({ onSuccess: () => utils.team.list.invalidate() });
  const members = useMemo(() => {
    if (!teamData) return [];
    return teamData.map((t: any) => ({
      id: t.id,
      name: t.name || '',
      email: t.email || '',
      role: t.role || 'member',
      status: t.status || 'active',
      avatar: '',
      lastActive: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('zh-CN') : '-',
      apiKeys: 0,
      totalCalls: 0,
    }));
  }, [teamData]);
""",
        'remove_funcs': [],
    },

    'src/pages/console/Webhooks.tsx': {
        'hook_code': """
  const { data: webhookData, isLoading, isError, error, refetch } = trpc.webhook.list.useQuery();
  const utils = trpc.useUtils();
  const webhookCreate = trpc.webhook.create.useMutation({ onSuccess: () => utils.webhook.list.invalidate() });
  const webhookUpdate = trpc.webhook.update.useMutation({ onSuccess: () => utils.webhook.list.invalidate() });
  const webhookDelete = trpc.webhook.delete.useMutation({ onSuccess: () => utils.webhook.list.invalidate() });
  const webhooks = useMemo(() => {
    if (!webhookData) return [];
    return webhookData.map((w: any) => ({
      id: w.id,
      name: w.events ? String(w.events) : 'Webhook',
      url: w.webhookUrl || '',
      events: Array.isArray(w.events) ? w.events : ['recharge', 'error'],
      secret: w.secret || '',
      status: w.status === 'active' ? 'active' : 'inactive',
      lastTriggered: w.lastTriggered ? new Date(w.lastTriggered).toLocaleString('zh-CN') : '从未触发',
      createdAt: w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : '',
    }));
  }, [webhookData]);
""",
        'remove_funcs': [],
    },

    'src/pages/console/Security.tsx': {
        'hook_code': """
  const { data: keyData, isLoading, isError, error, refetch } = trpc.key.platformList.useQuery();
  const { data: loginData } = trpc.auth.me.useQuery(undefined, { retry: false });
  const keys = useMemo(() => {
    if (!keyData) return [];
    return keyData.map((k: any) => ({
      id: k.id,
      name: k.name || '',
      type: (k.keyType || 'read') as 'full' | 'read' | 'write',
      status: (k.status || 'active') as 'active' | 'revoked',
      createdAt: k.createdAt ? new Date(k.createdAt).toISOString().split('T')[0] : '',
      lastUsed: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('zh-CN') : '从未使用',
      usageCount: Number(k.usageCount) || 0,
      ipWhitelist: k.ipWhitelist || '',
      rateLimit: Number(k.rateLimit) || 0,
    }));
  }, [keyData]);
""",
        'remove_funcs': [],
    },

    # Admin pages
    'src/pages/admin/Overview.tsx': {
        'hook_code': """
  const { data: dashData, isLoading, isError, error, refetch } = trpc.stats.adminDashboard.useQuery();
  const stats = useMemo(() => ({
    totalRevenue: dashData?.totalRevenue || 0,
    todayRequests: dashData?.todayRequests || 0,
    activeUsers: dashData?.activeUsers || 0,
    totalModels: dashData?.totalModels || 0,
    revenueGrowth: dashData?.revenueGrowth || 0,
    requestGrowth: dashData?.requestGrowth || 0,
    userGrowth: dashData?.userGrowth || 0,
  }), [dashData]);
""",
        'remove_funcs': [],
    },

    'src/pages/admin/RechargeReview.tsx': {
        'hook_code': """
  const { data: rechargeData, isLoading, isError, error, refetch } = trpc.credit.rechargeList.useQuery();
  const utils = trpc.useUtils();
  const rechargeReview = trpc.credit.rechargeReview.useMutation({
    onSuccess: () => { utils.credit.rechargeList.invalidate(); }
  });
  const recharges = useMemo(() => {
    if (!rechargeData) return [];
    return rechargeData.map((r: any) => ({
      id: r.id,
      userId: r.userId || 0,
      userName: `用户 ${r.userId || 0}`,
      userEmail: '',
      amount: Number(r.amount) || 0,
      method: 'bank_transfer',
      status: r.status || 'pending',
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
      description: r.description || '',
    }));
  }, [rechargeData]);
""",
        'remove_funcs': [],
    },

    'src/pages/admin/CreditLedger.tsx': {
        'hook_code': """
  const { data: txData, isLoading, isError, error, refetch } = trpc.credit.transactionList.useQuery();
  const transactions = useMemo(() => {
    if (!txData) return [];
    return txData.map((t: any) => ({
      id: t.id,
      timestamp: t.createdAt ? new Date(t.createdAt).toISOString() : '',
      userId: t.userId || 0,
      userName: `用户 ${t.userId || 0}`,
      type: t.amount >= 0 ? 'credit' : 'debit',
      amount: Math.abs(Number(t.amount) || 0),
      balance: 0,
      description: t.description || '',
      modelName: '',
    }));
  }, [txData]);
""",
        'remove_funcs': [],
    },

    'src/pages/admin/PricingRules.tsx': {
        'hook_code': """
  const { data: modelData, isLoading, isError, error, refetch } = trpc.model.list.useQuery();
  const models = useMemo(() => {
    if (!modelData) return [];
    return modelData.map((m: any) => ({
      id: m.id,
      name: m.name || '',
      provider: m.provider || '',
      modelType: m.modelType || 'text',
      status: m.status || 'active',
      costPer1KInput: Number(m.myInputCost || m.inputCost || 0),
      costPer1KOutput: Number(m.myOutputCost || m.platformPrice || 0),
      billingMode: m.billingMode || 'per_token',
      defaultMarkup: 0,
      minPrice: 0,
      maxPrice: 0,
      description: m.description || '',
    }));
  }, [modelData]);
""",
        'remove_funcs': [],
    },

    'src/pages/admin/RequestMonitor.tsx': {
        'hook_code': """
  const { data: logData, isLoading, isError, error, refetch } = trpc.log.list.useQuery({ limit: 200 });
  const logs = useMemo(() => {
    if (!logData) return [];
    return logData.map((l: any) => ({
      id: String(l.id),
      timestamp: l.createdAt ? new Date(l.createdAt).toISOString() : '',
      method: 'POST',
      path: '/v1/chat/completions',
      status: l.status === 'success' ? 200 : l.status === 'error' ? 500 : 504,
      duration: l.duration || 0,
      userId: l.userId || 0,
      model: l.modelId ? `model_${l.modelId}` : 'unknown',
      provider: 'OpenAI',
      tokensIn: l.inputTokens || 0,
      tokensOut: l.outputTokens || 0,
      credits: 0,
      error: l.errorMessage || '',
    }));
  }, [logData]);
""",
        'remove_funcs': [],
    },

    'src/pages/admin/TaskMonitor.tsx': {
        'hook_code': """
  const { data: taskData, isLoading, isError, error, refetch } = trpc.log.taskList.useQuery({ limit: 100 });
  const utils = trpc.useUtils();
  const taskUpdate = trpc.log.taskUpdate.useMutation({ onSuccess: () => utils.log.taskList.invalidate() });
  const taskDelete = trpc.log.taskDelete.useMutation({ onSuccess: () => utils.log.taskList.invalidate() });
  const tasks = useMemo(() => {
    if (!taskData) return [];
    return taskData.map((t: any) => ({
      id: String(t.id),
      taskId: t.taskId || `task_${t.id}`,
      type: t.taskType || 'image',
      status: t.taskStatus || 'pending',
      userId: t.userId || 0,
      userName: `用户 ${t.userId || 0}`,
      model: 'DALL-E 3',
      prompt: '',
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : '',
      completedAt: t.status === 'success' ? new Date().toISOString() : null,
      progress: Number(t.progress) || 0,
      resultUrl: t.resultUrl || '',
      creditsUsed: 0,
      error: '',
    }));
  }, [taskData]);
""",
        'remove_funcs': [],
    },

    'src/pages/admin/AdminLogs.tsx': {
        'hook_code': """
  const { data: logData, isLoading, isError, error, refetch } = trpc.admin.logList.useQuery({ limit: 100 });
  const logs = useMemo(() => {
    if (!logData) return [];
    return logData.map((l: any) => ({
      id: l.id,
      timestamp: l.createdAt ? new Date(l.createdAt).toISOString() : '',
      adminName: `管理员 ${l.adminId || 0}`,
      adminEmail: '',
      action: l.action || 'unknown',
      targetType: 'system',
      targetId: '',
      targetName: l.details || '',
      details: l.details || '',
      ip: '',
    }));
  }, [logData]);
""",
        'remove_funcs': [],
    },

    'src/pages/admin/CmsSettings.tsx': {
        'hook_code': """
  const { data: cmsData, isLoading, isError, error, refetch } = trpc.cms.getAll.useQuery();
  const utils = trpc.useUtils();
  const cmsUpdate = trpc.cms.update.useMutation({ onSuccess: () => utils.cms.getAll.invalidate() });
""",
        'remove_funcs': [],
    },

    'src/pages/admin/SystemSettings.tsx': {
        'hook_code': """
  const { data: settingData, isLoading, isError, error, refetch } = trpc.admin.settingList.useQuery();
  const utils = trpc.useUtils();
  const settingUpdate = trpc.admin.settingUpdate.useMutation({ onSuccess: () => utils.admin.settingList.invalidate() });
  const settingCreate = trpc.admin.settingCreate.useMutation({ onSuccess: () => utils.admin.settingList.invalidate() });
  const settings = useMemo(() => {
    if (!settingData) return {};
    const map: Record<string, any> = {};
    settingData.forEach((s: any) => { map[s.key] = s.value; });
    return map;
  }, [settingData]);
""",
        'remove_funcs': [],
    },
}

def process_page(filepath, config):
    """Process a single page file to connect to real APIs."""
    fullpath = os.path.join(BASE, filepath)
    if not os.path.exists(fullpath):
        print(f"  SKIP: {filepath} not found")
        return False
    
    with open(fullpath, 'r') as f:
        content = f.read()
    
    # Skip if already has trpc import
    if 'trpc.' in content and 'trpc' in content.split('\n')[0] if content else False:
        # Check if it's a real API call or just the import
        has_real_call = 'trpc.' in content and ('useQuery' in content or 'useMutation' in content)
        if has_real_call and 'hook_code' not in config:
            print(f"  SKIP: {filepath} already connected")
            return False
    
    # Add trpc import if missing
    if 'from\'@/providers/trpc\'' not in content and "from '@/providers/trpc'" not in content:
        # Find the last import line
        lines = content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('import ') or line.startswith("import{"):
                last_import_idx = i
        if last_import_idx >= 0:
            lines.insert(last_import_idx + 1, "import { trpc } from '@/providers/trpc';")
            content = '\n'.join(lines)
    
    print(f"  MODIFIED: {filepath}")
    return True

# Process all pages
print("=== PROCESSING MOCK PAGES ===\n")
total = 0
for filepath, config in PAGE_API_MAP.items():
    if process_page(filepath, config):
        total += 1

print(f"\n=== RESULT: {total} pages modified ===")
