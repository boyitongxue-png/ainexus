import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pencil, RefreshCw, Trash2, X, Key,
  AlertTriangle, CheckCircle2, XCircle, Copy, Check,
  Filter, Pause, Play,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
type ModelTypeFilter = 'all' | 'text' | 'image' | 'video' | 'audio';

interface UpstreamKeyExtended {
  id: number;
  name: string;
  provider: string;
  keyAlias: string;
  keyPreview: string;
  modelType: ModelTypeFilter;
  healthStatus: HealthStatus;
  availableModels: number;
  lastCheckTime: string;
  workspace: string;
  status: 'active' | 'inactive' | 'expired';
  baseUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const providers = ['全部', 'OpenAI', 'Anthropic', 'Stability AI', 'Runway', 'Pika', 'Cohere', 'Google'];



function healthBadgeConfig(status: HealthStatus) {
  switch (status) {
    case 'healthy': return { cls: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20', icon: CheckCircle2, label: '正常' };
    case 'degraded': return { cls: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20', icon: AlertTriangle, label: '降级' };
    case 'unhealthy': return { cls: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20', icon: XCircle, label: '异常' };
  }
}

function mapStatusToHealth(status: string): HealthStatus {
  const map: Record<string, HealthStatus> = { active: 'healthy', inactive: 'unhealthy', expired: 'degraded' };
  return map[status] || 'unhealthy';
}

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */
function Modal({ title, onClose, children, maxWidth = '560px' }: {
  title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        style={{ maxWidth, width: '100%' }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="font-space text-[18px] font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
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
  /* ── Data from tRPC ── */
  const utils = trpc.useUtils();
  const { data: upstreamData, isLoading } = trpc.key.upstreamList.useQuery();

  const createMutation = trpc.key.upstreamCreate.useMutation({
    onSuccess: () => { utils.key.upstreamList.invalidate(); },
  });
  const updateMutation = trpc.key.upstreamUpdate.useMutation({
    onSuccess: () => { utils.key.upstreamList.invalidate(); },
  });
  const deleteMutation = trpc.key.upstreamDelete.useMutation({
    onSuccess: () => { utils.key.upstreamList.invalidate(); },
  });

  /* ── Local state ── */
  const [providerFilter, setProviderFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKey, setEditingKey] = useState<UpstreamKeyExtended | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<number | null>(null);
  const [togglingKey, setTogglingKey] = useState<UpstreamKeyExtended | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ── Form state ── */
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('OpenAI');
  const [formApiKey, setFormApiKey] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formError, setFormError] = useState('');

  /* ── Map DB data to extended format ── */
  const keys: UpstreamKeyExtended[] = useMemo(() => {
    if (!upstreamData) return [];
    return upstreamData.map((k) => ({
      id: k.id,
      name: k.name,
      provider: k.provider,
      keyAlias: k.name,
      keyPreview: k.keyPreview,
      modelType: (k.provider === 'OpenAI' ? 'text' : 'text') as ModelTypeFilter,
      healthStatus: mapStatusToHealth(k.status),
      availableModels: 0,
      lastCheckTime: new Date(k.updatedAt).toLocaleString('zh-CN'),
      workspace: '默认',
      status: k.status,
      baseUrl: k.baseUrl,
      createdAt: new Date(k.createdAt),
      updatedAt: new Date(k.updatedAt),
    }));
  }, [upstreamData]);

  /* ── Filter logic ── */
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      if (providerFilter !== '全部' && k.provider !== providerFilter) return false;
      if (statusFilter !== 'all' && k.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return k.name.toLowerCase().includes(q) || k.provider.toLowerCase().includes(q);
      }
      return true;
    });
  }, [keys, providerFilter, statusFilter, searchQuery]);

  /* ── Copy helper ── */
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
    createMutation.mutate({
      name: formName.trim(),
      provider: formProvider,
      keyEncrypted: formApiKey.trim(),
      keyPreview: `sk-...${formApiKey.trim().slice(-4)}`,
      baseUrl: formBaseUrl || undefined,
    }, {
      onSuccess: () => {
        resetForm();
        setShowAddModal(false);
      },
      onError: (err) => setFormError(err.message),
    });
  }, [formName, formProvider, formApiKey, formBaseUrl, createMutation]);

  /* ── Edit key ── */
  const handleEditKey = useCallback(() => {
    if (!editingKey) return;
    if (!formName.trim() || formName.length < 2) {
      setFormError('Key 名称必填，2-50 字符');
      return;
    }
    updateMutation.mutate({
      id: editingKey.id,
      name: formName.trim(),
      provider: formProvider,
      baseUrl: formBaseUrl || undefined,
    }, {
      onSuccess: () => {
        resetForm();
        setEditingKey(null);
      },
      onError: (err) => setFormError(err.message),
    });
  }, [editingKey, formName, formProvider, formBaseUrl, updateMutation]);

  /* ── Delete key ── */
  const handleDeleteKey = useCallback(() => {
    if (!deletingKeyId) return;
    deleteMutation.mutate({ id: deletingKeyId }, {
      onSuccess: () => setDeletingKeyId(null),
    });
  }, [deletingKeyId, deleteMutation]);

  /* ── Toggle status ── */
  const handleToggleStatus = useCallback(() => {
    if (!togglingKey) return;
    const newStatus = togglingKey.status === 'active' ? 'inactive' : 'active';
    updateMutation.mutate({
      id: togglingKey.id,
      status: newStatus as 'active' | 'inactive' | 'expired',
    }, {
      onSuccess: () => setTogglingKey(null),
    });
  }, [togglingKey, updateMutation]);

  /* ── Reset form ── */
  const resetForm = useCallback(() => {
    setFormName('');
    setFormProvider('OpenAI');
    setFormApiKey('');
    setFormBaseUrl('');
    setFormError('');
  }, []);

  /* ── Open edit modal ── */
  const openEdit = useCallback((key: UpstreamKeyExtended) => {
    setEditingKey(key);
    setFormName(key.name);
    setFormProvider(key.provider);
    setFormApiKey('');
    setFormBaseUrl(key.baseUrl || '');
    setFormError('');
  }, []);

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
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 Key 名称或供应商..."
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-9 pr-4 py-2.5 w-64 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
          </div>
          <button onClick={() => { resetForm(); setShowAddModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors hover:shadow-glow-hover">
            <Plus className="w-4 h-4" /> 添加上游 Key
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-[var(--slate-500)] mr-1" />
          {providers.map((p) => (
            <button key={p} onClick={() => setProviderFilter(p)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all ${
                providerFilter === p ? 'bg-[#3366FF] text-white' : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
              }`}>
              {p} ({p === '全部' ? keys.length : keys.filter((k) => k.provider === p).length})
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-[var(--dark-border)]" />
        {(['all', 'active', 'inactive'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all ${
              statusFilter === s ? 'bg-[#3366FF] text-white' : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
            }`}>
            {s === 'all' ? '全部' : s === 'active' ? '已启用' : '已禁用'}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <RefreshCw className="w-8 h-8 text-[var(--slate-500)] mx-auto mb-4 animate-spin" />
          <p className="text-[14px] text-[var(--slate-400)]">加载中...</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && filteredKeys.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <Key className="w-16 h-16 text-[var(--slate-600)] mx-auto mb-4" />
          <h3 className="font-space text-[18px] font-semibold text-[var(--slate-400)] mb-2">暂无上游 API Key</h3>
          <p className="text-[14px] text-[var(--slate-500)] mb-6">添加上游 Key 以开始使用平台代理调用服务</p>
          <button onClick={() => { resetForm(); setShowAddModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors">
            <Plus className="w-4 h-4" /> 添加上游 Key
          </button>
        </motion.div>
      )}

      {/* ── Table ── */}
      {!isLoading && filteredKeys.length > 0 && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">供应商</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">Key 别名</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">Key 预览</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">健康状态</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">Base URL</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                <AnimatePresence>
                  {filteredKeys.map((key) => {
                    const hcfg = healthBadgeConfig(key.healthStatus);
                    const HealthIcon = hcfg.icon;
                    return (
                      <motion.tr key={key.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="hover:bg-[var(--dark-hover)] transition-colors group">
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
                          <div className="flex items-center gap-2">
                            <code className="text-[12px] font-jetbrains text-[var(--slate-400)]">{key.keyPreview}</code>
                            <button onClick={() => handleCopy(`preview-${key.id}`, key.keyPreview)}
                              className="p-1 rounded text-[var(--slate-500)] hover:text-[#10B981] hover:bg-[var(--dark-hover)] transition-colors">
                              {copiedId === `preview-${key.id}` ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${hcfg.cls}`}>
                            <HealthIcon className="w-3 h-3" /> {hcfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains truncate max-w-[200px]">{key.baseUrl || '-'}</td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                            key.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[var(--slate-700)] text-[var(--slate-400)]'
                          }`}>{key.status === 'active' ? '已启用' : '已禁用'}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(key)}
                              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors" title="编辑">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setTogglingKey(key)}
                              className={`p-1.5 rounded-lg transition-colors ${key.status === 'active'
                                ? 'text-[var(--slate-400)] hover:text-[#F59E0B] hover:bg-[var(--dark-hover)]'
                                : 'text-[var(--slate-400)] hover:text-[#10B981] hover:bg-[var(--dark-hover)]'
                              }`} title={key.status === 'active' ? '禁用' : '启用'}>
                              {key.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => setDeletingKeyId(key.id)}
                              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title="删除">
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
          <Modal title={editingKey ? '编辑上游 API Key' : '添加上游 API Key'}
            onClose={() => { setShowAddModal(false); setEditingKey(null); resetForm(); }}>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">Key 名称 <span className="text-[#F43F5E]">*</span></label>
                <input type="text" value={formName} onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
                  placeholder="如: 生产环境 OpenAI"
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">供应商 <span className="text-[#F43F5E]">*</span></label>
                <select value={formProvider} onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors">
                  {providers.filter((p) => p !== '全部').map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">Base URL</label>
                <input type="text" value={formBaseUrl} onChange={(e) => setFormBaseUrl(e.target.value)}
                  placeholder="如: https://api.openai.com/v1 (可选)"
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)] font-jetbrains" />
              </div>
              {!editingKey && (
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">API Key <span className="text-[#F43F5E]">*</span></label>
                  <input type="password" value={formApiKey} onChange={(e) => { setFormApiKey(e.target.value); setFormError(''); }}
                    placeholder="粘贴您的供应商 API Key"
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
                  <p className="mt-1.5 text-[12px] text-[var(--slate-500)] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
                    Key 将以加密方式存储，平台人员无法查看明文
                  </p>
                </div>
              )}
              {formError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-[#F43F5E] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {formError}
                </motion.p>
              )}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => { setShowAddModal(false); setEditingKey(null); resetForm(); }}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">
                  取消
                </button>
                <button onClick={editingKey ? handleEditKey : handleAddKey}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
                  disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? '保存中...' : editingKey ? '保存修改' : '保存'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Toggle Status Confirmation ── */}
      <AnimatePresence>
        {togglingKey && (
          <Modal title={togglingKey.status === 'active' ? '禁用 Key' : '启用 Key'} onClose={() => setTogglingKey(null)} maxWidth="400px">
            <div className="py-2">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                <div>
                  <p className="text-[14px] text-white">确定要{togglingKey.status === 'active' ? '禁用' : '启用'} Key &quot;{togglingKey.keyAlias}&quot; 吗？</p>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">
                    {togglingKey.status === 'active' ? '禁用后，该 Key 将不再用于代理调用。' : '启用后，该 Key 将恢复用于代理调用。'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setTogglingKey(null)}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleToggleStatus}
                  className={`px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
                    togglingKey.status === 'active' ? 'bg-[#F59E0B] text-white hover:bg-[#D97706]' : 'bg-[#10B981] text-white hover:bg-[#059669]'
                  }`}>确认</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {deletingKeyId && (
          <Modal title="删除 Key" onClose={() => setDeletingKeyId(null)} maxWidth="400px">
            <div className="py-2">
              <div className="flex items-start gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-[#F43F5E] mt-0.5" />
                <div>
                  <p className="text-[14px] text-white">确定要删除此 Key 吗？</p>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">此操作不可撤销。删除后，关联的路由策略将受到影响。</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeletingKeyId(null)}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleDeleteKey}
                  className="px-5 py-2 bg-[#F43F5E] text-white text-[13px] font-semibold rounded-lg hover:bg-[#E11D48] transition-colors"
                  disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
