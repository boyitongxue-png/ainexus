import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Check, X, Search, FileText } from 'lucide-react';
import { rechargeRecords } from '@/lib/adminMockData';
import { statusBadgeConfig } from '@/lib/adminMockData';

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
];

export default function RechargeReview() {
  const [records, setRecords] = useState(rechargeRecords);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState<{ type: 'approve' | 'reject'; record: typeof rechargeRecords[0] } | null>(null);
  const [grantCredits, setGrantCredits] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectQuick, setRejectQuick] = useState('');

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = !search || r.customerName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const todayApproved = records.filter((r) => r.status === 'approved' && r.reviewedAt && new Date(r.reviewedAt).toDateString() === new Date().toDateString()).length;
  const todayRejected = records.filter((r) => r.status === 'rejected' && r.reviewedAt && new Date(r.reviewedAt).toDateString() === new Date().toDateString()).length;
  const monthTotal = records.filter((r) => r.status === 'approved').reduce((sum, r) => sum + r.paymentAmount, 0);

  const stats = [
    { label: '待审核', value: pendingCount, color: '#FBBF24' },
    { label: '今日通过', value: todayApproved || 12, color: '#34D399' },
    { label: '今日拒绝', value: todayRejected || 2, color: '#F43F5E' },
    { label: '本月审核总额', value: `¥${(monthTotal || 156000).toLocaleString()}`, color: '#3366FF' },
  ];

  const openApprove = (record: typeof rechargeRecords[0]) => {
    setGrantCredits(String(record.requestedCredits));
    setReviewNote('');
    setReviewModal({ type: 'approve', record });
  };

  const openReject = (record: typeof rechargeRecords[0]) => {
    setRejectReason('');
    setRejectQuick('');
    setReviewModal({ type: 'reject', record });
  };

  const handleApprove = () => {
    if (!reviewModal) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === reviewModal.record.id
          ? { ...r, status: 'approved' as const, reviewNote, reviewedBy: 'admin1', reviewedAt: new Date().toISOString() }
          : r
      )
    );
    setReviewModal(null);
  };

  const handleReject = () => {
    if (!reviewModal) return;
    const reason = rejectQuick || rejectReason;
    if (!reason) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === reviewModal.record.id
          ? { ...r, status: 'rejected' as const, rejectReason: reason, reviewedBy: 'admin1', reviewedAt: new Date().toISOString() }
          : r
      )
    );
    setReviewModal(null);
  };

  const statusBadge = (status: string) => {
    const config = statusBadgeConfig[status] || statusBadgeConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space text-3xl font-semibold text-white tracking-tight">充值审核</h1>
        <p className="mt-1 text-sm text-[var(--slate-400)]">审核客户线下转账后的充值申请</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--slate-400)] uppercase tracking-wider">{s.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <ClipboardCheck className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="mt-3 font-jetbrains text-2xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                statusFilter === f.value ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
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
            placeholder="搜索客户、单号..."
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
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">充值单号</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">客户名称</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">工作区</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">充值积分</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">转账金额</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">转账信息</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">申请时间</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5 font-jetbrains text-sm text-[#7A9FFF]">{r.id}</td>
                  <td className="py-4 px-5 text-sm text-white font-medium">{r.customerName}</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{r.workspaceName}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{r.requestedCredits.toLocaleString()}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-[#34D399]">¥{r.paymentAmount.toLocaleString()}</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{r.bankName} {r.accountLast4}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{new Date(r.paymentTime).toLocaleString()}</td>
                  <td className="py-4 px-5">{statusBadge(r.status)}</td>
                  <td className="py-4 px-5">
                    {r.status === 'pending' ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openApprove(r)} className="px-3 py-1.5 bg-[#10B981] text-white text-xs rounded-md hover:bg-[#059669] transition-colors flex items-center gap-1">
                          <Check className="w-3 h-3" /> 通过
                        </button>
                        <button onClick={() => openReject(r)} className="px-3 py-1.5 bg-[#EF4444] text-white text-xs rounded-md hover:bg-[#DC2626] transition-colors flex items-center gap-1">
                          <X className="w-3 h-3" /> 拒绝
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => alert('充值详情\n\n申请ID: ' + r.id + '\n客户: ' + r.customerName + '\n金额: ¥' + r.paymentAmount + '\n状态: ' + (r.status === 'approved' ? '已通过' : r.status === 'rejected' ? '已拒绝' : '待审核') + '\n审核备注: ' + (r.reviewNote || '无'))} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的充值记录</div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setReviewModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl shadow-2xl z-[110] p-6"
            >
              {reviewModal.type === 'approve' ? (
                <>
                  <h3 className="text-lg font-semibold text-white mb-4">确认通过充值申请</h3>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--slate-400)]">客户</span>
                      <span className="text-white">{reviewModal.record.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--slate-400)]">工作区</span>
                      <span className="text-white">{reviewModal.record.workspaceName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--slate-400)]">转账金额</span>
                      <span className="font-jetbrains text-[#34D399]">¥{reviewModal.record.paymentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--slate-400)]">申请积分</span>
                      <span className="font-jetbrains text-white">{reviewModal.record.requestedCredits.toLocaleString()}</span>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--slate-400)] mb-1.5">授予积分数量</label>
                      <input
                        type="number"
                        value={grantCredits}
                        onChange={(e) => setGrantCredits(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--slate-400)] mb-1.5">审核备注</label>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="可选：输入审核备注..."
                        className="w-full h-20 px-3 py-2 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setReviewModal(null)} className="flex-1 h-10 rounded-lg text-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]">
                      取消
                    </button>
                    <button onClick={handleApprove} className="flex-1 h-10 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors">
                      确认通过
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white mb-4">拒绝充值申请</h3>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--slate-400)]">客户</span>
                      <span className="text-white">{reviewModal.record.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--slate-400)]">转账金额</span>
                      <span className="font-jetbrains text-white">¥{reviewModal.record.paymentAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--slate-400)] mb-1.5">快捷原因</label>
                      <div className="flex flex-wrap gap-2">
                        {['转账金额不符', '凭证不清晰', '未查到转账记录', '其他'].map((reason) => (
                          <button
                            key={reason}
                            onClick={() => setRejectQuick(reason)}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                              rejectQuick === reason
                                ? 'border-[#3366FF] bg-[#3366FF]/10 text-[#3366FF]'
                                : 'border-[var(--dark-border)] text-[var(--slate-400)] hover:border-[var(--slate-500)]'
                            }`}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--slate-400)] mb-1.5">拒绝原因 <span className="text-[#F43F5E]">*</span></label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="请输入拒绝原因..."
                        className="w-full h-20 px-3 py-2 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setReviewModal(null)} className="flex-1 h-10 rounded-lg text-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]">
                      取消
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectQuick && !rejectReason}
                      className="flex-1 h-10 rounded-lg bg-[#EF4444] text-white text-sm font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      确认拒绝
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
