import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Brain,
  Coins,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { callLogs } from '@/lib/mockData';

function getPortalKey() {
  return localStorage.getItem('ainexus_portal_key') || '';
}

const COLORS = ['#3366FF', '#A855F7', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

export default function PortalStats() {
  const portalKey = useMemo(() => getPortalKey(), []);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter logs for this key
  const keyLogs = useMemo(() => {
    return callLogs.filter((_log) =>
      portalKey ? 'mock'?.includes(portalKey.slice(-6)) : true
    );
  }, [portalKey]);

  // Daily stats for chart
  const dailyStats = useMemo(() => {
    const stats: Record<string, { date: string; calls: number; credits: number }> = {};
    keyLogs.forEach((log) => {
      const date = log.timestamp?.split(' ')[0] || '未知';
      if (!stats[date]) {
        stats[date] = { date, calls: 0, credits: 0 };
      }
      stats[date].calls += 1;
      stats[date].credits += log.creditsUsed || 0;
    });
    return Object.values(stats).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  }, [keyLogs]);

  // Model distribution
  const modelStats = useMemo(() => {
    const stats: Record<string, { name: string; calls: number; credits: number }> = {};
    keyLogs.forEach((log) => {
      const name = log.model || '未知';
      if (!stats[name]) {
        stats[name] = { name, calls: 0, credits: 0 };
      }
      stats[name].calls += 1;
      stats[name].credits += log.creditsUsed || 0;
    });
    return Object.values(stats).sort((a, b) => b.credits - a.credits).slice(0, 6);
  }, [keyLogs]);

  // Summary
  const totalCalls = keyLogs.length;
  const totalCredits = keyLogs.reduce((s, l) => s + (l.creditsUsed || 0), 0);
  const avgCreditsPerCall = totalCalls > 0 ? (totalCredits / totalCalls).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space text-h3 text-white font-semibold">消耗统计</h1>
          <p className="text-body-sm text-[var(--slate-500)] mt-1">
            当前 API Key 的调用量和积分消耗趋势
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                timeRange === r
                  ? 'bg-[#3366FF]/15 text-[#3366FF]'
                  : 'bg-[var(--dark-card)] text-[var(--slate-500)] hover:text-white border border-[var(--dark-border)]'
              }`}
            >
              {r === '7d' ? '近7天' : r === '30d' ? '近30天' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: '总调用次数',
            value: totalCalls,
            unit: '次',
            icon: BarChart3,
            color: '#3366FF',
          },
          {
            label: '总消耗积分',
            value: totalCredits.toFixed(2),
            unit: '积分',
            icon: Coins,
            color: '#A855F7',
          },
          {
            label: '平均每次消耗',
            value: avgCreditsPerCall,
            unit: '积分/次',
            icon: TrendingUp,
            color: '#10B981',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-4.5 h-4.5" style={{ color: card.color }} />
              </div>
              <span className="text-caption text-[var(--slate-500)]">{card.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-h3 font-semibold text-white font-jetbrains">{card.value}</span>
              <span className="text-caption text-[var(--slate-500)]">{card.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily calls chart */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <h2 className="font-space text-[16px] font-semibold text-white flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-[#3366FF]" />
            每日调用量
          </h2>
          {dailyStats.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="calls" fill="#3366FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-body-sm text-[var(--slate-500)]">暂无数据</p>
            </div>
          )}
        </div>

        {/* Model distribution pie chart */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <h2 className="font-space text-[16px] font-semibold text-white flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-[#A855F7]" />
            模型消耗分布
          </h2>
          {modelStats.length > 0 ? (
            <div className="h-[260px] flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modelStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="credits"
                      nameKey="name"
                    >
                      {modelStats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {modelStats.map((m, i) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[12px] text-[var(--dark-text)]">{m.name}</span>
                    </div>
                    <span className="text-[12px] font-jetbrains text-[var(--slate-400)]">{m.credits.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-body-sm text-[var(--slate-500)]">暂无数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Model detail table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h2 className="font-space text-[16px] font-semibold text-white flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-[#10B981]" />
          模型消耗明细
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--dark-border)]">
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium">模型</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium text-right">调用次数</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium text-right">消耗积分</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium text-right">占比</th>
              </tr>
            </thead>
            <tbody>
              {modelStats.map((m) => (
                <tr key={m.name} className="border-b border-[var(--dark-border)] hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-3 px-4 text-[13px] text-white">{m.name}</td>
                  <td className="py-3 px-4 text-[13px] font-jetbrains text-[var(--dark-text)] text-right">{m.calls}</td>
                  <td className="py-3 px-4 text-[13px] font-jetbrains text-[#A855F7] text-right">{m.credits.toFixed(2)}</td>
                  <td className="py-3 px-4 text-[13px] font-jetbrains text-[var(--slate-400)] text-right">
                    {totalCredits > 0 ? ((m.credits / totalCredits) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
              {modelStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-body-sm text-[var(--slate-500)]">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
