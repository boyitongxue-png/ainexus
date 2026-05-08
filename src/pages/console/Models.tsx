import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, MessageSquare, Image, Video, FileAudio, Database,
  Pencil, X, AlertTriangle,
  Search,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ModelType = 'text' | 'image' | 'video' | 'embedding' | 'audio';
type ModelStatus = 'active' | 'inactive' | 'beta';

interface ModelUI {
  id: number;
  name: string;
  provider: string;
  modelType: ModelType;
  apiIdentifier: string;
  asyncSupport: boolean;
  status: ModelStatus;
  inputCost: string;
  platformPrice: string;
  contextWindow: number;
  description: string | null;
}

const typeIconMap: Record<ModelType, typeof MessageSquare> = {
  text: MessageSquare,
  image: Image,
  video: Video,
  embedding: Database,
  audio: FileAudio,
};

const typeLabels: Record<ModelType, string> = {
  text: '文本', image: '图片', video: '视频', embedding: 'Embedding', audio: '音频',
};

const statusConfig: Record<ModelStatus, { label: string; cls: string }> = {
  active: { label: '正常', cls: 'bg-[#10B981]/15 text-[#10B981]' },
  inactive: { label: '停用', cls: 'bg-[var(--slate-700)] text-[var(--slate-400)]' },
  beta: { label: 'Beta', cls: 'bg-[#F59E0B]/15 text-[#F59E0B]' },
};

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
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        style={{ maxWidth, width: '100%' }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl"
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
export default function ConsoleModels() {
  const utils = trpc.useUtils();
  const { data: modelData, isLoading } = trpc.model.list.useQuery();

  const updateModel = trpc.model.update.useMutation({
    onSuccess: () => { utils.model.list.invalidate(); },
  });

  /* ── State ── */
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ModelType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ModelStatus | 'all'>('all');
  const [editingModel, setEditingModel] = useState<ModelUI | null>(null);

  /* ── Form ── */
  const [formName, setFormName] = useState('');
  const [formInputCost, setFormInputCost] = useState('');
  const [formOutputCost, setFormOutputCost] = useState('');
  const [formStatus, setFormStatus] = useState<ModelStatus>('active');
  const [formError, setFormError] = useState('');

  /* ── Map data ── */
  const models: ModelUI[] = useMemo(() => {
    if (!modelData) return [];
    return modelData.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      modelType: m.modelType as ModelType,
      apiIdentifier: m.apiIdentifier,
      asyncSupport: m.asyncSupport,
      status: m.status as ModelStatus,
      inputCost: m.inputCost || '0',
      platformPrice: m.platformPrice || '0',
      contextWindow: m.contextWindow,
      description: m.description,
    }));
  }, [modelData]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    return models.filter((m) => {
      if (typeFilter !== 'all' && m.modelType !== typeFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.apiIdentifier.toLowerCase().includes(q);
      }
      return true;
    });
  }, [models, typeFilter, statusFilter, search]);

  /* ── Edit ── */
  const openEdit = useCallback((m: ModelUI) => {
    setEditingModel(m);
    setFormName(m.name);
    setFormInputCost(m.inputCost);
    setFormOutputCost(m.platformPrice);
    setFormStatus(m.status);
    setFormError('');
  }, []);

  const handleSave = useCallback(() => {
    if (!editingModel) return;
    updateModel.mutate({
      id: editingModel.id,
      name: formName || undefined,
      inputCost: formInputCost || undefined,
      platformPrice: formOutputCost || undefined,
      status: formStatus,
    }, {
      onSuccess: () => setEditingModel(null),
      onError: (err) => setFormError(err.message),
    });
  }, [editingModel, formName, formInputCost, formOutputCost, formStatus, updateModel]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">模型管理</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">查看和管理平台接入的 AI 模型，调整定价和状态</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模型..."
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-9 pr-4 py-2.5 w-56 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(['all', 'text', 'image', 'video', 'embedding', 'audio'] as const).map((t) => {
          const Icon = t === 'all' ? Layers : typeIconMap[t as ModelType];
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all flex items-center gap-1.5 ${
                typeFilter === t ? 'bg-[#3366FF] text-white' : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
              }`}>
              <Icon className="w-3 h-3" />
              {t === 'all' ? '全部' : typeLabels[t as ModelType]}
            </button>
          );
        })}
        <div className="w-px h-5 bg-[var(--dark-border)]" />
        {(['all', 'active', 'inactive', 'beta'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all ${
              statusFilter === s ? 'bg-[#3366FF] text-white' : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
            }`}>
            {s === 'all' ? '全部' : statusConfig[s as ModelStatus].label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#3366FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[var(--slate-400)]">加载中...</p>
        </div>
      )}

      {/* ── Table ── */}
      {!isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">模型</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">类型</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">供应商</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">输入价格</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">输出价格</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">上下文</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-[13px] text-[var(--slate-500)]">暂无模型</td></tr>
                )}
                {filtered.map((model) => {
                  const TypeIcon = typeIconMap[model.modelType];
                  const scfg = statusConfig[model.status];
                  return (
                    <tr key={model.id} className="hover:bg-[var(--dark-hover)] transition-colors group">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
                            <TypeIcon className="w-4 h-4 text-[#3366FF]" />
                          </div>
                          <div>
                            <p className="text-[13px] text-white font-medium">{model.name}</p>
                            <p className="text-[11px] text-[var(--slate-500)] font-jetbrains">{model.apiIdentifier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-[12px] text-[var(--slate-300)]">{typeLabels[model.modelType]}</span>
                      </td>
                      <td className="py-3 px-5 text-[12px] text-white">{model.provider}</td>
                      <td className="py-3 px-5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${scfg.cls}`}>{scfg.label}</span>
                      </td>
                      <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains">{model.inputCost}/1K</td>
                      <td className="py-3 px-5 text-[12px] text-[#F59E0B] font-jetbrains">{model.platformPrice}/1K</td>
                      <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains">{model.contextWindow > 0 ? `${(model.contextWindow / 1000).toFixed(0)}k` : '-'}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(model)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors" title="编辑">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[var(--dark-border)] text-[12px] text-[var(--slate-400)]">
            共 {filtered.length} 条记录
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editingModel && (
          <Modal title={`编辑模型: ${editingModel.name}`} onClose={() => setEditingModel(null)}>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">显示名称</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">输入价格 (积分/1K tokens)</label>
                  <input type="text" value={formInputCost} onChange={(e) => setFormInputCost(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors font-jetbrains" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">输出价格 (积分/1K tokens)</label>
                  <input type="text" value={formOutputCost} onChange={(e) => setFormOutputCost(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors font-jetbrains" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">状态</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as ModelStatus)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors">
                  <option value="active">正常</option>
                  <option value="inactive">停用</option>
                  <option value="beta">Beta</option>
                </select>
              </div>
              {formError && <p className="text-[12px] text-[#F43F5E] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {formError}</p>}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setEditingModel(null)}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleSave}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
                  disabled={updateModel.isPending}>
                  {updateModel.isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
