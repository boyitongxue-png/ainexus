import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import {
  Webhook,
  Plus,
  Play,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Copy,
  CheckCheck,
  RefreshCw,
  Send,
  Info,
  Code2,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  lastPushResult?: string;
  lastPushTime?: string;
}

const EVENT_OPTIONS = [
  { value: 'task.created', label: 'task.created', desc: '任务创建' },
  { value: 'task.started', label: 'task.started', desc: '任务开始处理' },
  { value: 'task.completed', label: 'task.completed', desc: '任务完成' },
  { value: 'task.failed', label: 'task.failed', desc: '任务失败' },
  { value: 'task.cancelled', label: 'task.cancelled', desc: '任务取消' },
];

const initialWebhooks: WebhookData[] = [
  {
    id: 'wh_1',
    name: '生产环境回调',
    url: 'https://api.myapp.com/webhook/ai',
    events: ['task.completed', 'task.failed'],
    secret: 'whsec_a1b2c3d4e5f6789012345678',
    status: 'active',
    lastPushResult: '200 OK',
    lastPushTime: '2 分钟前',
  },
  {
    id: 'wh_2',
    name: 'Slack 通知',
    url: 'https://hooks.slack.com/services/xxx/yyy',
    events: ['task.completed'],
    secret: 'whsec_slack9876543210abcdef',
    status: 'active',
    lastPushResult: '200 OK',
    lastPushTime: '15 分钟前',
  },
  {
    id: 'wh_3',
    name: '测试环境',
    url: 'https://test.myapp.com/hook',
    events: ['task.created', 'task.started', 'task.completed', 'task.failed', 'task.cancelled'],
    secret: 'whsec_test1234567890abcdef',
    status: 'inactive',
    lastPushResult: undefined,
    lastPushTime: undefined,
  },
];

