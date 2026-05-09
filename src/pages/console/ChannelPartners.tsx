import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Pencil, Trash2, X, AlertTriangle, Search,
  Percent, DollarSign, Settings,
  Tag,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type MarkupType = 'fixed_amount' | 'percentage' | 'custom';
type PartnerStatus = 'active' | 'inactive' | 'suspended';

interface PartnerUI {
  id: number;
  userId: number;
  companyName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  markupType: MarkupType;
  markupValue: string;
  creditLimit: string;
  status: PartnerStatus;
  remarks: string | null;
  createdAt: Date | string;
}

const markupTypeLabels: Record<MarkupType, string> = {
  fixed_amount: '固定金额',
  percentage: '百分比',
  custom: '自定义',
};

const statusConfig: Record<PartnerStatus, { label: string; cls: string; dot: string }> = {
  active: { label: '正常', cls: 'bg-[#10B981]/15 text-[#10B981]', dot: 'bg-[#10B981]' },
  inactive: { label: '停用', cls: 'bg-[var(--slate-700)] text-[var(--slate-400)]', dot: 'bg-[var(--slate-500)]' },
  suspended: { label: '暂停', cls: 'bg-[#F43F5E]/15 text-[#F43F5E]', dot: 'bg-[#F43F5E]' },
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
export default function ChannelPartners() {
  const utils = trpc.useUtils();
  const { data: partnerData, isLoading } = trpc.channelPartner.list.useQuery();

  const createPartner = trpc.channelPartner.create.useMutation({
    onSuccess: () => { utils.channelPartner.list.invalidate(); },
  });
  const updatePartner = trpc.channelPartner.update.useMutation({
    onSuccess: () => { utils.channelPartner.list.invalidate(); },
  });
  const deletePartner = trpc.channelPartner.delete.useMutation({
    onSuccess: () => { utils.channelPartner.list.invalidate(); },
  });

  /* ── State ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerUI | null>(null);

  /* ── Add form ── */
  const [addUserId, setAddUserId] = useState('');
  const [addCompany, setAddCompany] = useState('');
  const [addContact, setAddContact] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addMarkupType, setAddMarkupType] = useState<MarkupType>('percentage');
  const [addMarkupValue, setAddMarkupValue] = useState('20.0000');
  const [addCreditLimit, setAddCreditLimit] = useState('0');
  const [addRemarks, setAddRemarks] = useState('');
  const [addError, setAddError] = useState('');

  /* ── Edit form ── */
  const [editCompany, setEditCompany] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMarkupType, setEditMarkupType] = useState<MarkupType>('percentage');
  const [editMarkupValue, setEditMarkupValue] = useState('20.0000');
  const [editCreditLimit, setEditCreditLimit] = useState('0');
  const [editStatus, setEditStatus] = useState<PartnerStatus>('active');
  const [editRemarks, setEditRemarks] = useState('');
  const [editError, setEditError] = useState('');

  /* ── Map data ── */
  const partners: PartnerUI[] = useMemo(() => {
    if (!partnerData) return [];
    return partnerData.map((p) => ({
      id: p.id,
      userId: Number(p.userId),
      companyName: p.companyName,
      contactName: p.contactName,
      contactPhone: p.contactPhone,
      markupType: p.markupType as MarkupType,
      markupValue: p.markupValue || '0',
      creditLimit: p.creditLimit || '0',
      status: p.status as PartnerStatus,
      remarks: p.remarks,
      createdAt: p.createdAt,
    }));
  }, [partnerData]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    return partners.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (p.companyName?.toLowerCase().includes(q) ?? false)
          || (p.contactName?.toLowerCase().includes(q) ?? false)
          || p.userId.toString().includes(q);
      }
      return true;
    });
  }, [partners, statusFilter, search]);

  /* ── Handlers ── */
  const resetAddForm = () => {
    setAddUserId('');
    setAddCompany('');
    setAddContact('');
    setAddPhone('');
    setAddMarkupType('percentage');
    setAddMarkupValue('20.0000');
    setAddCreditLimit('0');
    setAddRemarks('');
    setAddError('');
  };

  const handleAdd = () => {
    if (!addUserId || isNaN(Number(addUserId))) {
      setAddError('请输入有效的用户ID');
      return;
    }
    createPartner.mutate({
      userId: Number(addUserId),
      companyName: addCompany || undefined,
      contactName: addContact || undefined,
      contactPhone: addPhone || undefined,
      markupType: addMarkupType,
      markupValue: addMarkupValue,
      creditLimit: addCreditLimit,
      remarks: addRemarks || undefined,
    }, {
      onSuccess: () => { setIsAddOpen(false); resetAddForm(); },
      onError: (err) => setAddError(err.message),
    });
  };

  const openEdit = (p: PartnerUI) => {
    setEditingPartner(p);
    setEditCompany(p.companyName || '');
    setEditContact(p.contactName || '');
    setEditPhone(p.contactPhone || '');
    setEditMarkupType(p.markupType);
    setEditMarkupValue(p.markupValue);
    setEditCreditLimit(p.creditLimit);
    setEditStatus(p.status);
    setEditRemarks(p.remarks || '');
    setEditError('');
  };

  const handleEdit = () => {
    if (!editingPartner) return;
    updatePartner.mutate({
      id: editingPartner.id,
      companyName: editCompany || undefined,
      contactName: editContact || undefined,
      contactPhone: editPhone || undefined,
      markupType: editMarkupType,
      markupValue: editMarkupValue,
      creditLimit: editCreditLimit,
      status: editStatus,
      remarks: editRemarks || undefined,
    }, {
      onSuccess: () => setEditingPartner(null),
      onError: (err) => setEditError(err.message),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个渠道伙伴吗？')) {
      deletePartner.mutate({ id });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">渠道伙伴</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">管理渠道合作伙伴的分销定价和加价策略</p>
        </div>
        <button onClick={() => { resetAddForm(); setIsAddOpen(true); }}
          className="h-10 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加渠道伙伴
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: '渠道伙伴总数', value: partners.length, color: '#3366FF' },
          { label: '正常运营', value: partners.filter(p => p.status === 'active').length, color: '#10B981' },
          { label: '百分比加价', value: partners.filter(p => p.markupType === 'percentage').length, color: '#F59E0B' },
          { label: '固定金额加价', value: partners.filter(p => p.markupType === 'fixed_amount').length, color: '#7A9FFF' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4">
            <p className="text-[11px] text-[var(--slate-400)]">{s.label}</p>
            <p className="text-[24px] font-semibold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(['all', 'active', 'inactive', 'suspended'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all ${
              statusFilter === s ? 'bg-[#3366FF] text-white' : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
            }`}>
            {s === 'all' ? '全部' : statusConfig[s].label}
          </button>
        ))}
        <div className="w-px h-5 bg-[var(--dark-border)]" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--slate-500)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公司、联系人..."
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-8 pr-3 py-1.5 w-48 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)] text-[12px]" />
        </div>
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
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">渠道信息</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">加价策略</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">加价幅度</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">信用额度</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">创建时间</th>
                  <th className="py-2.5 px-4 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-[13px] text-[var(--slate-500)]">暂无渠道伙伴</td></tr>
                )}
                {filtered.map((p) => {
                  const scfg = statusConfig[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-[var(--dark-hover)] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#3366FF]/15 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-[#3366FF]" />
                          </div>
                          <div>
                            <p className="text-[13px] text-white font-medium">{p.companyName || `渠道伙伴 #${p.userId}`}</p>
                            <p className="text-[11px] text-[var(--slate-500)]">{p.contactName || '-'} {p.contactPhone && `| ${p.contactPhone}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-300)] flex items-center gap-1 w-fit">
                          {p.markupType === 'percentage' ? <Percent className="w-3 h-3" /> : p.markupType === 'fixed_amount' ? <DollarSign className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                          {markupTypeLabels[p.markupType]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[13px] text-[#F59E0B] font-jetbrains font-medium">
                          {p.markupType === 'percentage' ? `${parseFloat(p.markupValue).toFixed(1)}%` : parseFloat(p.markupValue).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[12px] text-[var(--slate-400)] font-jetbrains">
                          {parseFloat(p.creditLimit).toFixed(0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${scfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`} />
                          {scfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[var(--slate-500)]">
                        {new Date(p.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors" title="编辑">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title="删除">
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── Add Modal ── */}
      <AnimatePresence>
        {isAddOpen && (
          <Modal title="添加渠道伙伴" onClose={() => setIsAddOpen(false)}>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">用户ID <span className="text-[#F43F5E]">*</span></label>
                <input type="number" value={addUserId} onChange={(e) => setAddUserId(e.target.value)}
                  placeholder="关联的平台用户ID"
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">公司名称</label>
                  <input type="text" value={addCompany} onChange={(e) => setAddCompany(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">联系人</label>
                  <input type="text" value={addContact} onChange={(e) => setAddContact(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">联系电话</label>
                <input type="text" value={addPhone} onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
              </div>
              <div className="p-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5">
                <h4 className="text-[12px] font-semibold text-[#F59E0B] mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  加价策略
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">加价模式</label>
                    <select value={addMarkupType} onChange={(e) => setAddMarkupType(e.target.value as MarkupType)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F59E0B] transition-colors">
                      <option value="percentage">百分比加价 (%)</option>
                      <option value="fixed_amount">固定金额加价</option>
                      <option value="custom">自定义定价</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">
                      {addMarkupType === 'percentage' ? '加价百分比' : addMarkupType === 'fixed_amount' ? '固定加价金额' : '加价数值'}
                    </label>
                    <input type="text" value={addMarkupValue} onChange={(e) => setAddMarkupValue(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F59E0B] transition-colors font-jetbrains" />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--slate-500)] mt-2">
                  {addMarkupType === 'percentage'
                    ? '在渠道进货价基础上按百分比加价。如 20% 表示渠道售价 = 进货价 × 1.2'
                    : addMarkupType === 'fixed_amount'
                    ? '在渠道进货价基础上加固定金额。如 5 表示渠道售价 = 进货价 + 5'
                    : '渠道伙伴可自由为每个模型设置自定义价格'}
                </p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">信用额度 (允许欠费上限)</label>
                <input type="text" value={addCreditLimit} onChange={(e) => setAddCreditLimit(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors font-jetbrains" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">备注</label>
                <textarea value={addRemarks} onChange={(e) => setAddRemarks(e.target.value)}
                  className="w-full h-16 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#3366FF] transition-colors resize-none" />
              </div>
              {addError && <p className="text-[12px] text-[#F43F5E] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {addError}</p>}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleAdd}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
                  disabled={createPartner.isPending}>
                  {createPartner.isPending ? '添加中...' : '添加'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editingPartner && (
          <Modal title={`编辑渠道伙伴: ${editingPartner.companyName || `#${editingPartner.userId}`}`} onClose={() => setEditingPartner(null)}>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">公司名称</label>
                  <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">联系人</label>
                  <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">联系电话</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors" />
              </div>
              <div className="p-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5">
                <h4 className="text-[12px] font-semibold text-[#F59E0B] mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  加价策略
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">加价模式</label>
                    <select value={editMarkupType} onChange={(e) => setEditMarkupType(e.target.value as MarkupType)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F59E0B] transition-colors">
                      <option value="percentage">百分比加价 (%)</option>
                      <option value="fixed_amount">固定金额加价</option>
                      <option value="custom">自定义定价</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--slate-400)] mb-1">
                      {editMarkupType === 'percentage' ? '加价百分比' : editMarkupType === 'fixed_amount' ? '固定加价金额' : '加价数值'}
                    </label>
                    <input type="text" value={editMarkupValue} onChange={(e) => setEditMarkupValue(e.target.value)}
                      className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#F59E0B] transition-colors font-jetbrains" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">信用额度</label>
                  <input type="text" value={editCreditLimit} onChange={(e) => setEditCreditLimit(e.target.value)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors font-jetbrains" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">状态</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as PartnerStatus)}
                    className="w-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3366FF] transition-colors">
                    <option value="active">正常</option>
                    <option value="inactive">停用</option>
                    <option value="suspended">暂停</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-1.5">备注</label>
                <textarea value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full h-16 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#3366FF] transition-colors resize-none" />
              </div>
              {editError && <p className="text-[12px] text-[#F43F5E] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {editError}</p>}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
                <button onClick={handleEdit}
                  className="px-5 py-2 bg-[#3366FF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2244CC] transition-colors"
                  disabled={updatePartner.isPending}>
                  {updatePartner.isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
