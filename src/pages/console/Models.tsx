import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, MessageSquare, Image, Video, FileAudio, Database,
  Pencil, X, AlertTriangle, Search, DollarSign, TrendingUp,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ModelType = 'text' | 'image' | 'video' | 'embedding' | 'audio';
type ModelStatus = 'active' | 'inactive' | 'beta';
type BillingMode = 'per_token' | 'per_image' | 'per_second' | 'per_request';

interface ModelUI {
  id: number;
  name: string;
  provider: string;
  modelType: ModelType;
  apiIdentifier: string;
  asyncSupport: boolean;
  status: ModelStatus;
  billingMode: BillingMode;
  billingUnit: string;
  // Pricing tiers
  supplierInputCost: string;
  supplierOutputCost: string;
  exchangeRate: string;
  myInputCost: string;
  myOutputCost: string;
  channelInputPrice: string;
  channelOutputPrice: string;
  retailInputPrice: string;
  retailOutputPrice: string;
  // Legacy
  inputCost: string;
  platformPrice: string;
  contextWindow: number;
  description: string | null;
}

const typeIconMap: Record<ModelType, typeof MessageSquare> = {
  text: MessageSquare, image: Image, video: Video, embedding: Database, audio: FileAudio,
};

const typeLabels: Record<ModelType, string> = {
  text: '文本', image: '图片', video: '视频', embedding: 'Embedding', audio: '音频',
};

const billingModeLabels: Record<BillingMode, string> = {
  per_token: '按Token', per_image: '按张', per_second: '按秒', per_request: '按次',
};

