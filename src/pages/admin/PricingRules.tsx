import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Power, PowerOff, X } from 'lucide-react';
import { pricingRules, modelConfigEntries } from '@/lib/adminMockData';

export default function PricingRules() {
  const [rules, setRules] = useState(pricingRules);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModal, setEditModal] = useState<{ mode: 'add' | 'edit'; rule: typeof pricingRules[0] | null }>({ mode: 'add', rule: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<typeof pricingRules[0]>>({});
  const [tierInput, setTierInput] = useState({ threshold: '', discount: '' });

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.model.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rules, search, statusFilter]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditModal({ mode: 'add', rule: null });
    setForm({});
  };

  const openAdd = () => {
    setForm({
      billingUnit: '1K tokens',
      creditCost: 0,
      tierRules: [],
      failRefund: true,
      status: 'active',
      effectiveTime: new Date().toISOString().split('T')[0],
    });
    setTierInput({ threshold: '', discount: '' });
    setEditModal({ mode: 'add', rule: null });
    setIsModalOpen(true);
  };

  const openEdit = (rule: typeof pricingRules[0]) => {
    setForm({ ...rule });
    setTierInput({ threshold: '', discount: '' });
    setEditModal({ mode: 'edit', rule });
    setIsModalOpen(true);
  };

  const toggleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'active' ? ('inactive' as const) : ('active' as const) } : r))
    );
  };

  const addTier = () => {
    if (!tierInput.threshold || !tierInput.discount) return;
    const tiers = [...(form.tierRules || []), { threshold: parseInt(tierInput.threshold), discount: parseFloat(tierInput.discount) }];
    setForm({ ...form, tierRules: tiers });
    setTierInput({ threshold: '', discount: '' });
  };

  const removeTier = (index: number) => {
    const tiers = (form.tierRules || []).filter((_, i) => i !== index);
    setForm({ ...form, tierRules: tiers });
  };

  const handleSave = () => {
    if (!form.name || !form.model || !form.apiType) return;
    if (editModal.mode === 'edit' && editModal.rule) {
      setRules((prev) =>
        prev.map((r) => (r.id === editModal.rule!.id ? { ...r, ...form } as typeof pricingRules[0] : r))
      );
    } else {
      const newRule = {
        ...form as typeof pricingRules[0],
        id: `PR-${String(rules.length + 1).padStart(3, '0')}`,
      };
      setRules((prev) => [...prev, newRule]);
    }
    closeModal();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">价格规则</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">配置平台积分扣减逻辑和充值定价</p>
        </div>
        <button onClick={openAdd} className="h-10 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加规则
        </button>
      </div>

      {/* Base Rate Card */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h3 className="font-space text-lg font-semibold text-white mb-4">基础汇率</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1.5">积分兑人民币汇率</label>
            <div className="flex items-center gap-2">
              <input type="number" defaultValue="1000" className="h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF] w-28" />
              <span className="text-sm text-[var(--slate-400)]">积分 = ¥1</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1.5">新用户赠送积分</label>
            <input type="number" defaultValue="1000" className="h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF] w-36" />
          </div>
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1.5">最低充值金额</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--slate-400)]">¥</span>
              <input type="number" defaultValue="10" className="h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF] w-28" />
            </div>
          </div>
        </div>
        <button onClick={() => alert('汇率已保存：1元 = 10积分')} className="mt-4 h-9 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors">
          保存汇率
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1">
          {['all', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                statusFilter === s ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
              }`}
            >
              {s === 'all' ? '全部' : s === 'active' ? '启用' : '禁用'}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索规则名称、模型..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-64"
          />
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">规则名称</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">API 类型</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">模型</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">计费单位</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">积分消耗</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">阶梯折扣</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">失败退款</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">生效时间</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5 text-sm text-white font-medium">{r.name}</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{r.apiType}</td>
                  <td className="py-4 px-5 text-sm text-white">{r.model}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{r.billingUnit}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{r.creditCost}</td>
                  <td className="py-4 px-5">
                    {r.tierRules.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {r.tierRules.map((t, i) => (
                          <span key={i} className="text-xs text-[#7A9FFF]">
                            ≥{t.threshold.toLocaleString()} : {(t.discount * 10).toFixed(1)}折
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--slate-500)]">无</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{r.failRefund ? '是' : '否'}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{r.effectiveTime}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[var(--slate-700)] text-[var(--slate-400)]'
                    }`}>
                      {r.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(r.id)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                        {r.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的价格规则</div>
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
                <h3 className="text-lg font-semibold text-white">{editModal.mode === 'add' ? '添加价格规则' : '编辑价格规则'}</h3>
                <button onClick={closeModal} className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">规则名称 <span className="text-[#F43F5E]">*</span></label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="如 GPT-4o标准定价"
                    className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">API 类型 <span className="text-[#F43F5E]">*</span></label>
                    <select
                      value={form.apiType || ''}
                      onChange={(e) => setForm({ ...form, apiType: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    >
                      <option value="">选择类型</option>
                      <option value="chat.completion">chat.completion</option>
                      <option value="image.generation">image.generation</option>
                      <option value="video.generation">video.generation</option>
                      <option value="embedding">embedding</option>
                      <option value="audio.transcription">audio.transcription</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">模型 <span className="text-[#F43F5E]">*</span></label>
                    <select
                      value={form.model || ''}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    >
                      <option value="">选择模型</option>
                      {modelConfigEntries.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">计费单位</label>
                    <select
                      value={form.billingUnit || '1K tokens'}
                      onChange={(e) => setForm({ ...form, billingUnit: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    >
                      <option value="1K tokens">1K tokens</option>
                      <option value="per image">per image</option>
                      <option value="per video">per video</option>
                      <option value="per request">per request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">积分消耗</label>
                    <input
                      type="number"
                      value={form.creditCost || 0}
                      onChange={(e) => setForm({ ...form, creditCost: parseFloat(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">阶梯折扣</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={tierInput.threshold}
                      onChange={(e) => setTierInput({ ...tierInput, threshold: e.target.value })}
                      placeholder="阈值"
                      className="flex-1 h-9 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                    />
                    <input
                      type="number"
                      step="0.1"
                      max="1"
                      value={tierInput.discount}
                      onChange={(e) => setTierInput({ ...tierInput, discount: e.target.value })}
                      placeholder="折扣 (0-1)"
                      className="flex-1 h-9 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                    />
                    <button onClick={addTier} className="h-9 px-3 bg-[#3366FF] text-white text-xs rounded-lg hover:bg-[#2244CC] transition-colors">
                      添加
                    </button>
                  </div>
                  {(form.tierRules || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(form.tierRules || []).map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--dark-bg)] border border-[var(--dark-border)] text-xs text-[#7A9FFF]">
                          ≥{t.threshold.toLocaleString()} : {(t.discount * 10).toFixed(1)}折
                          <button onClick={() => removeTier(i)} className="text-[var(--slate-500)] hover:text-[#F43F5E]">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">生效时间</label>
                    <input
                      type="date"
                      value={form.effectiveTime || ''}
                      onChange={(e) => setForm({ ...form, effectiveTime: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-[var(--slate-300)] cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={!!form.failRefund}
                        onChange={(e) => setForm({ ...form, failRefund: e.target.checked })}
                        className="w-4 h-4 rounded border-[var(--dark-border)] bg-[var(--dark-bg)] text-[#3366FF]"
                      />
                      失败退款
                    </label>
                  </div>
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