function generateSecret(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'whsec_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Webhooks() {

  const utils = trpc.useUtils();
  const { data: webhookData } = trpc.webhook.list.useQuery();
  const webhookCreate = trpc.webhook.create.useMutation({ onSuccess: () => utils.webhook.list.invalidate() });
  const webhookUpdate = trpc.webhook.update.useMutation({ onSuccess: () => utils.webhook.list.invalidate() });
  const webhookDelete = trpc.webhook.delete.useMutation({ onSuccess: () => utils.webhook.list.invalidate() });
  const apiWebhooks = useMemo(() => {
    if (!webhookData) return [];
    return webhookData.map((w: any) => ({
      id: w.id, name: w.events ? String(w.events) : 'Webhook', url: w.webhookUrl || '',
      events: Array.isArray(w.events) ? w.events : ['recharge', 'error'], secret: w.secret || '',
      status: w.status === 'active' ? 'active' : 'inactive',
      lastTriggered: w.lastTriggered ? new Date(w.lastTriggered).toLocaleString('zh-CN') : '从未触发',
      createdAt: w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : '',
    }));
  }, [webhookData]);

  const [webhooks, setWebhooks] = useState<WebhookData[]>(initialWebhooks);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookData | null>(null);
  const [deletingWebhook, setDeletingWebhook] = useState<WebhookData | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<WebhookData | null>(null);
  const [testResult, setTestResult] = useState<{ status: number; time: number } | null>(null);

  const [form, setForm] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: generateSecret(),
    testAfterSave: false,
  });

  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecretFor, setShowSecretFor] = useState<string | null>(null);

  const handleToggleStatus = useCallback((id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === id ? { ...wh, status: wh.status === 'active' ? 'inactive' : 'active' } : wh
      )
    );
  }, []);

  const handleCreate = useCallback(() => {
    if (!form.name || !form.url || form.events.length === 0) return;

    const newWebhook: WebhookData = {
      id: `wh_${Date.now()}`,
      name: form.name,
      url: form.url,
      events: form.events,
      secret: form.secret,
      status: 'active',
    };

    setWebhooks((prev) => [...prev, newWebhook]);
    setCreateOpen(false);
    setForm({ name: '', url: '', events: [], secret: generateSecret(), testAfterSave: false });

    if (form.testAfterSave) {
      setTimeout(() => {
        setTestingWebhook(newWebhook);
        setTestResult({ status: 200, time: 128 });
      }, 300);
    }
  }, [form]);

  const handleUpdate = useCallback(() => {
    if (!editingWebhook || !form.name || !form.url || form.events.length === 0) return;

    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === editingWebhook.id
          ? { ...wh, name: form.name, url: form.url, events: form.events, secret: form.secret }
          : wh
      )
    );
    setEditingWebhook(null);
    resetForm();
  }, [editingWebhook, form]);

  const handleDelete = useCallback(() => {
    if (!deletingWebhook) return;
    setWebhooks((prev) => prev.filter((wh) => wh.id !== deletingWebhook.id));
    setDeletingWebhook(null);
  }, [deletingWebhook]);

  const handleTest = useCallback(() => {
    setTestResult({ status: 200, time: Math.floor(Math.random() * 300) + 50 });
  }, []);

  const resetForm = useCallback(() => {
    setForm({ name: '', url: '', events: [], secret: generateSecret(), testAfterSave: false });
  }, []);

  const openEdit = useCallback(
    (wh: WebhookData) => {
      setEditingWebhook(wh);
      setForm({
        name: wh.name,
        url: wh.url,
        events: [...wh.events],
        secret: wh.secret,
        testAfterSave: false,
      });
    },
    []
  );

  const toggleEvent = useCallback((event: string) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  }, []);

  const selectAllEvents = useCallback(() => {
    setForm((prev) => ({ ...prev, events: EVENT_OPTIONS.map((e) => e.value) }));
  }, []);

  const clearAllEvents = useCallback(() => {
    setForm((prev) => ({ ...prev, events: [] }));
  }, []);

  const maskSecret = (secret: string) => {
    if (secret.length <= 12) return '••••••••';
    return secret.slice(0, 8) + '••••••••••••••••' + secret.slice(-4);
  };

  const eventBadgeColors: Record<string, string> = {
    'task.created': '#3366FF',
    'task.started': '#22D3EE',
    'task.completed': '#10B981',
    'task.failed': '#EF4444',
    'task.cancelled': '#F59E0B',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-[1.25]">Webhook</h1>
          <p className="mt-1 text-[var(--slate-400)]">配置异步任务的回调通知，接收任务完成、失败等事件推送。</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] hover:shadow-[0_0_60px_rgba(51,102,255,0.25)] hover:-translate-y-px active:scale-[0.97] transition-all"
        >
          <Plus className="w-4 h-4" />
          添加 Webhook
        </button>
      </motion.div>

      {/* Info Section */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(51,102,255,0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-[#3366FF]" />
          </div>
          <div>
            <h3 className="font-space text-lg font-semibold text-white mb-2">什么是 Webhook？</h3>
            <p className="text-sm text-[var(--slate-400)] leading-relaxed mb-3">
              Webhook 用于接收异步任务（图片/视频生成）的事件通知。当任务状态发生变化时，平台会向配置的 URL 发送 HTTP POST 请求，
              包含任务的当前状态和结果信息。您可以使用 Webhook 实现自动化的后处理流程，如通知用户、保存结果到数据库等。
            </p>
            <div className="flex items-center gap-4 text-xs text-[var(--slate-500)]">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                支持自定义签名验证
              </span>
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                失败自动重试 3 次
              </span>
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                支持测试推送
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Webhook Table */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)] hover:bg-[var(--dark-sidebar)]">
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">Webhook 名称</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">回调 URL</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">事件类型</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">签名密钥</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">状态</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">最近推送</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((wh, idx) => (
                <motion.tr
                  key={wh.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="border-b border-[var(--dark-border)] hover:bg-[var(--dark-hover)] transition-colors"
                >
                  <TableCell className="px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(34,211,238,0.15)] flex items-center justify-center flex-shrink-0">
                        <Webhook className="w-4 h-4 text-[#22D3EE]" />
                      </div>
                      <span className="text-sm font-medium text-white">{wh.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <span className="font-jetbrains text-xs text-[#7A9FFF] truncate max-w-[200px] block">
                      {wh.url}
                    </span>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span
                          key={ev}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${eventBadgeColors[ev] || '#3366FF'}15`,
                            color: eventBadgeColors[ev] || '#3366FF',
                          }}
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-jetbrains text-xs text-[var(--slate-400)]">
                        {showSecretFor === wh.id ? wh.secret : maskSecret(wh.secret)}
                      </span>
                      <button
                        onClick={() => setShowSecretFor(showSecretFor === wh.id ? null : wh.id)}
                        className="p-1 rounded text-[var(--slate-500)] hover:text-white transition-colors"
                      >
                        {showSecretFor === wh.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <button
                      onClick={() => handleToggleStatus(wh.id)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        wh.status === 'active'
                          ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981]'
                          : 'bg-[rgba(148,163,184,0.15)] text-[#94A3B8]'
                      }`}
                    >
                      {wh.status === 'active' ? '启用' : '禁用'}
                    </button>
                  </TableCell>
                  <TableCell className="px-4">
                    {wh.lastPushResult ? (
                      <div>
                        <span className="text-xs text-[#10B981]">{wh.lastPushResult}</span>
                        <p className="text-xs text-[var(--slate-500)]">{wh.lastPushTime}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--slate-500)]">从未推送</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(wh)}
                        className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTestingWebhook(wh);
                          setTestResult(null);
                        }}
                        className="p-2 rounded-lg text-[var(--slate-500)] hover:text-[#10B981] hover:bg-[var(--dark-hover)] transition-colors"
                        title="测试"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingWebhook(wh)}
                        className="p-2 rounded-lg text-[var(--slate-500)] hover:text-[#EF4444] hover:bg-[var(--dark-hover)] transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Create/Edit Webhook Dialog */}
      <Dialog
        open={createOpen || !!editingWebhook}
        onOpenChange={() => {
          setCreateOpen(false);
          setEditingWebhook(null);
          resetForm();
        }}
      >
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-space">
              {editingWebhook ? '编辑 Webhook' : '添加 Webhook'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Webhook Name */}
            <div>
              <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                Webhook 名称 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例如：生产环境回调"
                className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
              />
            </div>

            {/* Callback URL */}
            <div>
              <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                回调 URL <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-app.com/webhook"
                className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
              />
            </div>

            {/* Event Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[var(--slate-300)]">
                  订阅事件 <span className="text-[#EF4444]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button onClick={selectAllEvents} className="text-xs text-[#3366FF] hover:text-[#7A9FFF] transition-colors">
                    全选
                  </button>
                  <span className="text-[var(--slate-600)]">|</span>
                  <button onClick={clearAllEvents} className="text-xs text-[var(--slate-400)] hover:text-white transition-colors">
                    取消全选
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {EVENT_OPTIONS.map((ev) => {
                  const isChecked = form.events.includes(ev.value);
                  return (
                    <label
                      key={ev.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#3366FF] bg-[rgba(51,102,255,0.1)]'
                          : 'border-[var(--dark-border)] hover:border-[var(--slate-500)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEvent(ev.value)}
                        className="w-4 h-4 accent-[#3366FF]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium"
                            style={{ color: eventBadgeColors[ev.value] }}
                          >
                            {ev.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--slate-500)] mt-0.5">{ev.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Signing Secret */}
            <div>
              <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                签名密钥
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={form.secret}
                    readOnly
                    className="w-full h-10 px-3 pr-20 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm font-jetbrains text-[var(--slate-400)] outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(form.secret).catch(() => {});
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 2000);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-[var(--slate-500)] hover:text-white transition-colors"
                  >
                    {copiedSecret ? <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => setForm((prev) => ({ ...prev, secret: generateSecret() }))}
                  className="p-2.5 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                  title="重新生成"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[var(--slate-500)] mt-1">
                用于验证回调请求的签名，请妥善保管
              </p>
            </div>

            {/* Test after save */}
            {!editingWebhook && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.testAfterSave}
                  onChange={(e) => setForm((prev) => ({ ...prev, testAfterSave: e.target.checked }))}
                  className="w-4 h-4 accent-[#3366FF]"
                />
                <span className="text-sm text-[var(--slate-300)]">保存后立即发送测试推送</span>
              </label>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setCreateOpen(false);
                  setEditingWebhook(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={editingWebhook ? handleUpdate : handleCreate}
                disabled={!form.name || !form.url || form.events.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingWebhook ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingWebhook ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={!!testingWebhook} onOpenChange={() => { setTestingWebhook(null); setTestResult(null); }}>
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-space">测试推送</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-[var(--slate-400)] mb-4">
              向 <span className="text-white font-jetbrains text-xs">{testingWebhook?.url}</span> 发送测试事件
            </p>

            {!testResult ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-[#3366FF] animate-spin" />
                  <span className="text-sm text-[var(--slate-300)]">正在发送测试请求...</span>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
                  <Check className="w-5 h-5 text-[#10B981]" />
                  <div>
                    <p className="text-sm text-white font-medium">推送成功</p>
                    <p className="text-xs text-[#10B981]">HTTP {testResult.status}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-[var(--slate-400)]">响应时间</span>
                  <span className="text-white font-jetbrains">{testResult.time}ms</span>
                </div>
                <div className="bg-[var(--dark-bg)] rounded-lg p-4">
                  <p className="text-xs text-[var(--slate-500)] mb-2">请求体预览：</p>
                  <pre className="text-xs font-jetbrains text-[#7A9FFF] overflow-x-auto">
{`{
  "event": "task.completed",
  "data": {
    "task_id": "task_12345",
    "type": "image",
    "status": "completed",
    "result": {
      "urls": ["https://cdn.example.com/img.jpg"]
    }
  }
}`}
                  </pre>
                </div>
              </motion.div>
            )}

            <div className="flex justify-end mt-4">
              {!testResult ? (
                <button
                  onClick={() => { setTestingWebhook(null); setTestResult(null); }}
                  className="px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTestResult(null);
                    setTimeout(handleTest, 100);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] active:scale-[0.97] transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新测试
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingWebhook} onOpenChange={() => setDeletingWebhook(null)}>
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white font-space">确认删除</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-[var(--slate-400)]">
              确定要删除 Webhook <span className="text-white font-medium">{deletingWebhook?.name}</span> 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setDeletingWebhook(null)}
                className="px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-[#EF4444] text-white text-sm font-semibold rounded-full hover:bg-[#DC2626] active:scale-[0.97] transition-all"
              >
                确认删除
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
