import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route, Plus, Pencil, Trash2, X, AlertTriangle, Clock,
  Zap, CheckCircle2, Search,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

type Priority = 'cost' | 'quality' | 'speed';

interface StrategyUI {
  id: number;
  name: string;
  primaryModel: string;
  fallbackModels: string[];
  timeout: number;
  priority: Priority;
}

const priorityLabels: Record<Priority, string> = { cost: '成本优先', quality: '质量优先', speed: '速度优先' };
const priorityIcons: Record<Priority, typeof Zap> = { cost: Clock, quality: CheckCircle2, speed: Zap };

function Modal({ title, onClose, children, maxWidth = '560px' }: {
  title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        style={{ maxWidth, width: '100%' }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space text-[18px] font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function ConsoleRouting() {
  const utils = trpc.useUtils();
  const { data: strategiesData, isLoading } = trpc.routeStrategy.list.useQuery();
  const { data: modelsData } = trpc.model.list.useQuery();

  const createStrategy = trpc.routeStrategy.create.useMutation({
    onSuccess: () => { utils.routeStrategy.list.invalidate(); },
  });
  const updateStrategy = trpc.routeStrategy.update.useMutation({
    onSuccess: () => { utils.routeStrategy.list.invalidate(); },
  });
  const deleteStrategy = trpc.routeStrategy.delete.useMutation({
    onSuccess: () => { utils.routeStrategy.list.invalidate(); },
  });

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StrategyUI | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formName, setFormName] = useState('');
  const [formPrimaryModel, setFormPrimaryModel] = useState('');
  const [formTimeout, setFormTimeout] = useState('30000');
  const [formPriority, setFormPriority] = useState<Priority>('quality');
  const [formError, setFormError] = useState('');

  const strategies: StrategyUI[] = useMemo(() => {
    if (!strategiesData) return [];
    const modelMap = new Map((modelsData || []).map((m) => [m.id, m.name]));
    return strategiesData.map((s) => ({
      id: s.id,
      name: s.name,
      primaryModel: modelMap.get(s.primaryModelId || 0) || '未知',
      fallbackModels: (s.fallbackModelIds as number[] || []).map((id) => modelMap.get(id) || '未知'),
      timeout: s.timeout,
      priority: s.priority as Priority,
    }));
  }, [strategiesData, modelsData]);

  const filtered = useMemo(() => {
    return strategies.filter((s) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.primaryModel.toLowerCase().includes(q);
    });
  }, [strategies, search]);

  const resetForm = useCallback(() => {
    setFormName('');
    setFormPrimaryModel('');
    setFormTimeout('30000');
    setFormPriority('quality');
    setFormError('');
  }, []);

  const openEdit = useCallback((s: StrategyUI) => {
    setEditing(s);
    setFormName(s.name);
    setFormTimeout(String(s.timeout));
    setFormPriority(s.priority);
    setFormError('');
  }, []);

  const handleCreate = useCallback(() => {
    if (!formName.trim()) { setFormError('策略名称必填'); return; }
    if (!formPrimaryModel) { setFormError('请选择主模型'); return; }
    const modelId = parseInt(formPrimaryModel);
    createStrategy.mutate({
      name: formName.trim(),
      primaryModelId: modelId,
      fallbackModelIds: [],
      timeout: Number(formTimeout) || 30000,
      priority: formPriority,
    }, {
      onSuccess: () => { setShowAdd(false); resetForm(); },
      onError: (err) => setFormError(err.message),
    });
  }, [formName, formPrimaryModel, formTimeout, formPriority, createStrategy, resetForm]);

  const handleEdit = useCallback(() => {
    if (!editing) return;
    updateStrategy.mutate({
      id: editing.id,
      name: formName.trim() || undefined,
      timeout: Number(formTimeout) || undefined,
      priority: formPriority,
    }, {
      onSuccess: () => { setEditing(null); resetForm(); },
      onError: (err) => setFormError(err.message),
    });
  }, [editing, formName, formTimeout, formPriority, updateStrategy, resetForm]);

  const handleDelete = useCallback(() => {
    if (deletingId !== null) {
      deleteStrategy.mutate({ id: deletingId }, { onSuccess: () => setDeletingId(null) });
    }
  }, [deletingId, deleteStrategy]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">路由策略</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">配置模型路由策略，设置超时时间和优先级</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索策略..."
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-9 pr-4 py-2.5 w-48 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
          </div>
          <button onClick={() => { resetForm(); setShowAdd(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-colors">
            <Plus className="w-4 h-4" /> 创建策略
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#3366FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[var(--slate-400)]">加载中...</p>
        </div>
      )}

      {!isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">策略名称</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">主模型</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">超时</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">优先级</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-[13px] text-[var(--slate-500)]">暂无策略</td></tr>
                )}
                {filtered.map((s) => {
                  const PIcon = priorityIcons[s.priority];
                  return (
                    <tr key={s.id} className="hover:bg-[var(--dark-hover)] transition-colors group">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#A855F7]/15 flex items-center justify-center">
                            <Route className="w-4 h-4 text-[#A855F7]" />
                          </div>
                          <span className="text-[13px] text-white font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[12px] text-[var(--dark-text)]">{s.primaryModel}</td>
                      <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains">{(s.timeout / 1000).toFixed(0)}s</td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium bg-[var(--dark-hover)] text-[var(--slate-300)]">
                          <PIcon className="w-3 h-3" /> {priorityLabels[s.priority]}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(s)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)]"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeletingId(s.id)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)]"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showAdd && (
          <Modal title="创建路由策略" onClose={() => { setShowAdd(false); resetForm(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">策略名称 <span className="text-[#F43F5E]">*</span></label>
                <input type="text" value={formName} onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
                  placeholder="如: GPT-4o 优先策略"
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">主模型 <span className="text-[#F43F5E]">*</span></label>
                <select value={formPrimaryModel} onChange={(e) => { setFormPrimaryModel(e.target.value); setFormError(''); }}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF]">
                  <option value="">请选择模型</option>
                  {(modelsData || []).map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">超时时间 (ms)</label>
                <input type="number" value={formTimeout} onChange={(e) => setFormTimeout(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] font-jetbrains" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">优先级</label>
                <div className="flex gap-2">
                  {(Object.keys(priorityLabels) as Priority[]).map((p) => {
                    const PIcon = priorityIcons[p];
                    return (
                      <button key={p} onClick={() => setFormPriority(p)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border transition-all ${
                          formPriority === p ? 'bg-[#3366FF]/15 text-[#3366FF] border-[#3366FF]/30' : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border-[var(--dark-border)]'
                        }`}>
                        <PIcon className="w-3.5 h-3.5" /> {priorityLabels[p]}
                      </button>
                    );
                  })}
                </div>
              </div>
              {formError && <p className="text-[12px] text-[#F43F5E]"><AlertTriangle className="w-3 h-3 inline mr-1" />{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowAdd(false); resetForm(); }}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg">取消</button>
                <button onClick={handleCreate}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC]"
                  disabled={createStrategy.isPending}>
                  {createStrategy.isPending ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <Modal title="编辑路由策略" onClose={() => { setEditing(null); resetForm(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">策略名称</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">超时时间 (ms)</label>
                <input type="number" value={formTimeout} onChange={(e) => setFormTimeout(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] font-jetbrains" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">优先级</label>
                <div className="flex gap-2">
                  {(Object.keys(priorityLabels) as Priority[]).map((p) => {
                    const PIcon = priorityIcons[p];
                    return (
                      <button key={p} onClick={() => setFormPriority(p)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border transition-all ${
                          formPriority === p ? 'bg-[#3366FF]/15 text-[#3366FF] border-[#3366FF]/30' : 'bg-[var(--dark-bg)] text-[var(--slate-400)] border-[var(--dark-border)]'
                        }`}>
                        <PIcon className="w-3.5 h-3.5" /> {priorityLabels[p]}
                      </button>
                    );
                  })}
                </div>
              </div>
              {formError && <p className="text-[12px] text-[#F43F5E]"><AlertTriangle className="w-3 h-3 inline mr-1" />{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setEditing(null); resetForm(); }}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg">取消</button>
                <button onClick={handleEdit}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC]"
                  disabled={updateStrategy.isPending}>
                  {updateStrategy.isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete */}
      {deletingId !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setDeletingId(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-5" style={{ maxWidth: 400, width: '100%' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#F43F5E] mt-0.5" />
              <p className="text-[14px] text-white">确定要删除此策略吗？此操作不可撤销。</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg">取消</button>
              <button onClick={handleDelete}
                className="px-5 py-2 bg-[#F43F5E] text-white text-[13px] font-semibold rounded-lg hover:bg-[#E11D48]">确认删除</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
