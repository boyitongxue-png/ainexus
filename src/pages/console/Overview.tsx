import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Activity, CreditCard,
  AlertTriangle, CheckCircle2,
  BarChart3, ArrowUpRight, ArrowDownRight,
  RefreshCw, ChevronDown, Layers,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('zh-CN');
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ title, value, change, changeType, icon: Icon, accent, subtitle }: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  accent: string;
  subtitle?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] text-[var(--slate-400)] uppercase tracking-wider">{title}</p>
          <p className="mt-1 font-space text-[28px] font-bold text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg`} style={{ backgroundColor: `${accent}20` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1.5">
          {changeType === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />}
          {changeType === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-[#EF4444]" />}
          <span className={`text-[12px] font-medium ${changeType === 'up' ? 'text-[#10B981]' : changeType === 'down' ? 'text-[#EF4444]' : 'text-[var(--slate-400)]'}`}>
            {change}
          </span>
          {subtitle && <span className="text-[12px] text-[var(--slate-500)]">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function ConsoleOverview() {
  const { data: stats } = trpc.stats.dashboard.useQuery();
  const { data: modelList } = trpc.model.list.useQuery();
  trpc.log.list.useQuery({ limit: 5 });

  const [timeRange, setTimeRange] = useState('24h');
  const ranges = [
    { value: '1h', label: '1 小时' },
    { value: '6h', label: '6 小时' },
    { value: '24h', label: '24 小时' },
    { value: '7d', label: '7 天' },
    { value: '30d', label: '30 天' },
  ];

  /* ── Stats from API ── */
  const totalCalls = stats?.totalApiCalls ?? 0;
  const activeModels = stats?.activeModels ?? 0;
  const recentCalls = stats?.recentCalls ?? [];
  const totalUsers = stats?.totalUsers ?? 0;

  /* ── Calculate avg latency ── */
  const avgLatency = useMemo(() => {
    if (recentCalls.length === 0) return 0;
    const total = recentCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
    return Math.round(total / recentCalls.length);
  }, [recentCalls]);

  /* ── Recent call rows ── */
  const callRows = recentCalls.map((c) => ({
    timestamp: formatDate(c.timestamp),
    model: c.modelName || '未知',
    type: c.type,
    status: c.status === 'success' ? '成功' as const : '失败' as const,
    duration: `${c.duration}ms`,
    tokens: c.tokensUsed || 0,
    credits: parseFloat(c.creditsUsed || '0'),
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">控制台概览</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">实时查看 API 调用量、积分消耗、模型可用性等关键指标</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-3 pr-9 py-2.5 outline-none focus:border-[#3366FF] transition-colors cursor-pointer">
              {ranges.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)] pointer-events-none" />
          </div>
          <button onClick={() => { window.location.reload(); }}
            className="p-2.5 bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--slate-400)] rounded-lg hover:text-white hover:border-[#3366FF] transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="API 调用总量" value={formatNumber(totalCalls)} change={callRows.length > 0 ? `+${callRows.length}` : undefined} changeType="up" icon={Zap} accent="#3366FF" subtitle="近期调用" />
        <StatCard title="平均响应延迟" value={`${avgLatency}ms`} change="< 100ms" changeType="up" icon={Activity} accent="#10B981" subtitle="P50" />
        <StatCard title="活跃模型数" value={String(activeModels)} change={undefined} changeType="neutral" icon={Layers} accent="#A855F7" />
        <StatCard title="注册用户" value={String(totalUsers)} change="+0" changeType="neutral" icon={CreditCard} accent="#F59E0B" />
      </div>

      {/* ── Charts + Recent calls ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* QPS Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="xl:col-span-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space text-[15px] font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#3366FF]" /> 实时 QPS 趋势
            </h3>
            <div className="flex items-center gap-4 text-[12px] text-[var(--slate-400)]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3366FF]" /> QPS</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> 延迟</span>
            </div>
          </div>
          <div className="h-[180px] flex items-end justify-between gap-1.5 px-2">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = 30 + Math.sin(i * 0.5) * 20 + Math.random() * 30;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: i * 0.02 }}
                    className="w-full max-w-[28px] rounded-sm bg-gradient-to-t from-[#3366FF] to-[#3366FF]/60" style={{ opacity: 0.7 + (i / 24) * 0.3 }} />
                  {i % 4 === 0 && <span className="text-[9px] text-[var(--slate-600)]">{i}:00</span>}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Health */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-space text-[15px] font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10B981]" /> 服务健康状态
          </h3>
          <div className="space-y-2">
            {(modelList || []).slice(0, 5).map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--dark-hover)]/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[13px] text-[var(--dark-text)]">{model.name}</span>
                </div>
                <span className="text-[11px] text-[#10B981] font-medium">正常</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Calls ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="font-space text-[15px] font-semibold text-white">最近调用记录</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">时间</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">模型</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">类型</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">耗时</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">Token</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">积分</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {callRows.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-[13px] text-[var(--slate-500)]">暂无调用记录</td></tr>
              )}
              {callRows.map((call, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains whitespace-nowrap">{call.timestamp}</td>
                  <td className="py-3 px-5 text-[12px] text-white font-medium">{call.model}</td>
                  <td className="py-3 px-5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--dark-hover)] text-[var(--slate-300)]">{call.type}</span>
                  </td>
                  <td className="py-3 px-5">
                    {call.status === '成功' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#10B981]"><CheckCircle2 className="w-3 h-3" /> 成功</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#EF4444]"><AlertTriangle className="w-3 h-3" /> 失败</span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains">{call.duration}</td>
                  <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains text-right">{call.tokens}</td>
                  <td className="py-3 px-5 text-[12px] text-[#F59E0B] font-medium text-right">-{call.credits.toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
