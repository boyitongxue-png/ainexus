import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  RefreshCw,
  Trash2,
  X,
  Key,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Filter,
  Pause,
  Play,
} from 'lucide-react';
import { upstreamKeys as initialKeys, modelCatalog } from '@/lib/mockData';
import type { UpstreamKey } from '@/lib/mockData';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
type ModelTypeFilter = 'all' | 'text' | 'image' | 'video' | 'audio';

interface UpstreamKeyExtended extends UpstreamKey {
  keyAlias: string;
  modelType: ModelTypeFilter;
  healthStatus: HealthStatus;
  availableModels: number;
  lastCheckTime: string;
  workspace: string;
}

/* ------------------------------------------------------------------ */
/*  Extended mock data                                                 */
/* ------------------------------------------------------------------ */
const extendedKeys: UpstreamKeyExtended[] = initialKeys.map((k) => {
  const models = modelCatalog.filter((m) => m.provider === k.provider);
  const modelType = models.length > 0
    ? (models.some((m) => m.type === 'image') ? 'image' : models.some((m) => m.type === 'video') ? 'video' : models.some((m) => m.type === 'audio') ? 'audio' : 'text')
    : 'text';
  const healthMap: Record<string, HealthStatus> = { active: 'healthy', inactive: 'unhealthy', expired: 'degraded' };
  return {
    ...k,
    keyAlias: k.name,
    modelType: modelType as ModelTypeFilter,
    healthStatus: healthMap[k.status] || 'healthy',
    availableModels: models.length,
    lastCheckTime: k.updatedAt + ' 14:32',
    workspace: k.provider === 'OpenAI' ? '生产组' : k.provider === 'Anthropic' ? '全部工作区' : '测试组',
  };
});

const providers = ['全部', 'OpenAI', 'Anthropic', 'Stability AI', 'Runway', 'Pika', 'Cohere', 'Google'];

const modelTypeLabels: Record<ModelTypeFilter, string> = {
  all: '全部',
  text: '文本',
  image: '图片生成',
  video: '视频生成',
  audio: '语音',
};

