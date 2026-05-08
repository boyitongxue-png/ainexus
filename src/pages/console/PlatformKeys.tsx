import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Shield, Pencil, Pause, Play, Trash2, X,
  AlertTriangle, Copy, Check, CheckCircle2, Search,
  Ban, Info,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PlatformKeyUI {
  id: number;
  name: string;
  keyPreview: string;
  fullKey?: string;
  permissions: string[];
  rateLimit: number;
  ipWhitelist: string[];
  status: 'active' | 'inactive';
  lastUsedAt: Date | null;
  createdAt: Date;
}

const permissionOptions = [
  { value: 'chat', label: '文本聊天' },
  { value: 'image', label: '图片生成' },
  { value: 'video', label: '视频生成' },
  { value: 'audio', label: '语音转录' },
  { value: 'embedding', label: 'Embedding' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function statusBadgeConfig(status: 'active' | 'inactive') {
  switch (status) {
    case 'active': return { cls: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20', icon: CheckCircle2, label: '生效中' };
    case 'inactive': return { cls: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20', icon: Ban, label: '已停用' };
  }
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return `nxpk_${Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
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
        style={{ maxWidth, width: '100%', maxHeight: '85vh' }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
          <h3 className="font-space text-[18px] font-semibold text-white">{title}</h3>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-5 overflow-y-auto flex-1 min-h-0">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function ConsolePlatformKeys() {
  /* ── Data from tRPC ── */
  const utils = trpc.useUtils();
  const { data: platformData, isLoading } = trpc.key.platformList.useQuery();

  const createMutation = trpc.key.platformCreate.useMutation({
    onSuccess: () => { utils.key.platformList.invalidate(); },
  });
  const updateMutation = trpc.key.platformUpdate.useMutation({
    onSuccess: () => { utils.key.platformList.invalidate(); },
  });
  const deleteMutation = trpc.key.platformDelete.useMutation({
    onSuccess: () => { utils.key.platformList.invalidate(); },
  });

  /* ── Map DB data to UI format ── */
  const keys: PlatformKeyUI[] = useMemo(() => {
    if (!platformData) return [];
    return platformData.map((k) => ({
      id: k.id,
      name: k.name,
      keyPreview: k.keyPreview,
      permissions: (k.permissions as string[]) || ['chat'],
      rateLimit: k.rateLimit,
      ipWhitelist: (k.ipWhitelist as string[]) || [],
      status: k.status,
      lastUsedAt: k.lastUsedAt,
      createdAt: new Date(k.createdAt),
    }));
  }, [platformData]);

  /* ── Local state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKey, setEditingKey] = useState<PlatformKeyUI | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<number | null>(null);
  const [revealedKey, setRevealedKey] = useState<{ name: string; fullKey: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);


  /* ── Form state ── */
  const [formName, setFormName] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>(['chat']);
  const [formRpm, setFormRpm] = useState('600');
  const [formIps, setFormIps] = useState('');
  const [formError, setFormError] = useState('');

  /* ── Filter ── */
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return k.name.toLowerCase().includes(q) || k.keyPreview.toLowerCase().includes(q);
    });
  }, [keys, searchQuery]);

  /* ── Copy helper ── */
  const handleCopy = useCallback((id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  /* ── Reset form ── */
  const resetForm = useCallback(() => {
    setFormName('');
    setFormPermissions(['chat']);
    setFormRpm('600');
    setFormIps('');
    setFormError('');
  }, []);

  /* ── Create key ── */
  const handleCreateKey = useCallback(() => {
    if (!formName.trim() || formName.length < 2) {
      setFormError('Key 名称必填，2-50 字符');
      return;
    }
    const fullKey = generateApiKey();
    createMutation.mutate({
      name: formName.trim(),
      keyEncrypted: fullKey,
      keyPreview: `nxpk_...${fullKey.slice(-6)}`,
      permissions: formPermissions,
      rateLimit: Number(formRpm) || 600,
      ipWhitelist: formIps.split('\n').map((s) => s.trim()).filter(Boolean),
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setRevealedKey({ name: formName.trim(), fullKey });
        resetForm();
      },
      onError: (err) => setFormError(err.message),
    });
  }, [formName, formPermissions, formRpm, formIps, createMutation, resetForm]);

  /* ── Edit key ── */
  const handleEditKey = useCallback(() => {
    if (!editingKey) return;
    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('Key 名称必填，2-50 字符');
      return;
    }
    updateMutation.mutate({
      id: editingKey.id,
      name: formName.trim(),
      permissions: formPermissions,
      rateLimit: Number(formRpm) || 600,
      ipWhitelist: formIps.split('\n').map((s) => s.trim()).filter(Boolean),
    }, {
      onSuccess: () => {
        setEditingKey(null);
        resetForm();
      },
      onError: (err) => setFormError(err.message),
    });
  }, [editingKey, formName, formPermissions, formRpm, formIps, updateMutation, resetForm]);

  /* ── Delete key ── */
  const handleDeleteKey = useCallback(() => {
    if (!deletingKeyId) return;
    deleteMutation.mutate({ id: deletingKeyId }, {
      onSuccess: () => setDeletingKeyId(null),
    });
  }, [deletingKeyId, deleteMutation]);

  /* ── Toggle status ── */
  const handleToggleStatus = useCallback((key: PlatformKeyUI) => {
    const newStatus = key.status === 'active' ? 'inactive' : 'active';
    updateMutation.mutate({ id: key.id, status: newStatus });
  }, [updateMutation]);

  /* ── Open edit ── */
  const openEdit = useCallback((key: PlatformKeyUI) => {
    setEditingKey(key);
    setFormName(key.name);
    setFormPermissions(key.permissions);
    setFormRpm(String(key.rateLimit));
    setFormIps(key.ipWhitelist.join('\n'));
    setFormError('');
  }, []);

  /* ── Toggle permission ── */
  const togglePermission = useCallback((perm: string) => {
    setFormPermissions((prev) => prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">平台 API Key</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">
            管理您调用 AI Nexus 统一 API 的密钥。创建后，Key 值仅显示一次，请务必妥善保存。
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors hover:shadow-glow-hover">
          <Plus className="w-4 h-4" /> 创建 API Key
        </button>
      </div>

      {/* ── Info Section ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#3366FF]/5 border border-[#3366FF]/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#3366FF] mt-0.5 shrink-0" />
        <div>
          <h3 className="text-[14px] font-medium text-[#7A9FFF] mb-1">关于平台 API Key</h3>
          <p className="text-[13px] text-[var(--slate-400)] leading-relaxed">
            平台 API Key 是您调用 AI Nexus 统一 API 接口的凭证。创建后，Key 值仅显示一次，请务必妥善保存。
            您可以为不同的使用场景创建多个 Key，并为每个 Key 设置独立的权限范围和调用频率限制。
          </p>
        </div>
      </motion.div>

      {/* ── Search ── */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索 Key 名称..."
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-9 pr-4 py-2.5 w-full outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#3366FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[var(--slate-400)]">加载中...</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && keys.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <Shield className="w-16 h-16 text-[var(--slate-600)] mx-auto mb-4" />
          <h3 className="font-space text-[18px] font-semibold text-[var(--slate-400)] mb-2">暂无平台 API Key</h3>
          <p className="text-[14px] text-[var(--slate-500)] mb-6">创建 API Key 以开始调用 AI Nexus 统一接口</p>
          <button onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors">
            <Plus className="w-4 h-4" /> 创建 API Key
          </button>
        </motion.div>
      )}

      {/* ── Data Table ── */}
      {!isLoading && keys.length > 0 && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">Key 名称</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">密钥</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">权限范围</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">限流</th>
                  <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filteredKeys.map((key) => {
                  const scfg = statusBadgeConfig(key.status);
                  const StatusIcon = scfg.icon;
                  return (
                    <motion.tr key={key.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-[var(--dark-hover)] transition-colors group">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#A855F7]/15 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-[#A855F7]" />
                          </div>
                          <span className="text-[13px] text-white font-medium">{key.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${scfg.cls}`}>
                          <StatusIcon className="w-3 h-3" /> {scfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <code className="text-[12px] font-jetbrains text-[var(--slate-400)]">
                            {key.keyPreview}
                          </code>
                          <button onClick={() => handleCopy(`preview-${key.id}`, key.keyPreview)}
                            className="p-1 rounded text-[var(--slate-500)] hover:text-[#10B981] hover:bg-[var(--dark-hover)] transition-colors">
                            {copiedId === `preview-${key.id}` ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.slice(0, 3).map((p) => (
                            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--dark-hover)] text-[var(--slate-300)] border border-[var(--dark-border)]">
                              {p}
                            </span>
                          ))}
                          {key.permissions.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full text-[var(--slate-500)]">+{key.permissions.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="text-[12px] text-[var(--dark-text)] font-jetbrains">{key.rateLimit} RPM</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(key)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors" title="编辑">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleToggleStatus(key)}
                            className={`p-1.5 rounded-lg transition-colors ${key.status === 'active'
                              ? 'text-[var(--slate-400)] hover:text-[#F59E0B] hover:bg-[var(--dark-hover)]'
                              : 'text-[var(--slate-400)] hover:text-[#10B981] hover:bg-[var(--dark-hover)]'
                            }`} title={key.status === 'active' ? '暂停' : '启用'}>
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
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[var(--dark-border)] flex items-center justify-between text-[12px] text-[var(--slate-400)]">
            <span>共 {filteredKeys.length} 条记录</span>
            <div className="flex items-center gap-4">
              <span>生效中: <span className="text-[#10B981] font-medium">{keys.filter((k) => k.status === 'active').length}</span></span>
              <span>已停用: <span className="text-[#EF4444] font-medium">{keys.filter((k) => k.status === 'inactive').length}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {(showCreateModal || editingKey) && (
          <Modal title={editingKey ? '编辑平台 API Key' : '创建平台 API Key'}
            onClose={() => { setShowCreateModal(false); setEditingKey(null); resetForm(); }} maxWidth="640px">
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">
                  Key 名称 <span className="text-[#F43F5E]">*</span>
                </label>
                <input type="text" value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
                  placeholder="如: 生产环境 Key"
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">权限范围</label>
                <div className="flex flex-wrap gap-2">
                  {permissionOptions.map((opt) => (
                    <button key={opt.value} onClick={() => togglePermission(opt.value)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all ${
                        formPermissions.includes(opt.value)
                          ? 'bg-[#3366FF]/15 text-[#3366FF] border-[#3366FF]/30'
                          : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border-[var(--dark-border)] hover:text-[var(--slate-300)]'
                      }`}>
                      {formPermissions.includes(opt.value) && <Check className="w-3 h-3 inline mr-1" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">RPM 限制</label>
                <input type="number" value={formRpm} onChange={(e) => setFormRpm(e.target.value)} min={1}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors font-jetbrains" />
                <p className="mt-1 text-[11px] text-[var(--slate-500)]">每分钟请求数</p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">IP 白名单</label>
                <textarea value={formIps} onChange={(e) => setFormIps(e.target.value)}
                  placeholder={`每行一个 IP 地址，留空表示不限制`} rows={3}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)] resize-none font-jetbrains text-[12px]" />
              </div>

              {!editingKey && (
                <div className="p-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[#F59E0B]">创建后 Key 值仅显示一次，请务必妥善保存。</p>
                </div>
              )}

              {formError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-[#F43F5E] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {formError}
                </motion.p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => { setShowCreateModal(false); setEditingKey(null); resetForm(); }}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">
                  取消
                </button>
                <button onClick={editingKey ? handleEditKey : handleCreateKey}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
                  disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingKey ? '保存修改' : '创建'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Key Reveal Modal ── */}
      <AnimatePresence>
        {revealedKey && (
          <Modal title="API Key 创建成功" onClose={() => setRevealedKey(null)} maxWidth="480px">
            <div className="text-center py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.4 }}
                className="w-12 h-12 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              </motion.div>
              <h4 className="text-[16px] font-semibold text-white mb-1">Key 创建成功</h4>
              <p className="text-[13px] text-[var(--slate-400)] mb-4">&quot;{revealedKey.name}&quot;</p>
              <div className="p-4 rounded-xl bg-[var(--dark-bg)] border border-[#F59E0B]/30 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-[12px] font-medium text-[#F59E0B]">这是唯一一次查看完整 Key 值的机会</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[14px] font-jetbrains text-[var(--dark-text)] bg-[var(--dark-card)] rounded-lg px-3 py-2.5 border border-[var(--dark-border)] break-all text-left">
                    {revealedKey.fullKey}
                  </code>
                  <button onClick={() => handleCopy('reveal', revealedKey.fullKey)}
                    className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                    {copiedId === 'reveal' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button onClick={() => setRevealedKey(null)}
                className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors">
                知道了
              </button>
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
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">此操作不可撤销。</p>
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
