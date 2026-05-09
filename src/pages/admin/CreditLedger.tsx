import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Plus, AlertTriangle, Coins, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { creditLedgerEntries } from '@/lib/adminMockData';
import { creditTypeColors, creditTypeLabels } from '@/lib/adminMockData';
import { trpc } from '@/providers/trpc';

const typeFilters = [
  { value: 'all', label: '全部' },
  { value: 'consume', label: '消耗' },
  { value: 'recharge', label: '充值' },
  { value: 'gift', label: '赠送' },
  { value: 'refund', label: '退款' },
  { value: 'adjust', label: '调账' },
];

export default function CreditLedger() {

  const { data: txData } = trpc.credit.transactionList.useQuery();
  const transactions = useMemo(() => {
    if (!txData) return [];
    return txData.items.map((t: any) => ({
      id: t.id, timestamp: t.createdAt ? new Date(t.createdAt).toISOString() : '', userId: t.userId || 0,
      userName: `用户 ${t.userId || 0}`, type: t.amount >= 0 ? 'credit' : 'debit',
      amount: Math.abs(Number(t.amount) || 0), balance: 0, description: t.description || '', modelName: '',
    }));
  }, [txData]);

  const [entries, setEntries] = useState(creditLedgerEntries);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const adjustFormRef = useRef<HTMLDivElement>(null);
  const [adjustForm, setAdjustForm] = useState({
    customerId: '',
    workspaceId: '',
    type: 'add' as 'add' | 'deduct',
    amount: '',
    reason: '',
    password: '',
  });

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch = !search || e.customerName.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [entries, search, typeFilter]);

  const stats = [
    { label: '平台总积分流通', value: '15.2M', icon: Coins, color: '#3366FF' },
    { label: '今日消耗', value: '45,230', icon: ArrowUpRight, color: '#F43F5E' },
    { label: '今日充值', value: '50,000', icon: ArrowDownLeft, color: '#34D399' },
    { label: '积分调整(本月)', value: '+12,000 / -3,000', icon: Coins, color: '#A855F7' },
  ];

  const typeBadge = (type: string) => {
    const color = creditTypeColors[type] || '#94A3B8';
    const label = creditTypeLabels[type] || type;
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${color}15`, color }}>
        {label}
      </span>
    );
  };

  const handleExport = () => {
    const csv = [
      ['流水号', '时间', '类型', '客户', '工作区', '变动', '余额', '操作人', '备注'].join(','),
      ...filtered.map((e) =>
        [e.id, e.time, creditTypeLabels[e.type] || e.type, e.customerName, e.workspaceName, e.amount, e.balanceAfter, e.operator, e.notes].join(',')
      ),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdjust = () => {
    if (!adjustForm.customerId || !adjustForm.amount || !adjustForm.reason || !adjustForm.password) return;
    const amount = adjustForm.type === 'add' ? parseInt(adjustForm.amount) : -parseInt(adjustForm.amount);
    // Find customer info from entries
    const customerMap = new Map(creditLedgerEntries.map(e => [e.customerId, e]));
    const customerEntry = customerMap.get(adjustForm.customerId);
    const newEntry = {
      id: `TX-${Date.now()}`,
      customerId: adjustForm.customerId,
      customerName: customerEntry?.customerName || adjustForm.customerId,
      workspaceId: adjustForm.workspaceId || 'N/A',
      workspaceName: adjustForm.workspaceId || 'N/A',
      type: 'adjust' as const,
      amount,
      balanceBefore: 0,
      balanceAfter: amount,
      relatedId: '',
      operator: 'admin1',
      time: new Date().toISOString(),
      notes: adjustForm.reason,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setShowAdjustModal(false);
    setAdjustForm({ customerId: '', workspaceId: '', type: 'add', amount: '', reason: '', password: '' });
    setCustomerSearch('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">积分台账</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">平台所有积分变动的完整记录</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAdjustModal(true)} className="h-10 px-4 bg-[#F43F5E] text-white text-sm rounded-lg hover:bg-[#DC2626] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> 手动调整
          </button>
          <button onClick={handleExport} className="h-10 px-4 border border-[var(--dark-border)] text-[var(--slate-300)] text-sm rounded-lg hover:bg-[var(--dark-hover)] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> 导出 CSV
          </button>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                typeFilter === f.value ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索客户、流水号..."
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
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">流水号</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">时间</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">类型</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">客户</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">工作区</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">变动</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">变动前</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">变动后</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作人</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5 font-jetbrains text-xs text-[#7A9FFF]">{e.id}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{new Date(e.time).toLocaleString()}</td>
                  <td className="py-4 px-5">{typeBadge(e.type)}</td>
                  <td className="py-4 px-5 text-sm text-white">{e.customerName}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-300)]">{e.workspaceName}</td>
                  <td className={`py-4 px-5 font-jetbrains text-sm ${e.amount > 0 ? 'text-[#34D399]' : 'text-[#EF4444]'}`}>
                    {e.amount > 0 ? '+' : ''}{e.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-[var(--slate-400)]">{e.balanceBefore.toLocaleString()}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{e.balanceAfter.toLocaleString()}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-300)]">{e.operator}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-300)] max-w-[200px] truncate">{e.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的流水记录</div>
        )}
      </div>

      {/* Adjust Modal */}
      <AnimatePresence>
        {showAdjustModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setShowAdjustModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl shadow-2xl z-[110] p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-1">积分调整</h3>
              <p className="text-xs text-[#F43F5E] flex items-center gap-1 mb-4">
                <AlertTriangle className="w-3 h-3" /> 此操作将直接修改客户积分，请谨慎操作
              </p>
              <div className="space-y-3 mb-5">
                <div className="relative" ref={adjustFormRef}>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">客户 <span className="text-[#F43F5E]">*</span></label>
                  <input
                    type="text"
                    value={adjustForm.customerId}
                    onChange={(e) => {
                      setAdjustForm({ ...adjustForm, customerId: e.target.value });
                      setCustomerSearch(e.target.value);
                      setShowCustomerSuggestions(true);
                    }}
                    onFocus={() => setShowCustomerSuggestions(true)}
                    placeholder="输入客户名称搜索..."
                    className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                  />
                  {showCustomerSuggestions && customerSearch && (
                    <div className="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg shadow-xl">
                      {Array.from(new Map(creditLedgerEntries.map(e => [e.customerId, e])).values())
                        .filter(c => c.customerName.toLowerCase().includes(customerSearch.toLowerCase()) || c.customerId.toLowerCase().includes(customerSearch.toLowerCase()))
                        .map((c) => (
                          <button
                            key={c.customerId}
                            type="button"
                            onClick={() => {
                              setAdjustForm({ ...adjustForm, customerId: c.customerId });
                              setCustomerSearch(c.customerName);
                              setShowCustomerSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--dark-hover)] transition-colors border-b border-[var(--dark-border)] last:border-0"
                          >
                            <span className="font-medium">{c.customerName}</span>
                            <span className="text-xs text-[var(--slate-500)] ml-2">{c.customerId}</span>
                          </button>
                        ))}
                      {Array.from(new Map(creditLedgerEntries.map(e => [e.customerId, e])).values())
                        .filter(c => c.customerName.toLowerCase().includes(customerSearch.toLowerCase()) || c.customerId.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-sm text-[var(--slate-500)]">未找到匹配客户</div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">调整类型</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAdjustForm({ ...adjustForm, type: 'add' })}
                      className={`flex-1 h-10 rounded-lg text-sm transition-colors ${
                        adjustForm.type === 'add' ? 'bg-[#10B981] text-white' : 'bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-400)] hover:text-white'
                      }`}
                    >
                      增加
                    </button>
                    <button
                      onClick={() => setAdjustForm({ ...adjustForm, type: 'deduct' })}
                      className={`flex-1 h-10 rounded-lg text-sm transition-colors ${
                        adjustForm.type === 'deduct' ? 'bg-[#EF4444] text-white' : 'bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-400)] hover:text-white'
                      }`}
                    >
                      减少
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">积分数量 <span className="text-[#F43F5E]">*</span></label>
                  <input
                    type="number"
                    value={adjustForm.amount}
                    onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                    placeholder="输入积分数量"
                    className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">调整原因 <span className="text-[#F43F5E]">*</span></label>
                  <textarea
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    placeholder="请输入调整原因..."
                    className="w-full h-20 px-3 py-2 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--slate-400)] mb-1.5">确认密码 <span className="text-[#F43F5E]">*</span></label>
                  <input
                    type="password"
                    value={adjustForm.password}
                    onChange={(e) => setAdjustForm({ ...adjustForm, password: e.target.value })}
                    placeholder="输入管理员密码"
                    className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdjustModal(false)} className="flex-1 h-10 rounded-lg text-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]">
                  取消
                </button>
                <button
                  onClick={handleAdjust}
                  disabled={!adjustForm.customerId || !adjustForm.amount || !adjustForm.reason || !adjustForm.password}
                  className="flex-1 h-10 rounded-lg bg-[#EF4444] text-white text-sm font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认调整
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