const statusConfig: Record<ModelStatus, { label: string; cls: string }> = {
  active: { label: '正常', cls: 'bg-[#10B981]/15 text-[#10B981]' },
  inactive: { label: '停用', cls: 'bg-[var(--slate-700)] text-[var(--slate-400)]' },
  beta: { label: 'Beta', cls: 'bg-[#F59E0B]/15 text-[#F59E0B]' },
};

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */
function Modal({ title, onClose, children, maxWidth = '720px' }: {
  title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        style={{ maxWidth, width: '100%' }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
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

  /* ── Form state for multi-level pricing ── */
  const [formName, setFormName] = useState('');
  const [formBillingMode, setFormBillingMode] = useState<BillingMode>('per_token');
  const [formBillingUnit, setFormBillingUnit] = useState('1M');
  // Supplier cost (USD)
  const [formSupplierInputCost, setFormSupplierInputCost] = useState('0');
  const [formSupplierOutputCost, setFormSupplierOutputCost] = useState('0');
  const [formExchangeRate, setFormExchangeRate] = useState('7.2000');
  // My cost (RMB)
  const [formMyInputCost, setFormMyInputCost] = useState('0');
  const [formMyOutputCost, setFormMyOutputCost] = useState('0');
  // Channel price (RMB)
  const [formChannelInputPrice, setFormChannelInputPrice] = useState('0');
  const [formChannelOutputPrice, setFormChannelOutputPrice] = useState('0');
  // Retail price (RMB)
  const [formRetailInputPrice, setFormRetailInputPrice] = useState('0');
  const [formRetailOutputPrice, setFormRetailOutputPrice] = useState('0');
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
      billingMode: (m.billingMode || 'per_token') as BillingMode,
      billingUnit: m.billingUnit || '1M',
      supplierInputCost: m.supplierInputCost || '0',
      supplierOutputCost: m.supplierOutputCost || '0',
      exchangeRate: m.exchangeRate || '7.2000',
      myInputCost: m.myInputCost || '0',
      myOutputCost: m.myOutputCost || '0',
      channelInputPrice: m.channelInputPrice || '0',
      channelOutputPrice: m.channelOutputPrice || '0',
      retailInputPrice: m.retailInputPrice || '0',
      retailOutputPrice: m.retailOutputPrice || '0',
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

  /* ── Auto-calculate prices ── */
  const autoCalculate = useCallback(() => {
    const sIn = parseFloat(formSupplierInputCost) || 0;
    const sOut = parseFloat(formSupplierOutputCost) || 0;
    const rate = parseFloat(formExchangeRate) || 7.2;
    // My cost = supplier cost * exchange rate * 1.0 (no markup yet)
    const myIn = (sIn * rate).toFixed(6);
    const myOut = (sOut * rate).toFixed(6);
    // Channel price = my cost * 1.2 (20% markup default)
    const chIn = (parseFloat(myIn) * 1.2).toFixed(6);
    const chOut = (parseFloat(myOut) * 1.2).toFixed(6);
    // Retail price = channel price * 1.15 (15% markup default)
    const rtIn = (parseFloat(chIn) * 1.15).toFixed(6);
    const rtOut = (parseFloat(chOut) * 1.15).toFixed(6);
    setFormMyInputCost(myIn);
    setFormMyOutputCost(myOut);
    setFormChannelInputPrice(chIn);
    setFormChannelOutputPrice(chOut);
    setFormRetailInputPrice(rtIn);
    setFormRetailOutputPrice(rtOut);
  }, [formSupplierInputCost, formSupplierOutputCost, formExchangeRate]);

  /* ── Edit ── */
  const openEdit = useCallback((m: ModelUI) => {
    setEditingModel(m);
    setFormName(m.name);
    setFormBillingMode(m.billingMode);
    setFormBillingUnit(m.billingUnit);
    setFormSupplierInputCost(m.supplierInputCost);
    setFormSupplierOutputCost(m.supplierOutputCost);
    setFormExchangeRate(m.exchangeRate);
    setFormMyInputCost(m.myInputCost);
    setFormMyOutputCost(m.myOutputCost);
    setFormChannelInputPrice(m.channelInputPrice);
    setFormChannelOutputPrice(m.channelOutputPrice);
    setFormRetailInputPrice(m.retailInputPrice);
    setFormRetailOutputPrice(m.retailOutputPrice);
    setFormStatus(m.status);
    setFormError('');
  }, []);

  const handleSave = useCallback(() => {
    if (!editingModel) return;
    updateModel.mutate({
      id: editingModel.id,
      name: formName || undefined,
      billingMode: formBillingMode,
      billingUnit: formBillingUnit,
      supplierInputCost: formSupplierInputCost || undefined,
      supplierOutputCost: formSupplierOutputCost || undefined,
      exchangeRate: formExchangeRate || undefined,
      myInputCost: formMyInputCost || undefined,
      myOutputCost: formMyOutputCost || undefined,
      channelInputPrice: formChannelInputPrice || undefined,
      channelOutputPrice: formChannelOutputPrice || undefined,
      retailInputPrice: formRetailInputPrice || undefined,
      retailOutputPrice: formRetailOutputPrice || undefined,
      status: formStatus,
    }, {
      onSuccess: () => setEditingModel(null),
      onError: (err) => setFormError(err.message),
    });
  }, [editingModel, formName, formBillingMode, formBillingUnit, formSupplierInputCost, formSupplierOutputCost,
      formExchangeRate, formMyInputCost, formMyOutputCost, formChannelInputPrice, formChannelOutputPrice,
      formRetailInputPrice, formRetailOutputPrice, formStatus, updateModel]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">模型管理</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">管理 AI 模型的多级分销定价体系</p>
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
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">模型</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">计费</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">上游成本<br/><span className="text-[10px] normal-case">USD</span></th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">我的成本<br/><span className="text-[10px] normal-case">RMB</span></th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">渠道价<br/><span className="text-[10px] normal-case">RMB</span></th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">零售价<br/><span className="text-[10px] normal-case">RMB</span></th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
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
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#3366FF]/15 flex items-center justify-center shrink-0">
                            <TypeIcon className="w-4 h-4 text-[#3366FF]" />
                          </div>
                          <div>
                            <p className="text-[13px] text-white font-medium">{model.name}</p>
                            <p className="text-[11px] text-[var(--slate-500)] font-jetbrains">{model.apiIdentifier}</p>
                            <p className="text-[10px] text-[var(--slate-500)]">{model.provider}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-300)]">
                          {billingModeLabels[model.billingMode]}
                        </span>
                        <p className="text-[10px] text-[var(--slate-500)] mt-0.5">{model.billingUnit}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-[12px] text-[var(--slate-400)] font-jetbrains">{parseFloat(model.supplierInputCost).toFixed(4)}</p>
                        {parseFloat(model.supplierOutputCost) > 0 && (
                          <p className="text-[11px] text-[var(--slate-500)] font-jetbrains">{parseFloat(model.supplierOutputCost).toFixed(4)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-[12px] text-[#7A9FFF] font-jetbrains font-medium">{parseFloat(model.myInputCost).toFixed(4)}</p>
                        {parseFloat(model.myOutputCost) > 0 && (
                          <p className="text-[11px] text-[var(--slate-500)] font-jetbrains">{parseFloat(model.myOutputCost).toFixed(4)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-[12px] text-[#F59E0B] font-jetbrains font-medium">{parseFloat(model.channelInputPrice).toFixed(4)}</p>
                        {parseFloat(model.channelOutputPrice) > 0 && (
                          <p className="text-[11px] text-[var(--slate-500)] font-jetbrains">{parseFloat(model.channelOutputPrice).toFixed(4)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-[12px] text-[#10B981] font-jetbrains font-medium">{parseFloat(model.retailInputPrice).toFixed(4)}</p>
                        {parseFloat(model.retailOutputPrice) > 0 && (
                          <p className="text-[11px] text-[var(--slate-500)] font-jetbrains">{parseFloat(model.retailOutputPrice).toFixed(4)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${scfg.cls}`}>{scfg.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(model)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors" title="编辑定价">
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
            共 {filtered.length} 条记录 | 多级定价体系：上游成本(USD) → 我的成本(RMB) → 渠道价(RMB) → 零售价(RMB)
          </div>
        </div>
      )}

      {/* ── Edit Modal (Multi-Level Pricing) ── */}
      <AnimatePresence>
        {editingModel && (
          <Modal title={`编辑定价: ${editingModel.name}`} onClose={() => setEditingModel(null)}>
            <div className="space-y-4 mt-2">
              {/* Basic info */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">显示名称</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">计费模式</label>
                  <select value={formBillingMode} onChange={(e) => setFormBillingMode(e.target.value as BillingMode)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors">
                    <option value="per_token">按 Token</option>
                    <option value="per_image">按张</option>
                    <option value="per_second">按秒</option>
                    <option value="per_request">按次</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">计费单位</label>
                  <input type="text" value={formBillingUnit} onChange={(e) => setFormBillingUnit(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
                </div>
              </div>

              {/* Supplier Cost (USD) */}
              <div className="p-3 rounded-lg border border-[#F43F5E]/20 bg-[#F43F5E]/5">
                <h4 className="text-[12px] font-semibold text-[#F43F5E] mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  上游供应商成本 (USD)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输入成本 USD</label>
                    <input type="text" value={formSupplierInputCost} onChange={(e) => setFormSupplierInputCost(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F43F5E] transition-colors font-jetbrains" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输出成本 USD</label>
                    <input type="text" value={formSupplierOutputCost} onChange={(e) => setFormSupplierOutputCost(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F43F5E] transition-colors font-jetbrains" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">汇率 USD→RMB</label>
                    <input type="text" value={formExchangeRate} onChange={(e) => setFormExchangeRate(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F43F5E] transition-colors font-jetbrains" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={autoCalculate}
                      className="w-full h-[34px] bg-[#3366FF] text-white text-[12px] font-medium rounded-lg hover:bg-[#2244CC] transition-colors flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" /> 自动计算下级价格
                    </button>
                  </div>
                </div>
              </div>

              {/* My Cost (RMB) */}
              <div className="p-3 rounded-lg border border-[#7A9FFF]/20 bg-[#7A9FFF]/5">
                <h4 className="text-[12px] font-semibold text-[#7A9FFF] mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  我的成本 (RMB)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输入成本 RMB</label>
                    <input type="text" value={formMyInputCost} onChange={(e) => setFormMyInputCost(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7A9FFF] transition-colors font-jetbrains" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输出成本 RMB</label>
                    <input type="text" value={formMyOutputCost} onChange={(e) => setFormMyOutputCost(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7A9FFF] transition-colors font-jetbrains" />
                  </div>
                </div>
              </div>

              {/* Channel Price (RMB) */}
              <div className="p-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5">
                <h4 className="text-[12px] font-semibold text-[#F59E0B] mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  渠道伙伴进货价 (RMB)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输入价格 RMB</label>
                    <input type="text" value={formChannelInputPrice} onChange={(e) => setFormChannelInputPrice(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F59E0B] transition-colors font-jetbrains" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输出价格 RMB</label>
                    <input type="text" value={formChannelOutputPrice} onChange={(e) => setFormChannelOutputPrice(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F59E0B] transition-colors font-jetbrains" />
                  </div>
                </div>
              </div>

              {/* Retail Price (RMB) */}
              <div className="p-3 rounded-lg border border-[#10B981]/20 bg-[#10B981]/5">
                <h4 className="text-[12px] font-semibold text-[#10B981] mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  零售指导价 (RMB)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输入价格 RMB</label>
                    <input type="text" value={formRetailInputPrice} onChange={(e) => setFormRetailInputPrice(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#10B981] transition-colors font-jetbrains" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">输出价格 RMB</label>
                    <input type="text" value={formRetailOutputPrice} onChange={(e) => setFormRetailOutputPrice(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#10B981] transition-colors font-jetbrains" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">状态</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as ModelStatus)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors">
                  <option value="active">正常</option>
                  <option value="inactive">停用</option>
                  <option value="beta">Beta</option>
                </select>
              </div>

              {/* Profit margin summary */}
              <div className="p-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--slate-400)]">渠道利润空间</span>
                  <span className="text-[#F59E0B] font-medium">
                    {(() => {
                      const myIn = parseFloat(formMyInputCost) || 0;
                      const chIn = parseFloat(formChannelInputPrice) || 0;
                      if (myIn === 0) return '0%';
                      return `+${(((chIn - myIn) / myIn) * 100).toFixed(1)}%`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-[var(--slate-400)]">零售利润空间</span>
                  <span className="text-[#10B981] font-medium">
                    {(() => {
                      const chIn = parseFloat(formChannelInputPrice) || 0;
                      const rtIn = parseFloat(formRetailInputPrice) || 0;
                      if (chIn === 0) return '0%';
                      return `+${(((rtIn - chIn) / chIn) * 100).toFixed(1)}%`;
                    })()}
                  </span>
                </div>
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
