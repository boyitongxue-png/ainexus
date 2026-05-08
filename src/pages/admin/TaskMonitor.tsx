import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  XOctagon,
  BarChart3,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { taskMonitorEntries, taskDistributionData } from '@/lib/adminMockData';
import { statusBadgeConfig } from '@/lib/adminMockData';

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '排队中' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'cancelled', label: '已取消' },
];

const typeFilters = [
  { value: 'all', label: '全部' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
];

export default function TaskMonitor() {
  const [tasks, setTasks] = useState(taskMonitorEntries);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  const customers = ['all', ...Array.from(new Set(taskMonitorEntries.map((t) => t.customerId)))];

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchType = typeFilter === 'all' || t.taskType === typeFilter;
      const matchCustomer = customerFilter === 'all' || t.customerId === customerFilter;
      return matchStatus && matchType && matchCustomer;
    });
  }, [tasks, statusFilter, typeFilter, customerFilter]);

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const processingCount = tasks.filter((t) => t.status === 'processing').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;

  const stats = [
    { label: '排队中', value: pendingCount, icon: Clock, color: '#FBBF24' },
    { label: '处理中', value: processingCount, icon: Loader2, color: '#3366FF' },
    { label: '今日完成', value: completedCount, icon: CheckCircle2, color: '#34D399' },
    { label: '今日失败', value: failedCount, icon: XCircle, color: '#F43F5E' },
    { label: '平均等待', value: '12s', icon: BarChart3, color: '#22D3EE' },
  ];

  const statusBadge = (status: string) => {
    const config = statusBadgeConfig[status] || statusBadgeConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleRetry = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'pending' as const, failureReason: undefined, progress: 0 } : t))
    );
  };

  const handleCancel = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' as const } : t))
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space text-3xl font-semibold text-white tracking-tight">任务监控</h1>
        <p className="mt-1 text-sm text-[var(--slate-400)]">异步图片/视频生成任务管理</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* Task Distribution Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <h2 className="font-space text-lg font-semibold text-white mb-4">任务类型分布</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={taskDistributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" strokeWidth={0}>
                {taskDistributionData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4">
            {taskDistributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-[var(--slate-400)]">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-1 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-1">
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
            <div className="flex items-center gap-1 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-1">
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
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="h-8 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-xs text-white focus:outline-none focus:border-[#3366FF]"
            >
              <option value="all">全部客户</option>
              {customers.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>{tasks.find((t) => t.customerId === c)?.customerName || c}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">任务ID</th>
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">客户</th>
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">类型</th>
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">冻结积分</th>
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">实际积分</th>
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">进度</th>
                  <th className="py-3 px-4 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                    <td className="py-4 px-4 font-jetbrains text-xs text-[#7A9FFF]">{t.id}</td>
                    <td className="py-4 px-4 text-sm text-white">{t.customerName}</td>
                    <td className="py-4 px-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-[var(--dark-bg)] border border-[var(--dark-border)] text-[var(--slate-300)] capitalize">
                        {t.taskType === 'image' ? '图片' : '视频'}
                      </span>
                    </td>
                    <td className="py-4 px-4">{statusBadge(t.status)}</td>
                    <td className="py-4 px-4 font-jetbrains text-sm text-white">{t.frozenCredits}</td>
                    <td className="py-4 px-4 font-jetbrains text-sm text-[var(--slate-400)]">{t.actualCredits || '-'}</td>
                    <td className="py-4 px-4">
                      {t.status === 'processing' ? (
                        <div className="w-full max-w-[80px]">
                          <div className="h-1.5 bg-[var(--dark-border)] rounded-full overflow-hidden">
                            <div className="h-full bg-[#3366FF] rounded-full transition-all" style={{ width: `${t.progress}%` }} />
                          </div>
                          <span className="text-xs text-[var(--slate-400)] mt-0.5">{t.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--slate-400)]">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        {t.status === 'failed' && (
                          <button onClick={() => handleRetry(t.id)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#10B981] hover:bg-[var(--dark-hover)] transition-colors" title="重试">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {(t.status === 'pending' || t.status === 'processing') && (
                          <button onClick={() => handleCancel(t.id)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title="取消">
                            <XOctagon className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => alert('任务详情\n\n任务ID: ' + t.id + '\n类型: ' + (t.taskType || '图片生成') + '\n模型: ' + (t.model || 'DALL-E 3') + '\n状态: ' + t.status + '\n创建时间: ' + t.createdTime)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors" title="查看详情">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-[var(--slate-500)]">未找到匹配的任务</div>
          )}
        </div>
      </div>

      {/* Failed Tasks Section */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h2 className="font-space text-lg font-semibold text-white mb-4">失败任务</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">任务ID</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">模型</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">客户</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">失败时间</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">错误信息</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {tasks.filter((t) => t.status === 'failed').map((t) => (
                <tr key={t.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5 font-jetbrains text-xs text-[#7A9FFF]">{t.id}</td>
                  <td className="py-4 px-5 text-sm text-white">{t.model}</td>
                  <td className="py-4 px-5 text-sm text-white">{t.customerName}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{t.completedTime ? new Date(t.completedTime).toLocaleString() : '-'}</td>
                  <td className="py-4 px-5 text-xs text-[#F43F5E] max-w-[300px] truncate">{t.failureReason}</td>
                  <td className="py-4 px-5">
                    <button onClick={() => handleRetry(t.id)} className="px-3 py-1.5 bg-[#3366FF] text-white text-xs rounded-md hover:bg-[#2244CC] transition-colors flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> 重试
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