/* ------------------------------------------------------------------ */
/*  Health badge                                                       */
/* ------------------------------------------------------------------ */
function healthBadgeConfig(status: HealthStatus) {
  switch (status) {
    case 'healthy':
      return { cls: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20', icon: CheckCircle2, label: '正常' };
    case 'degraded':
      return { cls: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20', icon: AlertTriangle, label: '降级' };
    case 'unhealthy':
      return { cls: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20', icon: XCircle, label: '异常' };
  }
}

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

/* ------------------------------------------------------------------ */
/*  Modal component                                                    */
/* ------------------------------------------------------------------ */
function Modal({
  title,
  onClose,
  children,
  maxWidth = '560px',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        style={{ maxWidth, width: '100%' }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="font-space text-[18px] font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function ConsoleUpstreamKeys() {
  const [keys, setKeys] = useState<UpstreamKeyExtended[]>(extendedKeys);
  const [providerFilter, setProviderFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modelTypeFilter, setModelTypeFilter] = useState<ModelTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKey, setEditingKey] = useState<UpstreamKeyExtended | null>(null);
  const [deletingKey, setDeletingKey] = useState<UpstreamKeyExtended | null>(null);
  const [testingKey, setTestingKey] = useState<UpstreamKeyExtended | null>(null);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [togglingKey, setTogglingKey] = useState<UpstreamKeyExtended | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ── Form state ── */
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('OpenAI');
  const [formApiKey, setFormApiKey] = useState('');
  const [formDefaultUse, setFormDefaultUse] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  /* ── Filter logic ── */
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      if (providerFilter !== '全部' && k.provider !== providerFilter) return false;
      if (statusFilter !== 'all' && k.status !== statusFilter) return false;
      if (modelTypeFilter !== 'all' && k.modelType !== modelTypeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          k.name.toLowerCase().includes(q) ||
          k.provider.toLowerCase().includes(q) ||
          k.keyAlias.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [keys, providerFilter, statusFilter, modelTypeFilter, searchQuery]);

  /* ── Test key ── */
  const handleTestKey = useCallback((key: UpstreamKeyExtended) => {
    setTestingKey(key);
    setTestResult(null);
    setTimeout(() => {
      if (key.status === 'active') {
        setTestResult({ status: 'success', message: `Key 验证成功！${key.provider} API 响应正常，可用模型 ${key.availableModels} 个。` });
      } else {
        setTestResult({ status: 'error', message: `Key 验证失败！无法连接到 ${key.provider} API，请检查 Key 是否正确。` });
      }
      // Auto-close test modal after 2 seconds on success
      if (key.status === 'active') {
        setTimeout(() => {
          setTestingKey(null);
          setTestResult(null);
        }, 2500);
      }
    }, 1500);
  }, []);

  /* ── Copy key preview ── */
  const handleCopy = useCallback((id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  /* ── Add key ── */
  const handleAddKey = useCallback(() => {
    if (!formName.trim() || formName.length < 2) {
      setFormError('Key 名称必填，2-50 字符');
      return;
    }
    if (!formApiKey.trim()) {
      setFormError('API Key 必填');
      return;
    }
    const newKey: UpstreamKeyExtended = {
      id: `uk_${Date.now()}`,
      name: formName.trim(),
      provider: formProvider,
      keyPreview: `sk-...${formApiKey.slice(-4)}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      keyAlias: formName.trim(),
      modelType: 'text',
      healthStatus: 'healthy',
      availableModels: Math.floor(Math.random() * 5) + 1,
      lastCheckTime: '刚刚',
      workspace: formDefaultUse ? '全部工作区' : '未分配',
    };
    setKeys((prev) => [...prev, newKey]);
    resetForm();
    setShowAddModal(false);
  }, [formName, formProvider, formApiKey, formDefaultUse]);

  /* ── Edit key ── */
  const handleEditKey = useCallback(() => {
    if (!editingKey) return;
    if (!formName.trim() || formName.length < 2) {
      setFormError('Key 名称必填，2-50 字符');
      return;
    }
    setKeys((prev) =>
      prev.map((k) =>
        k.id === editingKey.id
          ? { ...k, name: formName.trim(), keyAlias: formName.trim(), provider: formProvider, updatedAt: new Date().toISOString().split('T')[0] }
          : k
      )
    );
    resetForm();
    setEditingKey(null);
  }, [editingKey, formName, formProvider]);

  /* ── Delete key ── */
  const handleDeleteKey = useCallback(() => {
    if (!deletingKey) return;
    setKeys((prev) => prev.filter((k) => k.id !== deletingKey.id));
    setDeletingKey(null);
  }, [deletingKey]);

  /* ── Toggle status ── */
  const handleToggleStatus = useCallback(() => {
    if (!togglingKey) return;
    const newStatus = togglingKey.status === 'active' ? 'inactive' : 'active';
    setKeys((prev) =>
      prev.map((k) =>
        k.id === togglingKey.id
          ? {
              ...k,
              status: newStatus,
              healthStatus: newStatus === 'active' ? 'healthy' : 'unhealthy',
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : k
      )
    );
    setTogglingKey(null);
  }, [togglingKey]);

  /* ── Reset form ── */
  const resetForm = useCallback(() => {
    setFormName('');
    setFormProvider('OpenAI');
    setFormApiKey('');
    setFormDefaultUse(false);
    setFormNotes('');
    setFormError('');
  }, []);

  /* ── Open edit modal ── */
  const openEdit = useCallback((key: UpstreamKeyExtended) => {
    setEditingKey(key);
    setFormName(key.name);
    setFormProvider(key.provider);
    setFormApiKey('');
    setFormNotes('');
    setFormError('');
  }, []);

  /* ── Open add modal ── */
  const openAdd = useCallback(() => {
    resetForm();
    setShowAddModal(true);
  }, [resetForm]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">上游 API Key</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">
            管理您自有的大模型供应商 API Key，平台将通过这些 Key 代理调用底层 API。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 Key 名称或供应商..."
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-9 pr-4 py-2.5 w-64 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]"
            />
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors hover:shadow-glow-hover"
          >
            <Plus className="w-4 h-4" />
            添加上游 Key
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Provider filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-[var(--slate-500)] mr-1" />
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all ${
                providerFilter === p
                  ? 'bg-[#3366FF] text-white'
                  : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)]'
              }`}
            >
              {p} ({p === '全部' ? keys.length : keys.filter((k) => k.provider === p).length})
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-[var(--dark-border)]" />
        {/* Status filter */}
        {(['all', 'active', 'inactive'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all ${
              statusFilter === s
                ? 'bg-[#3366FF] text-white'
                : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
            }`}
          >
            {s === 'all' ? '全部' : s === 'active' ? '已启用' : '已禁用'}
          </button>
        ))}
        <div className="w-px h-5 bg-[var(--dark-border)]" />
        {/* Model type filter */}
        <select
          value={modelTypeFilter}
          onChange={(e) => setModelTypeFilter(e.target.value as ModelTypeFilter)}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-[12px] rounded-full px-3 py-1.5 outline-none focus:border-[#3366FF]"
        >
          {(Object.keys(modelTypeLabels) as ModelTypeFilter[]).map((k) => (
            <option key={k} value={k}>{modelTypeLabels[k]}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      {filteredKeys.length === 0 ? (
        /* ── Empty state ── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center"
        >
          <Key className="w-16 h-16 text-[var(--slate-600)] mx-auto mb-4" />
          <h3 className="font-space text-[18px] font-semibold text-[var(--slate-400)] mb-2">暂无上游 API Key</h3>
          <p className="text-[14px] text-[var(--slate-500)] mb-6">添加上游 Key 以开始使用平台代理调用服务</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加上游 Key
          </button>
        </motion.div>
      ) : (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">供应商</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">Key 别名</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">模型类型</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">健康状态</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">可用模型</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">最后检测</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                <AnimatePresence>
                  {filteredKeys.map((key, i) => {
                    const hcfg = healthBadgeConfig(key.healthStatus);
                    const HealthIcon = hcfg.icon;
                    return (
                      <motion.tr
                        key={key.id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="hover:bg-[var(--dark-hover)] transition-colors group"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#3366FF]/15 flex items-center justify-center text-[11px] font-bold text-[#3366FF]">
                              {key.provider.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[13px] text-white font-medium">{key.provider}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[13px] text-white font-medium">{key.keyAlias}</td>
                        <td className="py-3.5 px-5">
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--dark-hover)] text-[var(--slate-300)] border border-[var(--dark-border)]">
                            {modelTypeLabels[key.modelType]}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${hcfg.cls}`}>
                            <HealthIcon className="w-3 h-3" />
                            {hcfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[13px] text-[var(--dark-text)] font-jetbrains">{key.availableModels} 个</td>
                        <td className="py-3.5 px-5 text-[12px] text-[var(--slate-400)]">{key.lastCheckTime}</td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                            key.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[var(--slate-700)] text-[var(--slate-400)]'
                          }`}>
                            {key.status === 'active' ? '已启用' : '已禁用'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleTestKey(key)}
                              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#22D3EE] hover:bg-[var(--dark-hover)] transition-colors"
                              title="检测"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEdit(key)}
                              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors"
                              title="编辑"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setTogglingKey(key)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                key.status === 'active'
                                  ? 'text-[var(--slate-400)] hover:text-[#F59E0B] hover:bg-[var(--dark-hover)]'
                                  : 'text-[var(--slate-400)] hover:text-[#10B981] hover:bg-[var(--dark-hover)]'
                              }`}
                              title={key.status === 'active' ? '禁用' : '启用'}
                            >
                              {key.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeletingKey(key)}
                              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[var(--dark-border)] flex items-center justify-between text-[12px] text-[var(--slate-400)]">
            <span>共 {filteredKeys.length} 条记录</span>
            <span>上次更新: 刚刚</span>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {(showAddModal || editingKey) && (
          <Modal
            title={editingKey ? '编辑上游 API Key' : '添加上游 API Key'}
            onClose={() => {
              setShowAddModal(false);
              setEditingKey(null);
              resetForm();
            }}
          >
            <div className="space-y-4 mt-2">
              {/* Name */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">
                  Key 名称 <span className="text-[#F43F5E]">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
                  placeholder="如: 生产环境 OpenAI"
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]"
                />
              </div>

              {/* Provider */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">
                  供应商 <span className="text-[#F43F5E]">*</span>
                </label>
                <select
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors"
                >
                  {providers.filter((p) => p !== '全部').map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">
                  API Key <span className="text-[#F43F5E]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formApiKey}
                    onChange={(e) => { setFormApiKey(e.target.value); setFormError(''); }}
                    placeholder="粘贴您的供应商 API Key"
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 pr-20 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]"
                  />
                  {!editingKey && formApiKey && (
                    <button
                      onClick={() => handleCopy('form-apikey', formApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--slate-400)] hover:text-white transition-colors"
                    >
                      {copiedId === 'form-apikey' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] text-[var(--slate-500)] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
                  Key 将以加密方式存储，平台人员无法查看明文
                </p>
              </div>

              {/* Default use */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="default-use"
                  checked={formDefaultUse}
                  onChange={(e) => setFormDefaultUse(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--dark-border)] bg-[var(--dark-bg)] text-[#3366FF] focus:ring-[#3366FF]"
                />
                <label htmlFor="default-use" className="text-[13px] text-[var(--dark-text)] cursor-pointer">
                  设为默认使用
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">备注</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="用途说明..."
                  rows={2}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)] resize-none"
                />
              </div>

              {/* Error */}
              {formError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-[#F43F5E] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {formError}
                </motion.p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingKey(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={editingKey ? handleEditKey : handleAddKey}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
                >
                  {editingKey ? '保存修改' : '保存'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Test Key Modal ── */}
      <AnimatePresence>
        {testingKey && (
          <Modal title="检测 Key" onClose={() => { setTestingKey(null); setTestResult(null); }}>
            <div className="text-center py-4">
              <div className="mb-4">
                <div className="w-10 h-10 rounded-full bg-[#3366FF]/15 flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className={`w-5 h-5 text-[#3366FF] ${!testResult ? 'animate-spin' : ''}`} />
                </div>
                <p className="text-[14px] text-white font-medium">
                  {!testResult ? `正在检测 ${testingKey.provider} Key...` : '检测完成'}
                </p>
                <p className="text-[12px] text-[var(--slate-400)] mt-1">{testingKey.keyAlias}</p>
              </div>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border ${
                    testResult.status === 'success'
                      ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
                      : 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'
                  }`}
                >
                  <div className="flex items-center gap-2 justify-center mb-1">
                    {testResult.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span className="text-[13px] font-medium">
                      {testResult.status === 'success' ? '验证成功' : '验证失败'}
                    </span>
                  </div>
                  <p className="text-[12px]">{testResult.message}</p>
                </motion.div>
              )}
              {testResult?.status === 'error' && (
                <button
                  onClick={() => { setTestingKey(null); setTestResult(null); }}
                  className="mt-4 px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                >
                  关闭
                </button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Toggle Status Confirmation ── */}
      <AnimatePresence>
        {togglingKey && (
          <Modal
            title={togglingKey.status === 'active' ? '禁用 Key' : '启用 Key'}
            onClose={() => setTogglingKey(null)}
            maxWidth="400px"
          >
            <div className="py-2">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                <div>
                  <p className="text-[14px] text-white">
                    确定要{togglingKey.status === 'active' ? '禁用' : '启用'} Key &quot;{togglingKey.keyAlias}&quot; 吗？
                  </p>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">
                    {togglingKey.status === 'active'
                      ? '禁用后，该 Key 将不再用于代理调用，关联的路由策略可能受到影响。'
                      : '启用后，该 Key 将恢复用于代理调用。'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setTogglingKey(null)}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
                    togglingKey.status === 'active'
                      ? 'bg-[#F59E0B] text-white hover:bg-[#D97706]'
                      : 'bg-[#10B981] text-white hover:bg-[#059669]'
                  }`}
                >
                  {togglingKey.status === 'active' ? '确认禁用' : '确认启用'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {deletingKey && (
          <Modal title="删除 Key" onClose={() => setDeletingKey(null)} maxWidth="400px">
            <div className="py-2">
              <div className="flex items-start gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-[#F43F5E] mt-0.5" />
                <div>
                  <p className="text-[14px] text-white">
                    确定要删除 Key &quot;{deletingKey.keyAlias}&quot; 吗？
                  </p>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">
                    此操作不可撤销。删除后，关联的路由策略将受到影响。
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeletingKey(null)}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteKey}
                  className="px-5 py-2 bg-[#F43F5E] text-white text-[13px] font-semibold rounded-lg hover:bg-[#E11D48] transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
