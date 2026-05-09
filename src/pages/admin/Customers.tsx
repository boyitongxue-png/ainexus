import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, Snowflake, Lock, Users, UserPlus, Building2, X, LockOpen,
  Key, Activity, CreditCard, Store, Percent, DollarSign, Tag,
  AlertTriangle, RefreshCw,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type PartnerStatus = 'active' | 'inactive' | 'suspended';
type MarkupType = 'fixed_amount' | 'percentage' | 'custom';
type DrawerTab = 'overview' | 'workspaces' | 'developers' | 'pricing';

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

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '活跃' },
  { value: 'inactive', label: '停用' },
  { value: 'suspended', label: '暂停' },
];

const statusBadgeConfig: Record<PartnerStatus, { bg: string; text: string; label: string; dot: string }> = {
  active: { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', label: '活跃', dot: 'bg-[#10B981]' },
  inactive: { bg: 'bg-[var(--slate-700)]', text: 'text-[var(--slate-400)]', label: '停用', dot: 'bg-[var(--slate-500)]' },
  suspended: { bg: 'bg-[#F43F5E]/15', text: 'text-[#F43F5E]', label: '暂停', dot: 'bg-[#F43F5E]' },
};

const markupTypeConfig: Record<MarkupType, { label: string; icon: typeof Percent; desc: string }> = {
  percentage: { label: '百分比加价', icon: Percent, desc: '在进货价基础上按%加价' },
  fixed_amount: { label: '固定金额', icon: DollarSign, desc: '在进货价基础上加固定金额' },
  custom: { label: '自定义定价', icon: Tag, desc: '为每个模型独立定价' },
};

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function AdminCustomers() {
  const utils = trpc.useUtils();

  /* ── State ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState<PartnerUI | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('overview');

  /* ── tRPC ── */
  const { data: partnerData, isLoading, isError, error, refetch } = trpc.channelPartner.list.useQuery();
  const updatePartner = trpc.channelPartner.update.useMutation({
    onSuccess: () => { utils.channelPartner.list.invalidate(); },
  });

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
      const matchSearch = !search
        || (p.companyName?.toLowerCase().includes(search.toLowerCase()) ?? false)
        || (p.contactName?.toLowerCase().includes(search.toLowerCase()) ?? false)
        || p.userId.toString().includes(search);
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [partners, search, statusFilter]);

  /* ── Stats ── */
  const stats = [
    { label: '总客户', value: partners.length, icon: Users, color: '#3366FF' },
    { label: '本月新增', value: partners.filter((p) => {
      const d = new Date(p.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length, icon: UserPlus, color: '#34D399' },
    { label: '活跃客户', value: partners.filter((p) => p.status === 'active').length, icon: Store, color: '#22D3EE' },
    { label: '已停用', value: partners.filter((p) => p.status === 'inactive' || p.status === 'suspended').length, icon: Snowflake, color: '#94A3B8' },
  ];

  /* ── Helpers ── */
  const openDrawer = (partner: PartnerUI) => {
    setSelectedPartner(partner);
    setDrawerOpen(true);
    setDrawerTab('overview');
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedPartner(null), 200);
  };

  const toggleStatus = (partner: PartnerUI) => {
    const newStatus = partner.status === 'active' ? 'suspended' : 'active';
    updatePartner.mutate({ id: partner.id, status: newStatus });
    if (selectedPartner?.id === partner.id) {
      setSelectedPartner({ ...selectedPartner, status: newStatus });
    }
  };

  const statusBadge = (status: PartnerStatus) => {
    const cfg = statusBadgeConfig[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const markupBadge = (type: MarkupType) => {
    const cfg = markupTypeConfig[type];
    const Icon = cfg.icon;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-300)]">
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">客户管理</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">管理所有客户、加价策略和额度信息</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text" placeholder="搜索客户名称、联系人..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-72"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--slate-400)] uppercase tracking-wider">{s.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="mt-3 font-jetbrains text-2xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1">
          {statusFilters.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                statusFilter === f.value ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#3366FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--slate-400)]">加载中...</p>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="bg-[var(--dark-card)] border border-[#F43F5E]/30 rounded-xl p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-[#F43F5E] mx-auto mb-3" />
          <p className="text-sm text-[#F43F5E] font-medium mb-1">数据加载失败</p>
          <p className="text-xs text-[var(--slate-500)] mb-4">{error?.message || '请检查网络连接或稍后重试'}</p>
          <button onClick={() => refetch()} className="h-9 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" />重新加载
          </button>
        </div>
      )}

      {/* Empty: no partners in DB yet */}
      {!isLoading && !isError && partners.length === 0 && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-[var(--slate-600)] mx-auto mb-3" />
          <p className="text-sm text-[var(--slate-400)] font-medium mb-1">暂无客户数据</p>
          <p className="text-xs text-[var(--slate-500)] mb-4">渠道伙伴列表为空，请在数据库中添加初始数据</p>
          <button onClick={() => refetch()} className="h-9 px-4 bg-[var(--dark-hover)] text-[var(--slate-300)] text-sm rounded-lg hover:bg-[var(--dark-border)] transition-colors flex items-center gap-2 mx-auto border border-[var(--dark-border)]">
            <RefreshCw className="w-4 h-4" />刷新
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && partners.length > 0 && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">客户名称 / ID</th>
                  <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">联系人 / 联系方式</th>
                  <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">加价策略</th>
                  <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                  <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">信用额度</th>
                  <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">创建时间</th>
                  <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3366FF] to-[#A855F7] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(p.companyName?.[0] || p.contactName?.[0] || '?')}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{p.companyName || `客户 #${p.userId}`}</p>
                          <p className="text-xs text-[var(--slate-500)]">用户ID: {p.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-sm text-white">{p.contactName || '-'}</p>
                      <p className="text-xs text-[var(--slate-500)]">{p.contactPhone || '-'}</p>
                    </td>
                    <td className="py-4 px-5">{markupBadge(p.markupType)}</td>
                    <td className="py-4 px-5">{statusBadge(p.status)}</td>
                    <td className="py-4 px-5 font-jetbrains text-sm text-white">{parseFloat(p.creditLimit).toLocaleString()}</td>
                    <td className="py-4 px-5 text-xs text-[var(--slate-400)]">
                      {new Date(p.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDrawer(p)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors" title="查看详情">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleStatus(p)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title={p.status === 'active' ? '冻结' : '解冻'}>
                          {p.status === 'active' ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && partners.length > 0 && (
            <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的客户</div>
          )}
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedPartner && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100]" onClick={closeDrawer} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[var(--dark-card)] border-l border-[var(--dark-border)] z-[110] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3366FF] to-[#A855F7] flex items-center justify-center text-white text-lg font-bold">
                      {(selectedPartner.companyName?.[0] || selectedPartner.contactName?.[0] || '?')}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selectedPartner.companyName || `客户 #${selectedPartner.userId}`}</h2>
                      {statusBadge(selectedPartner.status)}
                    </div>
                  </div>
                  <button onClick={closeDrawer} className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-1 mb-6">
                  {[
                    { key: 'overview' as DrawerTab, label: '概览', icon: Activity },
                    { key: 'workspaces' as DrawerTab, label: '工作区', icon: Building2 },
                    { key: 'developers' as DrawerTab, label: 'API Keys', icon: Key },
                    { key: 'pricing' as DrawerTab, label: '定价策略', icon: Tag },
                  ].map((tab) => (
                    <button key={tab.key} onClick={() => setDrawerTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md transition-colors ${
                        drawerTab === tab.key ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
                      }`}>
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Overview */}
                {drawerTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">基本信息</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-[var(--slate-500)]">客户ID</span><p className="text-white font-jetbrains">{selectedPartner.id}</p></div>
                        <div><span className="text-[var(--slate-500)]">用户ID</span><p className="text-white font-jetbrains">{selectedPartner.userId}</p></div>
                        <div><span className="text-[var(--slate-500)]">联系人</span><p className="text-white">{selectedPartner.contactName || '-'}</p></div>
                        <div><span className="text-[var(--slate-500)]">联系电话</span><p className="text-white">{selectedPartner.contactPhone || '-'}</p></div>
                        <div><span className="text-[var(--slate-500)]">注册时间</span><p className="text-white">{new Date(selectedPartner.createdAt).toLocaleString('zh-CN')}</p></div>
                        <div><span className="text-[var(--slate-500)]">状态</span><p>{statusBadge(selectedPartner.status)}</p></div>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">定价策略</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                          <p className="text-xs text-[var(--slate-400)]">加价模式</p>
                          <p className="text-sm text-white font-medium mt-1">{markupTypeConfig[selectedPartner.markupType].label}</p>
                        </div>
                        <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                          <p className="text-xs text-[var(--slate-400)]">加价幅度</p>
                          <p className="font-jetbrains text-xl text-[#F59E0B] mt-1">
                            {selectedPartner.markupType === 'percentage'
                              ? `${parseFloat(selectedPartner.markupValue).toFixed(1)}%`
                              : parseFloat(selectedPartner.markupValue).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                          <p className="text-xs text-[var(--slate-400)]">信用额度</p>
                          <p className="font-jetbrains text-xl text-white mt-1">{parseFloat(selectedPartner.creditLimit).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button onClick={() => setDrawerTab('pricing')}
                        className="flex-1 h-10 rounded-lg border border-[#3366FF] text-[#3366FF] text-sm font-medium hover:bg-[#3366FF]/10 transition-colors">
                        编辑定价策略
                      </button>
                      <button onClick={() => toggleStatus(selectedPartner)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium text-white transition-colors ${
                          selectedPartner.status === 'active' ? 'bg-[#F43F5E] hover:bg-[#DC2626]' : 'bg-[#10B981] hover:bg-[#059669]'
                        }`}>
                        {selectedPartner.status === 'active' ? '停用账户' : '启用账户'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Workspaces (placeholder) */}
                {drawerTab === 'workspaces' && (
                  <div className="text-center py-12 text-sm text-[var(--slate-500)]">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-[var(--slate-600)]" />
                    <p>工作区功能开发中</p>
                    <p className="text-xs mt-1">客户创建的工作区将显示在此处</p>
                  </div>
                )}

                {/* Tab: API Keys (placeholder) */}
                {drawerTab === 'developers' && (
                  <div className="text-center py-12 text-sm text-[var(--slate-500)]">
                    <Key className="w-12 h-12 mx-auto mb-3 text-[var(--slate-600)]" />
                    <p>API Key 列表</p>
                    <p className="text-xs mt-1">客户创建的 API Key 将显示在此处</p>
                  </div>
                )}

                {/* Tab: Pricing */}
                {drawerTab === 'pricing' && (
                  <div className="space-y-4">
                    <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">当前加价策略</h3>
                      <div className="flex items-center gap-3 p-3 bg-[var(--dark-card)] rounded-lg">
                        {(() => {
                          const cfg = markupTypeConfig[selectedPartner.markupType];
                          const Icon = cfg.icon;
                          return (
                            <>
                              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-[#F59E0B]" />
                              </div>
                              <div>
                                <p className="text-sm text-white font-medium">{cfg.label}</p>
                                <p className="text-xs text-[var(--slate-500)]">{cfg.desc}</p>
                              </div>
                              <div className="ml-auto text-right">
                                <p className="font-jetbrains text-lg text-[#F59E0B] font-semibold">
                                  {selectedPartner.markupType === 'percentage'
                                    ? `${parseFloat(selectedPartner.markupValue).toFixed(1)}%`
                                    : `+${parseFloat(selectedPartner.markupValue).toFixed(2)}`}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">加价说明</h3>
                      <div className="space-y-2 text-xs text-[var(--slate-400)]">
                        {selectedPartner.markupType === 'percentage' && (
                          <p>百分比加价模式下，客户的售价 = 平台进货价 × (1 + 加价百分比)。当前设置为 {parseFloat(selectedPartner.markupValue).toFixed(1)}%，即售价是进货价的 {(100 + parseFloat(selectedPartner.markupValue)).toFixed(1)}%。</p>
                        )}
                        {selectedPartner.markupType === 'fixed_amount' && (
                          <p>固定金额加价模式下，客户的售价 = 平台进货价 + 固定加价金额。当前加价为 {parseFloat(selectedPartner.markupValue).toFixed(2)}。</p>
                        )}
                        {selectedPartner.markupType === 'custom' && (
                          <p>自定义定价模式下，客户可以为每个模型独立设置售价，不受默认加价规则限制。</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">信用额度</h3>
                      <div className="flex items-center justify-between p-3 bg-[var(--dark-card)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#3366FF]" />
                          <span className="text-sm text-[var(--slate-300)]">允许欠费上限</span>
                        </div>
                        <span className="font-jetbrains text-lg text-white">{parseFloat(selectedPartner.creditLimit).toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedPartner.remarks && (
                      <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-white mb-2">备注</h3>
                        <p className="text-xs text-[var(--slate-400)]">{selectedPartner.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
