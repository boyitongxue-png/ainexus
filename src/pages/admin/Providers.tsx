import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Pencil, Trash2, X, Search, Link,
  AlertTriangle,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

type Status = 'active' | 'inactive';

const statusConfig: Record<Status, { label: string; cls: string }> = {
  active: { label: '正常', cls: 'bg-[#10B981]/15 text-[#10B981]' },
  inactive: { label: '停用', cls: 'bg-[var(--slate-700)] text-[var(--slate-400)]' },
};

export default function AdminProviders() {
  const utils = trpc.useUtils();
  const { data: providerData, isLoading } = trpc.provider.list.useQuery();
  const createProvider = trpc.provider.create.useMutation({ onSuccess: () => { utils.provider.list.invalidate(); } });
  const updateProvider = trpc.provider.update.useMutation({ onSuccess: () => { utils.provider.list.invalidate(); } });
  const deleteProvider = trpc.provider.delete.useMutation({ onSuccess: () => { utils.provider.list.invalidate(); } });

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState(0);
  const [formName, setFormName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSort, setFormSort] = useState('0');
  const [formStatus, setFormStatus] = useState<Status>('active');
  const [error, setError] = useState('');

  const providers = useMemo(() => {
    if (!providerData) return [];
    return providerData.map(p => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      baseUrl: p.baseUrl,
      description: p.description,
      sortOrder: p.sortOrder || 0,
      status: (p.status || 'active') as Status,
      createdAt: p.createdAt,
    }));
  }, [providerData]);

  const filtered = useMemo(() => {
    return providers.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.displayName?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [providers, search]);

  const resetForm = () => {
    setFormName(''); setFormDisplayName(''); setFormBaseUrl(''); setFormDesc(''); setFormSort('0'); setFormStatus('active'); setError('');
  };

  const openAdd = () => { resetForm(); setModal('add'); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setFormName(p.name);
    setFormDisplayName(p.displayName || '');
    setFormBaseUrl(p.baseUrl || '');
    setFormDesc(p.description || '');
    setFormSort(String(p.sortOrder || 0));
    setFormStatus(p.status);
    setError('');
    setModal('edit');
  };

  const handleSave = () => {
    if (!formName.trim() || !formDisplayName.trim()) { setError('请填写供应商名称和显示名称'); return; }
    if (modal === 'add') {
      createProvider.mutate({ name: formName.trim(), displayName: formDisplayName.trim(), baseUrl: formBaseUrl || undefined, description: formDesc || undefined, sortOrder: Number(formSort) || 0, status: formStatus }, { onSuccess: () => setModal(null), onError: (e) => setError(e.message) });
    } else {
      updateProvider.mutate({ id: editId, name: formName.trim(), displayName: formDisplayName.trim(), baseUrl: formBaseUrl || undefined, description: formDesc || undefined, sortOrder: Number(formSort) || 0, status: formStatus }, { onSuccess: () => setModal(null), onError: (e) => setError(e.message) });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除该供应商吗？删除后关联的模型可能无法正常使用。')) {
      deleteProvider.mutate({ id });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">供应商管理</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">管理上游模型供应商，新增、编辑和删除供应商</p>
        </div>
        <button onClick={openAdd} className="h-10 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新增供应商
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索供应商..."
            className="h-10 pl-9 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-56" />
        </div>
      </div>

      {isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#3366FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--slate-400)]">加载中...</p>
        </div>
      )}

      {!isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-5 text-[11px] text-[var(--slate-400)] uppercase tracking-wider font-medium">排序</th>
                  <th className="py-3 px-5 text-[11px] text-[var(--slate-400)] uppercase tracking-wider font-medium">名称 / 显示名</th>
                  <th className="py-3 px-5 text-[11px] text-[var(--slate-400)] uppercase tracking-wider font-medium">API 地址</th>
                  <th className="py-3 px-5 text-[11px] text-[var(--slate-400)] uppercase tracking-wider font-medium">描述</th>
                  <th className="py-3 px-5 text-[11px] text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                  <th className="py-3 px-5 text-[11px] text-[var(--slate-400)] uppercase tracking-wider font-medium">创建时间</th>
                  <th className="py-3 px-5 text-[11px] text-[var(--slate-400)] uppercase tracking-wider font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-[var(--slate-500)]">暂无供应商</td></tr>
                )}
                {filtered.map(p => {
                  const scfg = statusConfig[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-[var(--dark-hover)] transition-colors group">
                      <td className="py-4 px-5 font-jetbrains text-sm text-[var(--slate-400)]">{p.sortOrder}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#3366FF]/15 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#3366FF]" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{p.displayName || p.name}</p>
                            <p className="text-[11px] text-[var(--slate-500)] font-jetbrains">{p.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        {p.baseUrl ? (
                          <a href={p.baseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7A9FFF] hover:text-[#3366FF] flex items-center gap-1 transition-colors">
                            <Link className="w-3 h-3" />{p.baseUrl.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--slate-500)]">-</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-xs text-[var(--slate-400)] max-w-[200px] truncate">{p.description || '-'}</td>
                      <td className="py-4 px-5"><span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${scfg.cls}`}>{scfg.label}</span></td>
                      <td className="py-4 px-5 text-xs text-[var(--slate-500)]">{new Date(p.createdAt).toLocaleDateString('zh-CN')}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)]" title="编辑"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)]" title="删除"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[var(--dark-border)] text-[12px] text-[var(--slate-400)]">
            共 {filtered.length} 条记录 {filtered.length !== providers.length && `(筛选自 ${providers.length} 条)`}
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl max-w-lg w-full p-6"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-space text-lg font-semibold text-white">{modal === 'add' ? '新增供应商' : '编辑供应商'}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">供应商编码 <span className="text-[#F43F5E]">*</span></label>
                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="如 openai"
                      className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF] placeholder:text-[var(--slate-600)]" />
                    <p className="text-[10px] text-[var(--slate-500)] mt-1">唯一标识，英文，如 openai、anthropic</p>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">显示名称 <span className="text-[#F43F5E]">*</span></label>
                    <input type="text" value={formDisplayName} onChange={e => setFormDisplayName(e.target.value)} placeholder="如 OpenAI"
                      className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF] placeholder:text-[var(--slate-600)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">API 基础地址</label>
                  <input type="text" value={formBaseUrl} onChange={e => setFormBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1"
                    className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF] placeholder:text-[var(--slate-600)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">描述</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="供应商描述..."
                    className="w-full h-16 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#3366FF] resize-none placeholder:text-[var(--slate-600)]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">排序</label>
                    <input type="number" value={formSort} onChange={e => setFormSort(e.target.value)}
                      className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--slate-400)] mb-1.5">状态</label>
                    <select value={formStatus} onChange={e => setFormStatus(e.target.value as Status)}
                      className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]">
                      <option value="active">正常</option>
                      <option value="inactive">停用</option>
                    </select>
                  </div>
                </div>
                {error && <p className="text-xs text-[#F43F5E] flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="px-4 py-2 text-xs text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg">取消</button>
                  <button onClick={handleSave}
                    disabled={createProvider.isPending || updateProvider.isPending}
                    className="px-5 py-2 bg-[#3366FF] text-white text-xs rounded-lg hover:bg-[#2244CC] transition-colors disabled:opacity-50">
                    {createProvider.isPending || updateProvider.isPending ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
