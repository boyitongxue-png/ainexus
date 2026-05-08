import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Shield,
  Pencil,
  Pause,
  Play,
  Trash2,
  X,
  AlertTriangle,
  Copy,
  Check,
  CheckCircle2,
  Search,
  Eye,
  EyeOff,
  Clock,
  Ban,
  Info,
} from 'lucide-react';
import { platformKeys as initialPlatformKeys, modelCatalog } from '@/lib/mockData';

/* ------------------------------------------------------------------ */
/*  Extended type                                                      */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PlatformKeyStatus = 'active' | 'paused' | 'revoked';

interface ModelPricing {
  modelName: string;      // 模型名称
  platformPrice: number;  // 平台定价（从平台配置读取，只读）
  myPrice: number;       // 用户的自定义售价（可编辑）
}

interface PlatformKeyExtended {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey?: string;
  permissions: string[];
  modelAccess: string[];
  qpsLimit: number;
  rpmLimit: number;
  ipWhitelist: string[];
  status: PlatformKeyStatus;
  notes: string;
  lastUsedAt: string | null;
  createdAt: string;
  /** 自定义模型定价：默认undefined表示使用平台定价 */
  customPricing?: ModelPricing[];
  /** 总额度（积分），null 表示无限额度 */
  quota: number | null;
  /** 已使用额度（积分） */
  usedQuota: number;
  /** 过期时间，null 表示永不过期 */
  expiresAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  Mock extended data                                                 */
/* ------------------------------------------------------------------ */
const extendedPlatformKeys: PlatformKeyExtended[] = initialPlatformKeys.map((pk) => {
  const allModels = modelCatalog.filter((m) => pk.permissions.some((p) => {
    if (p === 'chat' && m.type === 'text') return true;
    if (p === 'image' && m.type === 'image') return true;
    if (p === 'video' && m.type === 'video') return true;
    if (p === 'audio' && m.type === 'audio') return true;
    if (p === 'embedding' && m.type === 'embedding') return true;
    return false;
  }));
  return {
    id: pk.id,
    name: pk.name,
    keyPrefix: pk.keyPreview,
    fullKey: `nxsk_${Array.from({ length: 32 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')}`,
    permissions: pk.permissions,
    modelAccess: allModels.map((m) => m.name),
    qpsLimit: Math.ceil(pk.rateLimit / 60),
    rpmLimit: pk.rateLimit,
    ipWhitelist: pk.ipWhitelist,
    status: pk.status === 'active' ? 'active' : 'paused',
    notes: '',
    lastUsedAt: pk.lastUsedAt,
    createdAt: pk.createdAt,
    quota: null,        // 默认无限额度
    usedQuota: 0,       // 已使用 0
    expiresAt: null,    // 默认永不过期
  };
});

const permissionOptions = [
  { value: 'chat', label: '文本聊天' },
  { value: 'image', label: '图片生成' },
  { value: 'video', label: '视频生成' },
  { value: 'audio', label: '语音转录' },
  { value: 'embedding', label: 'Embedding' },
];

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
function statusBadgeConfig(status: PlatformKeyStatus) {
  switch (status) {
    case 'active':
      return { cls: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20', icon: CheckCircle2, label: '生效中' };
    case 'paused':
      return { cls: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20', icon: Pause, label: '已暂停' };
    case 'revoked':
      return { cls: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20', icon: Ban, label: '已撤销' };
  }
}

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
        style={{ maxWidth, width: '100%', maxHeight: '85vh' }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
          <h3 className="font-space text-[18px] font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
          >
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
  const [keys, setKeys] = useState<PlatformKeyExtended[]>(extendedPlatformKeys);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKey, setEditingKey] = useState<PlatformKeyExtended | null>(null);
  const [pausingKey, setPausingKey] = useState<PlatformKeyExtended | null>(null);
  const [revokingKey, setRevokingKey] = useState<PlatformKeyExtended | null>(null);
  const [enablingKey, setEnablingKey] = useState<PlatformKeyExtended | null>(null);
  const [deletingKey, setDeletingKey] = useState<PlatformKeyExtended | null>(null);
  const [revealedKey, setRevealedKey] = useState<PlatformKeyExtended | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ── Form state ── */
  const [formName, setFormName] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>(['chat']);
  const [formQps, setFormQps] = useState('10');
  const [formRpm, setFormRpm] = useState('600');
  const [formIps, setFormIps] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [showFullKey, setShowFullKey] = useState<string | null>(null);
  /** 自定义定价配置：每个模型一条记录，undefined表示未开启自定义定价（使用平台定价） */
  const [formCustomPricing, setFormCustomPricing] = useState<ModelPricing[]>([]);
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  /** 可见的密钥（哪些行显示完整密钥） */
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  /** 已复制的密钥 */
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  /** 表单额度 */
  const [formQuota, setFormQuota] = useState<string>('');
  /** 表单无限额度 */
  const [formIsUnlimited, setFormIsUnlimited] = useState(true);
  /** 表单过期时间 */
  const [formExpiresAt, setFormExpiresAt] = useState<string>('');

  /* ── Filter ── */
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return k.name.toLowerCase().includes(q) || k.keyPrefix.toLowerCase().includes(q);
    });
  }, [keys, searchQuery]);

  /* ── Copy helper ── */
  const handleCopy = useCallback((id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  /* ── Get available models by permissions ── */
  const getAvailableModels = useCallback(() => {
    return modelCatalog.filter((m) => formPermissions.some((p) => {
      if (p === 'chat' && m.type === 'text') return true;
      if (p === 'image' && m.type === 'image') return true;
      if (p === 'video' && m.type === 'video') return true;
      if (p === 'audio' && m.type === 'audio') return true;
      if (p === 'embedding' && m.type === 'embedding') return true;
      return false;
    }));
  }, [formPermissions]);

  /* ── Initialize pricing from platform defaults ── */
  const initPricingFromPlatform = useCallback(() => {
    const models = getAvailableModels();
    const pricing: ModelPricing[] = models.map((m) => ({
      modelName: m.name,
      platformPrice: m.platformPrice ?? m.costPer1KTokens,
      myPrice: m.platformPrice ?? m.costPer1KTokens,
    }));
    setFormCustomPricing(pricing);
  }, [getAvailableModels]);

  /* ── Reset form ── */
  const resetForm = useCallback(() => {
    setFormName('');
    setFormPermissions(['chat']);
    setFormQps('10');
    setFormRpm('600');
    setFormIps('');
    setFormNotes('');
    setFormError('');
    setFormCustomPricing([]);
    setShowPricingConfig(false);
    setFormQuota('1000');
    setFormIsUnlimited(true);
    setFormExpiresAt('');
  }, []);

  /* ── Create key ── */
  const handleCreateKey = useCallback(() => {
    if (!formName.trim() || formName.length < 2) {
      setFormError('Key 名称必填，2-50 字符');
      return;
    }
    const fullKey = `nxsk_${Array.from({ length: 32 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')}`;
    const newKey: PlatformKeyExtended = {
      id: `pk_${Date.now()}`,
      name: formName.trim(),
      keyPrefix: `nxsk_...${fullKey.slice(-6)}`,
      fullKey,
      permissions: formPermissions,
      modelAccess: getAvailableModels().map((m) => m.name),
      qpsLimit: Number(formQps) || 10,
      rpmLimit: Number(formRpm) || 600,
      ipWhitelist: formIps.split('\n').map((s) => s.trim()).filter(Boolean),
      status: 'active',
      notes: formNotes,
      lastUsedAt: null,
      createdAt: new Date().toISOString().split('T')[0],
      customPricing: showPricingConfig && formCustomPricing.length > 0 ? formCustomPricing : undefined,
      quota: formIsUnlimited ? null : (Number(formQuota) || null),
      usedQuota: 0,
      expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
    };
    setKeys((prev) => [...prev, newKey]);
    setShowCreateModal(false);
    setTimeout(() => setRevealedKey(newKey), 300);
    resetForm();
  }, [formName, formPermissions, formQps, formRpm, formIps, formNotes, formCustomPricing, showPricingConfig, getAvailableModels, resetForm]);

  /* ── Edit key ── */
  const handleEditKey = useCallback(() => {
    if (!editingKey) return;
    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('Key 名称必填，2-50 字符');
      return;
    }
    setKeys((prev) =>
      prev.map((k) =>
        k.id === editingKey.id
          ? {
              ...k,
              name: formName.trim(),
              permissions: formPermissions,
              modelAccess: getAvailableModels().map((m) => m.name),
              qpsLimit: Number(formQps) || 10,
              rpmLimit: Number(formRpm) || 600,
              ipWhitelist: formIps.split('\n').map((s) => s.trim()).filter(Boolean),
              notes: formNotes,
              customPricing: showPricingConfig && formCustomPricing.length > 0 ? formCustomPricing : undefined,
              quota: formIsUnlimited ? null : (Number(formQuota) || null),
              expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
            }
          : k
      )
    );
    setEditingKey(null);
    resetForm();
  }, [editingKey, formName, formPermissions, formQps, formRpm, formIps, formNotes, formCustomPricing, showPricingConfig, getAvailableModels, resetForm]);

  /* ── Pause / Enable / Revoke ── */
  const handlePause = useCallback(() => {
    if (!pausingKey) return;
    setKeys((prev) => prev.map((k) => (k.id === pausingKey.id ? { ...k, status: 'paused' as PlatformKeyStatus } : k)));
    setPausingKey(null);
  }, [pausingKey]);

  const handleEnable = useCallback(() => {
    if (!enablingKey) return;
    setKeys((prev) => prev.map((k) => (k.id === enablingKey.id ? { ...k, status: 'active' as PlatformKeyStatus } : k)));
    setEnablingKey(null);
  }, [enablingKey]);

  const handleRevoke = useCallback(() => {
    if (!revokingKey) return;
    setKeys((prev) => prev.map((k) => (k.id === revokingKey.id ? { ...k, status: 'revoked' as PlatformKeyStatus } : k)));
    setRevokingKey(null);
  }, [revokingKey]);

  const handleDelete = useCallback(() => {
    if (!deletingKey) return;
    setKeys((prev) => prev.filter((k) => k.id !== deletingKey.id));
    setDeletingKey(null);
  }, [deletingKey]);

  /* ── Open edit ── */
  const openEdit = useCallback((key: PlatformKeyExtended) => {
    setEditingKey(key);
    setFormName(key.name);
    setFormPermissions(key.permissions);
    setFormQps(String(key.qpsLimit));
    setFormRpm(String(key.rpmLimit));
    setFormIps(key.ipWhitelist.join('\n'));
    setFormNotes(key.notes);
    setFormError('');
    if (key.customPricing && key.customPricing.length > 0) {
      setFormCustomPricing(key.customPricing);
      setShowPricingConfig(true);
    } else {
      setFormCustomPricing([]);
      setShowPricingConfig(false);
    }
    // Load quota settings
    const isUnlimited = key.quota === null;
    setFormIsUnlimited(isUnlimited);
    setFormQuota(isUnlimited ? '1000' : String(key.quota || 1000));
    // Load expiration
    setFormExpiresAt(key.expiresAt ? key.expiresAt.slice(0, 16) : '');
  }, []);

  /* ── Toggle permission ── */
  const togglePermission = useCallback((perm: string) => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">平台 API Key</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">
            管理您调用 AI Nexus 统一 API 的密钥。支持设置权限范围、调用频率限制和有效期。
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors hover:shadow-glow-hover"
        >
          <Plus className="w-4 h-4" />
          创建 API Key
        </button>
      </div>

      {/* ── Info Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#3366FF]/5 border border-[#3366FF]/20 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-[#3366FF] mt-0.5 shrink-0" />
        <div>
          <h3 className="text-[14px] font-medium text-[#7A9FFF] mb-1">关于平台 API Key</h3>
          <p className="text-[13px] text-[var(--slate-400)] leading-relaxed">
            平台 API Key 是您调用 AI Nexus 统一 API 接口的凭证。创建后，Key 值仅显示一次，请务必妥善保存。
            您可以为不同的使用场景创建多个 Key，并为每个 Key 设置独立的权限范围和调用频率限制。
            所有调用都会通过平台代理到底层供应商，您可在「模型目录」查看各模型的平台积分定价。
          </p>
        </div>
      </motion.div>

      {/* ── Search ── */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索 Key 名称..."
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-9 pr-4 py-2.5 w-full outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]"
          />
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">Key 名称</th>
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">密钥</th>
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">剩余额度 / 总额度</th>
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">权限范围</th>
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">限流</th>
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">过期时间</th>
                <th className="py-3 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filteredKeys.map((key, i) => {
                const scfg = statusBadgeConfig(key.status);
                const StatusIcon = scfg.icon;
                return (
                  <motion.tr
                    key={key.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[var(--dark-hover)] transition-colors group"
                  >
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
                        <StatusIcon className="w-3 h-3" />
                        {scfg.label}
                      </span>
                    </td>
                    {/* 密钥 - 查看/复制 */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <code className="text-[12px] font-jetbrains text-[var(--slate-400)]">
                          {visibleKeys.has(key.id)
                            ? (key.fullKey || key.keyPrefix)
                            : (key.fullKey
                                ? `${key.fullKey.slice(0, 6)}...${key.fullKey.slice(-6)}`
                                : key.keyPrefix
                              )
                          }
                        </code>
                        <button
                          onClick={() => {
                            if (visibleKeys.has(key.id)) {
                              setVisibleKeys((prev) => { const n = new Set(prev); n.delete(key.id); return n; });
                            } else {
                              setVisibleKeys((prev) => new Set(prev).add(key.id));
                            }
                          }}
                          className="p-1 rounded text-[var(--slate-500)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors"
                          title={visibleKeys.has(key.id) ? '隐藏' : '查看'}
                        >
                          {visibleKeys.has(key.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            const textToCopy = key.fullKey || key.keyPrefix;
                            navigator.clipboard.writeText(textToCopy).then(() => {
                              setCopiedKeyId(key.id);
                              setTimeout(() => setCopiedKeyId(null), 2000);
                            });
                          }}
                          className="p-1 rounded text-[var(--slate-500)] hover:text-[#10B981] hover:bg-[var(--dark-hover)] transition-colors"
                          title="复制"
                        >
                          {copiedKeyId === key.id ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    {/* 额度管理 */}
                    <td className="py-3.5 px-5">
                      {key.quota === null ? (
                        <span className="text-[12px] text-[#A855F7] font-medium">无限额度</span>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-[var(--slate-400)]">{key.usedQuota.toFixed(0)} / {key.quota}</span>
                            <span className="text-[var(--slate-500)]">{((key.usedQuota / key.quota) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-24 h-1.5 bg-[var(--dark-bg)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (key.usedQuota / key.quota) * 100)}%`,
                                backgroundColor: key.usedQuota / key.quota > 0.9 ? '#EF4444' : key.usedQuota / key.quota > 0.7 ? '#F59E0B' : '#10B981',
                              }}
                            />
                          </div>
                        </div>
                      )}
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
                      <div className="text-[12px] text-[var(--dark-text)]">
                        <div className="font-jetbrains">{key.qpsLimit} QPS</div>
                        <div className="text-[var(--slate-500)] font-jetbrains">{key.rpmLimit} RPM</div>
                      </div>
                    </td>
                    {/* 过期时间 */}
                    <td className="py-3.5 px-5">
                      {key.expiresAt ? (
                        <span className="text-[12px] text-[var(--slate-400)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(key.expiresAt).toLocaleDateString('zh-CN')}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[var(--slate-500)]">永不过期</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(key)}
                          className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {key.status === 'active' && (
                          <button
                            onClick={() => setPausingKey(key)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F59E0B] hover:bg-[var(--dark-hover)] transition-colors"
                            title="暂停"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {key.status === 'paused' && (
                          <button
                            onClick={() => setEnablingKey(key)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#10B981] hover:bg-[var(--dark-hover)] transition-colors"
                            title="启用"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {key.status !== 'revoked' && (
                          <button
                            onClick={() => setRevokingKey(key)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors"
                            title="撤销"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
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
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[var(--dark-border)] flex items-center justify-between text-[12px] text-[var(--slate-400)]">
          <span>共 {filteredKeys.length} 条记录</span>
          <div className="flex items-center gap-4">
            <span>生效中: <span className="text-[#10B981] font-medium">{keys.filter((k) => k.status === 'active').length}</span></span>
            <span>已暂停: <span className="text-[#F59E0B] font-medium">{keys.filter((k) => k.status === 'paused').length}</span></span>
            <span>已撤销: <span className="text-[#EF4444] font-medium">{keys.filter((k) => k.status === 'revoked').length}</span></span>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {(showCreateModal || editingKey) && (
          <Modal
            title={editingKey ? '编辑平台 API Key' : '创建平台 API Key'}
            onClose={() => {
              setShowCreateModal(false);
              setEditingKey(null);
              resetForm();
            }}
            maxWidth="640px"
          >
            {/* Auto-init pricing when modal opens */}
            {(() => {
              if (formCustomPricing.length === 0) {
                const models = getAvailableModels();
                if (models.length > 0) {
                  setTimeout(() => initPricingFromPlatform(), 0);
                }
              }
              return null;
            })()}
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
                  placeholder="如: 生产环境 Key"
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">权限范围</label>
                <div className="flex flex-wrap gap-2">
                  {permissionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => togglePermission(opt.value)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-all ${
                        formPermissions.includes(opt.value)
                          ? 'bg-[#3366FF]/15 text-[#3366FF] border-[#3366FF]/30'
                          : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border-[var(--dark-border)] hover:text-[var(--slate-300)]'
                      }`}
                    >
                      {formPermissions.includes(opt.value) && <Check className="w-3 h-3 inline mr-1" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">QPS 限制</label>
                  <input
                    type="number"
                    value={formQps}
                    onChange={(e) => setFormQps(e.target.value)}
                    min={1}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors font-jetbrains"
                  />
                  <p className="mt-1 text-[11px] text-[var(--slate-500)]">每秒请求数</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">RPM 限制</label>
                  <input
                    type="number"
                    value={formRpm}
                    onChange={(e) => setFormRpm(e.target.value)}
                    min={1}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors font-jetbrains"
                  />
                  <p className="mt-1 text-[11px] text-[var(--slate-500)]">每分钟请求数</p>
                </div>
              </div>

              {/* ── Model Pricing Config ── */}
              <div className="p-4 rounded-xl border border-[var(--dark-border)] bg-[var(--dark-bg)]/50">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[13px] font-medium text-[var(--dark-text)]">模型销售定价</label>
                  <button
                    onClick={initPricingFromPlatform}
                    className="text-[11px] px-2.5 py-1.5 rounded-md bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-400)] hover:text-white transition-colors"
                  >
                    全部恢复平台价
                  </button>
                </div>
                <p className="text-[11px] text-[var(--slate-500)] mb-3">平台定价为只读，修改「我的售价」以设置向下游客户的销售价格，利润自动计算。</p>
                {/* Pricing table */}
                <div className="max-h-[220px] overflow-y-auto rounded-lg border border-[var(--dark-border)]">
                  <table className="w-full text-[12px]">
                    <thead className="sticky top-0 bg-[var(--dark-card)] z-10">
                      <tr className="border-b border-[var(--dark-border)]">
                        <th className="py-2 px-3 text-left text-[var(--slate-500)] font-medium">模型</th>
                        <th className="py-2 px-3 text-right text-[var(--slate-500)] font-medium">平台定价</th>
                        <th className="py-2 px-3 text-right text-[var(--slate-500)] font-medium">我的售价</th>
                        <th className="py-2 px-3 text-right text-[var(--slate-500)] font-medium">利润</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formCustomPricing.map((item, idx) => (
                        <tr key={item.modelName} className="border-b border-[var(--dark-border)] last:border-0">
                          <td className="py-2 px-3 text-[var(--dark-text)] whitespace-nowrap">{item.modelName}</td>
                          <td className="py-2 px-3 text-right text-[var(--slate-500)] font-jetbrains">{item.platformPrice}</td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={item.myPrice}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setFormCustomPricing((prev) =>
                                  prev.map((p, i) => i === idx ? { ...p, myPrice: isNaN(val) ? p.platformPrice : val } : p)
                                );
                              }}
                              className="w-20 text-right bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white rounded px-2 py-1 text-[12px] font-jetbrains focus:border-[#3366FF] outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-[#10B981] font-medium">
                              +{(item.myPrice - item.platformPrice).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Total summary */}
                {formCustomPricing.length > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-[var(--slate-500)] px-1 mt-2">
                    <span>共 {formCustomPricing.length} 个模型</span>
                    <span>
                      平均利润:
                      <span className="text-[#10B981] font-medium ml-1">
                        +{(formCustomPricing.reduce((sum, p) => sum + (p.myPrice - p.platformPrice), 0) / formCustomPricing.length).toFixed(2)} 积分/1K
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* ── 额度设置 ── */}
              <div className="p-4 rounded-xl border border-[var(--dark-border)] bg-[var(--dark-bg)]/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[13px] font-medium text-[var(--dark-text)]">额度设置</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--slate-500)]">无限额度</span>
                    <button
                      type="button"
                      onClick={() => setFormIsUnlimited(!formIsUnlimited)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${formIsUnlimited ? 'bg-[#3366FF]' : 'bg-[var(--slate-600)]'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formIsUnlimited ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
                {!formIsUnlimited && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] text-[var(--slate-400)] mb-1.5">总额度（积分）</label>
                        <input
                          type="number"
                          min={1}
                          value={formQuota}
                          onChange={(e) => setFormQuota(e.target.value)}
                          placeholder="1000"
                          className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] font-jetbrains"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--slate-500)]">设置额度上限后，该 Key 的累计调用消耗达到上限时将自动停用。</p>
                  </motion.div>
                )}
                {formIsUnlimited && (
                  <p className="text-[11px] text-[var(--slate-500)]">当前为无限额度模式，不限制调用消耗。</p>
                )}
              </div>

              {/* ── 过期时间 ── */}
              <div className="p-4 rounded-xl border border-[var(--dark-border)] bg-[var(--dark-bg)]/50">
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-3">过期时间</label>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFormExpiresAt('')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] transition-colors ${formExpiresAt === '' ? 'bg-[#3366FF]/15 text-[#3366FF]' : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border border-[var(--dark-border)] hover:text-white'}`}
                  >
                    永不过期
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(d.getHours() + 1);
                      setFormExpiresAt(d.toISOString().slice(0, 16));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] transition-colors ${formExpiresAt?.includes('T') && new Date(formExpiresAt).getTime() - Date.now() < 3660000 ? 'bg-[#3366FF]/15 text-[#3366FF]' : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border border-[var(--dark-border)] hover:text-white'}`}
                  >
                    1小时
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setFormExpiresAt(d.toISOString().slice(0, 16));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] transition-colors ${formExpiresAt?.includes('T') && new Date(formExpiresAt).getTime() - Date.now() < 90000000 && new Date(formExpiresAt).getTime() - Date.now() > 3600000 ? 'bg-[#3366FF]/15 text-[#3366FF]' : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border border-[var(--dark-border)] hover:text-white'}`}
                  >
                    1天
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      setFormExpiresAt(d.toISOString().slice(0, 16));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] transition-colors ${formExpiresAt?.includes('T') && new Date(formExpiresAt).getTime() - Date.now() > 2500000000 ? 'bg-[#3366FF]/15 text-[#3366FF]' : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border border-[var(--dark-border)] hover:text-white'}`}
                  >
                    30天
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF] font-jetbrains"
                />
              </div>

              {/* IP Whitelist */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">IP 白名单</label>
                <textarea
                  value={formIps}
                  onChange={(e) => setFormIps(e.target.value)}
                  placeholder={`每行一个 IP 地址或 CIDR，如:\n192.168.1.1\n10.0.0.0/8\n留空表示不限制`}
                  rows={3}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)] resize-none font-jetbrains text-[12px]"
                />
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

              {/* Warning */}
              {!editingKey && (
                <div className="p-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[#F59E0B]">
                    创建后 Key 值仅显示一次，请务必妥善保存。
                  </p>
                </div>
              )}

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
                    setShowCreateModal(false);
                    setEditingKey(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={editingKey ? handleEditKey : handleCreateKey}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
                >
                  {editingKey ? '保存修改' : '创建'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Key Reveal Modal (after creation) ── */}
      <AnimatePresence>
        {revealedKey && revealedKey.fullKey && (
          <Modal title="API Key 创建成功" onClose={() => setRevealedKey(null)} maxWidth="480px">
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="w-12 h-12 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-4"
              >
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
                    {showFullKey === revealedKey.id ? revealedKey.fullKey : revealedKey.fullKey.slice(0, 8) + '...' + revealedKey.fullKey.slice(-8)}
                  </code>
                  <button
                    onClick={() => setShowFullKey(showFullKey === revealedKey.id ? null : revealedKey.id)}
                    className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                    title={showFullKey === revealedKey.id ? '隐藏' : '显示'}
                  >
                    {showFullKey === revealedKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => revealedKey.fullKey && handleCopy('reveal', revealedKey.fullKey)}
                    className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                    title="复制"
                  >
                    {copiedId === 'reveal' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-left mb-4 p-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)]">
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="text-[var(--slate-500)]">权限范围</div>
                  <div className="text-[var(--dark-text)]">{revealedKey.permissions.join(', ')}</div>
                  <div className="text-[var(--slate-500)]">QPS 限制</div>
                  <div className="text-[var(--dark-text)] font-jetbrains">{revealedKey.qpsLimit}</div>
                  <div className="text-[var(--slate-500)]">RPM 限制</div>
                  <div className="text-[var(--dark-text)] font-jetbrains">{revealedKey.rpmLimit}</div>
                </div>
                {/* Custom pricing summary */}
                {revealedKey.customPricing && revealedKey.customPricing.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--dark-border)]">
                    <div className="text-[11px] text-[#10B981] font-medium mb-1.5">已启用自定义定价</div>
                    <div className="space-y-0.5 max-h-[80px] overflow-y-auto">
                      {revealedKey.customPricing.slice(0, 4).map((p) => (
                        <div key={p.modelName} className="flex items-center justify-between text-[11px]">
                          <span className="text-[var(--slate-400)]">{p.modelName}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[var(--slate-500)]">{p.platformPrice} 积分</span>
                            <span className="text-[var(--slate-600)]">→</span>
                            <span className="text-white font-medium">{p.myPrice} 积分</span>
                            <span className="text-[#10B981]">+{(p.myPrice - p.platformPrice).toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                      {revealedKey.customPricing.length > 4 && (
                        <div className="text-[10px] text-[var(--slate-500)]">+{revealedKey.customPricing.length - 4} 个模型...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (revealedKey.fullKey) handleCopy('close', revealedKey.fullKey);
                  setTimeout(() => setRevealedKey(null), 500);
                }}
                className="px-5 py-2.5 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
              >
                复制并关闭
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Pause Confirmation ── */}
      <AnimatePresence>
        {pausingKey && (
          <Modal title="暂停 Key" onClose={() => setPausingKey(null)} maxWidth="400px">
            <div className="py-2">
              <div className="flex items-start gap-3 mb-4">
                <Pause className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                <div>
                  <p className="text-[14px] text-white">确定要暂停 Key &quot;{pausingKey.name}&quot; 吗？</p>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">
                    暂停后，该 Key 的 API 调用将被拒绝。您可以随时重新启用。
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setPausingKey(null)} className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handlePause} className="px-5 py-2 bg-[#F59E0B] text-white text-[13px] font-semibold rounded-lg hover:bg-[#D97706] transition-colors">确认暂停</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Enable Confirmation ── */}
      <AnimatePresence>
        {enablingKey && (
          <Modal title="启用 Key" onClose={() => setEnablingKey(null)} maxWidth="400px">
            <div className="py-2">
              <div className="flex items-start gap-3 mb-4">
                <Play className="w-5 h-5 text-[#10B981] mt-0.5" />
                <div>
                  <p className="text-[14px] text-white">确定要启用 Key &quot;{enablingKey.name}&quot; 吗？</p>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">
                    启用后，该 Key 将恢复 API 调用权限。
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setEnablingKey(null)} className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleEnable} className="px-5 py-2 bg-[#10B981] text-white text-[13px] font-semibold rounded-lg hover:bg-[#059669] transition-colors">确认启用</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Revoke Confirmation ── */}
      <AnimatePresence>
        {revokingKey && (
          <Modal title="撤销 Key" onClose={() => setRevokingKey(null)} maxWidth="400px">
            <div className="py-2">
              <div className="flex items-start gap-3 mb-4">
                <Ban className="w-5 h-5 text-[#F43F5E] mt-0.5" />
                <div>
                  <p className="text-[14px] text-white">确定要撤销 Key &quot;{revokingKey.name}&quot; 吗？</p>
                  <p className="text-[12px] text-[#F43F5E] mt-1">
                    撤销后，该 Key 将永久失效且无法恢复。所有使用该 Key 的调用将被立即拒绝。
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setRevokingKey(null)} className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleRevoke} className="px-5 py-2 bg-[#F43F5E] text-white text-[13px] font-semibold rounded-lg hover:bg-[#E11D48] transition-colors">确认撤销</button>
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
                  <p className="text-[14px] text-white">确定要删除 Key &quot;{deletingKey.name}&quot; 吗？</p>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">
                    此操作不可撤销。Key 记录将从列表中移除。
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeletingKey(null)} className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleDelete} className="px-5 py-2 bg-[#F43F5E] text-white text-[13px] font-semibold rounded-lg hover:bg-[#E11D48] transition-colors">确认删除</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
