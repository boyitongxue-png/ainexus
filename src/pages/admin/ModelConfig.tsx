import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Power, PowerOff, Brain, Image, Video, AudioLines, Hash, X, Cpu } from 'lucide-react';
import { modelConfigEntries, providerHealthData } from '@/lib/adminMockData';
import { providerColors } from '@/lib/adminMockData';
import { trpc } from '@/providers/trpc';

/* ── Provider Select: reads from provider management ── */
function ProviderSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: providers } = trpc.provider.list.useQuery();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
    >
      <option value="">请选择供应商</option>
      {providers?.filter(p => p.status === 'active').map(p => (
        <option key={p.id} value={p.name}>{p.displayName || p.name}</option>
      ))}
    </select>
  );
}

const modelTypeIcons: Record<string, typeof Brain> = {
  text: Brain,
  image: Image,
  video: Video,
  embedding: Hash,
  audio: AudioLines,
};

const modelTypeColors: Record<string, string> = {
  text: '#3366FF',
  image: '#A855F7',
  video: '#F43F5E',
  embedding: '#34D399',
  audio: '#FBBF24',
};

export default function AdminModelConfig() {
  const [models, setModels] = useState(modelConfigEntries);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [editModal, setEditModal] = useState<{ mode: 'add' | 'edit'; model: typeof modelConfigEntries[0] | null }>({ mode: 'add', model: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<typeof modelConfigEntries[0]>>({});

  const providers = ['all', ...Array.from(new Set(modelConfigEntries.map((m) => m.provider)))];

  const filtered = useMemo(() => {
    return models.filter((m) => {
      const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.apiIdentifier.toLowerCase().includes(search.toLowerCase());
      const matchProvider = providerFilter === 'all' || m.provider === providerFilter;
      return matchSearch && matchProvider;
    });
  }, [models, search, providerFilter]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditModal({ mode: 'add', model: null });
    setForm({});
  };

  const openAdd = () => {
    setForm({
      provider: 'OpenAI',
      modelType: 'text',
      asyncSupport: false,
      defaultTimeout: 30,
      defaultRetries: 3,
      status: 'active',
      capabilities: [],
      inputCost: 0,
      platformPrice: 0,
      contextWindow: 128000,
    });
    setEditModal({ mode: 'add', model: null });
    setIsModalOpen(true);
  };

  const openEdit = (model: typeof modelConfigEntries[0]) => {
    setForm({ ...model });
    setEditModal({ mode: 'edit', model });
    setIsModalOpen(true);
  };

  const toggleStatus = (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: m.status === 'active' ? ('inactive' as const) : ('active' as const) } : m))
    );
  };

  const handleSave = () => {
    if (!form.name || !form.apiIdentifier) return;
    if (editModal.mode === 'edit' && editModal.model) {
      setModels((prev) =>
        prev.map((m) => (m.id === editModal.model!.id ? { ...m, ...form } as typeof modelConfigEntries[0] : m))
      );
    } else {
      const newModel = {
        ...form as typeof modelConfigEntries[0],
        id: `MC-${String(models.length + 1).padStart(3, '0')}`,
      };
      setModels((prev) => [...prev, newModel]);
    }
    closeModal();
  };

  const typeIcon = (type: string) => {
    const Icon = modelTypeIcons[type] || Brain;
    const color = modelTypeColors[type] || '#3366FF';
    return <Icon className="w-4 h-4" style={{ color }} />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">模型配置</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">配置平台支持的 AI 模型与供应商映射</p>
        </div>
        <button onClick={openAdd} className="h-10 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加模型
        </button>
      </div>

      {/* Provider Health */}
      <div className="flex flex-wrap gap-3">
        {providerHealthData.map((p) => (
          <div key={p.name} className="flex items-center gap-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-2.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: p.status === 'healthy' ? '#34D399' : p.status === 'warning' ? '#FBBF24' : '#F43F5E',
              }}
            />
            <span className="text-sm text-white font-medium">{p.name}</span>
            <span className="text-xs text-[var(--slate-500)]">{p.modelCount} 模型</span>
            <span className="text-xs text-[var(--slate-400)]">{p.todayCalls}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1">
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                providerFilter === p ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
              }`}
            >
              {p === 'all' ? '全部' : p}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索模型名称、API ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">模型</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">供应商</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">类型</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">API 标识</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">异步</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">超时/重试</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">上游成本</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">平台积分定价</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">利润空间</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${modelTypeColors[m.modelType] || '#3366FF'}15` }}>
                        {typeIcon(m.modelType)}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{m.name}</p>
                        <p className="text-xs text-[var(--slate-500)]">{m.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-sm font-medium" style={{ color: providerColors[m.provider] || '#94A3B8' }}>{m.provider}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-300)] capitalize">
                      {m.modelType}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-jetbrains text-xs text-[#7A9FFF]">{m.apiIdentifier}</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{m.asyncSupport ? '是' : '否'}</td>
                  <td className="py-4 px-5 text-sm text-white">{m.defaultTimeout}s / {m.defaultRetries}次</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-[var(--slate-500)]">{m.inputCost ?? m.costPer1MTokens ?? 0}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{m.platformPrice ?? m.costPer1MTokens ?? 0}</td>
                  <td className="py-4 px-5">
                    <span className="text-xs font-medium text-[#10B981]">
                      +{((m.platformPrice ?? m.costPer1MTokens ?? 0) - (m.inputCost ?? m.costPer1MTokens ?? 0)).toFixed(4)}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[var(--slate-700)] text-[var(--slate-400)]'
                    }`}>
                      {m.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(m.id)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors" title={m.status === 'active' ? '禁用' : '启用'}>
                        {m.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的模型</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl shadow-2xl z-[110] p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">{editModal.mode === 'add' ? '添加模型' : '编辑模型'}</h3>
                <button onClick={closeModal} className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">模型名称 <span className="text-[#F43F5E]">*</span></label>
                    <input
                      type="text"
                      value={form.name || ''}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="如 GPT-4o"
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">API 标识 <span className="text-[#F43F5E]">*</span></label>
                    <input
                      type="text"
                      value={form.apiIdentifier || ''}
                      onChange={(e) => setForm({ ...form, apiIdentifier: e.target.value })}
                      placeholder="如 gpt-4o"
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">供应商 <span className="text-[#F43F5E]">*</span></label>
                    <ProviderSelect value={form.provider || ''} onChange={(v) => setForm({ ...form, provider: v })} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">模型类型 <span className="text-[#F43F5E]">*</span></label>
                    <select
                      value={form.modelType || 'text'}
                      onChange={(e) => setForm({ ...form, modelType: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    >
                      {['text', 'image', 'video', 'embedding', 'audio'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">超时 (秒)</label>
                    <input
                      type="number"
                      value={form.defaultTimeout || 30}
                      onChange={(e) => setForm({ ...form, defaultTimeout: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">重试次数</label>
                    <input
                      type="number"
                      value={form.defaultRetries || 3}
                      onChange={(e) => setForm({ ...form, defaultRetries: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">上游成本 (积分/1M) <span className="text-[#F43F5E]">*</span></label>
                    <input
                      type="number"
                      step="0.0001"
                      value={form.inputCost ?? form.costPer1MTokens ?? 0}
                      onChange={(e) => setForm({ ...form, inputCost: parseFloat(e.target.value) })}
                      placeholder="供应商实际成本"
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">平台积分定价 (积分/1M) <span className="text-[#F43F5E]">*</span></label>
                    <input
                      type="number"
                      step="0.0001"
                      value={form.platformPrice ?? 0}
                      onChange={(e) => setForm({ ...form, platformPrice: parseFloat(e.target.value) })}
                      placeholder="对外销售价格"
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[#3366FF]/30 text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                </div>
                {/* 上游对接配置 */}
                <div className="p-3 rounded-lg border border-[#3366FF]/20 bg-[#3366FF]/5">
                  <h4 className="text-xs font-semibold text-[#3366FF] mb-3 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    上游对接配置
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[var(--slate-400)] mb-1.5">Base URL <span className="text-[#F43F5E]">*</span></label>
                      <input
                        type="text"
                        value={form.baseUrl || ''}
                        onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                        placeholder="https://api.openai.com/v1"
                        className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--slate-400)] mb-1.5">上游 API Key <span className="text-[#F43F5E]">*</span></label>
                      <input
                        type="text"
                        value={form.upstreamKeyId || ''}
                        onChange={(e) => setForm({ ...form, upstreamKeyId: e.target.value })}
                        placeholder="输入上游 API Key 或密钥标识"
                        className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--slate-400)] mb-1.5">自定义请求路径（可选）</label>
                      <input
                        type="text"
                        value={form.customPath || ''}
                        onChange={(e) => setForm({ ...form, customPath: e.target.value })}
                        placeholder="如 /chat/completions，留空使用默认路径"
                        className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                      />
                    </div>
                  </div>
                </div>

                {/* 利润空间提示 */}
                {((form.platformPrice ?? 0) > 0 || (form.inputCost ?? form.costPer1MTokens ?? 0) > 0) && (
                  <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-between">
                    <span className="text-xs text-[var(--slate-400)]">利润空间</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#10B981]">
                        +{((form.platformPrice ?? 0) - (form.inputCost ?? form.costPer1MTokens ?? 0)).toFixed(4)} 积分/1M
                      </span>
                      <span className="text-xs text-[#10B981]">
                        ({(form.inputCost ?? form.costPer1MTokens ?? 0) > 0
                          ? (((form.platformPrice ?? 0) - (form.inputCost ?? form.costPer1MTokens ?? 0)) / (form.inputCost ?? form.costPer1MTokens ?? 0) * 100).toFixed(0)
                          : 0}%)
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">描述</label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="模型描述..."
                    className="w-full h-16 px-3 py-2 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] resize-none"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-[var(--slate-300)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.asyncSupport}
                      onChange={(e) => setForm({ ...form, asyncSupport: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--dark-border)] bg-[var(--dark-bg)] text-[#3366FF] focus:ring-[#3366FF]"
                    />
                    支持异步
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--slate-300)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.status === 'active'}
                      onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : ('inactive' as const) })}
                      className="w-4 h-4 rounded border-[var(--dark-border)] bg-[var(--dark-bg)] text-[#3366FF] focus:ring-[#3366FF]"
                    />
                    启用
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 h-10 rounded-lg text-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]">
                  取消
                </button>
                <button onClick={handleSave} className="flex-1 h-10 rounded-lg bg-[#3366FF] text-white text-sm font-medium hover:bg-[#2244CC] transition-colors">
                  保存
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
