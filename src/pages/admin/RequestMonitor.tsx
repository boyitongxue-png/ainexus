import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle, Clock, Users, RefreshCw } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  requestMonitorEntries,
  qpsRealtimeData,
  topCustomersByRequest,
  topModelsByUsage,
  topErrorCodes,
} from '@/lib/adminMockData';

const statusColors = ['#10B981', '#EF4444', '#F59E0B'];

const statusDistribution = [
  { name: '成功', value: 98.2 },
  { name: '失败', value: 1.2 },
  { name: '超时', value: 0.6 },
];

export default function RequestMonitor() {
  const [timeRange, setTimeRange] = useState('1h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalRequests = requestMonitorEntries.length;
  const successCount = requestMonitorEntries.filter((r) => r.status === 'success').length;
  const failedCount = requestMonitorEntries.filter((r) => r.status !== 'success').length;
  const avgDuration = Math.floor(requestMonitorEntries.reduce((sum, r) => sum + r.duration, 0) / totalRequests);

  const kpiCards = [
    { label: '实时 QPS', value: '2,810', sub: '峰值 4,230', icon: Activity, color: '#3366FF' },
    { label: '成功率', value: `${((successCount / totalRequests) * 100).toFixed(1)}%`, sub: `失败 ${failedCount} 次`, icon: TrendingUp, color: '#10B981' },
    { label: '平均响应', value: `${avgDuration}ms`, sub: 'P95 420ms', icon: Clock, color: '#22D3EE' },
    { label: '错误率', value: `${((failedCount / totalRequests) * 100).toFixed(1)}%`, sub: '较 -0.3%', icon: AlertTriangle, color: '#F43F5E' },
    { label: '活跃连接', value: '1,245', sub: '工作区数', icon: Users, color: '#A855F7' },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">请求监控</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">平台 API 调用实时监控与健康度分析</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-emerald-400">实时监控中</span>
          </div>
          <select className="h-9 px-3 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-xs text-white focus:outline-none focus:border-[#3366FF]">
            <option>5s</option>
            <option>10s</option>
            <option>30s</option>
            <option>1min</option>
          </select>
          <button onClick={handleRefresh} className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((s) => (
          <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--slate-400)] uppercase tracking-wider">{s.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="mt-3 font-jetbrains text-2xl font-semibold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--slate-500)]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* QPS Chart */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-space text-lg font-semibold text-white">QPS 实时监控</h2>
          <div className="flex items-center gap-1 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-1">
            {['1h', '6h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeRange === r ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
                }`}
              >
                {r === '1h' ? '1小时' : r === '6h' ? '6小时' : r === '24h' ? '24小时' : '7天'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={qpsRealtimeData}>
            <defs>
              <linearGradient id="qpsTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3366FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3366FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="qpsText" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
            <XAxis dataKey="minute" stroke="var(--slate-500)" fontSize={11} />
            <YAxis stroke="var(--slate-500)" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="qps" stroke="#3366FF" fill="url(#qpsTotal)" strokeWidth={2} name="总 QPS" />
            <Area type="monotone" dataKey="textQps" stroke="#34D399" fill="url(#qpsText)" strokeWidth={2} name="文本模型" />
            <Area type="monotone" dataKey="imageQps" stroke="#A855F7" fillOpacity={0.1} strokeWidth={2} name="图片模型" />
            <Area type="monotone" dataKey="videoQps" stroke="#FBBF24" fillOpacity={0.1} strokeWidth={2} name="视频模型" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[var(--dark-border)]">
          {[
            { label: '峰值 QPS', value: '4,230' },
            { label: '谷值 QPS', value: '1,520' },
            { label: '平均 QPS', value: '2,810' },
            { label: '总请求数', value: '168.6K' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xs text-[var(--slate-400)]">{s.label}</p>
              <p className="font-jetbrains text-lg text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error Analysis */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Error Trend */}
        <div className="lg:col-span-3 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <h2 className="font-space text-lg font-semibold text-white mb-4">错误趋势</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={qpsRealtimeData.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
              <XAxis dataKey="minute" stroke="var(--slate-500)" fontSize={11} />
              <YAxis stroke="var(--slate-500)" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="qps" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.2} strokeWidth={2} name="错误次数" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Error Distribution */}
        <div className="lg:col-span-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <h2 className="font-space text-lg font-semibold text-white mb-4">错误分布</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" strokeWidth={0}>
                {statusDistribution.map((_, index) => (
                  <Cell key={index} fill={statusColors[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusDistribution.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[i] }} />
                <span className="text-xs text-[var(--slate-400)]">{s.name} {s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Distribution */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h2 className="font-space text-lg font-semibold text-white mb-4">模型调用分布</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topModelsByUsage} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
            <XAxis type="number" stroke="var(--slate-500)" fontSize={11} />
            <YAxis dataKey="name" type="category" stroke="var(--slate-500)" fontSize={11} width={120} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="requests" fill="#3366FF" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h2 className="font-space text-lg font-semibold text-white mb-4">客户调用排行 (Top 5)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">排名</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">客户</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">调用次数</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">占比</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">消耗积分</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">平均响应</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {topCustomersByRequest.map((c, i) => (
                <tr key={c.name} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-[#FBBF24]/20 text-[#FBBF24]' : i === 1 ? 'bg-[#94A3B8]/20 text-[#94A3B8]' : i === 2 ? 'bg-[#B45309]/20 text-[#B45309]' : 'text-[var(--slate-400)]'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-sm text-white font-medium">{c.name}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{c.requests.toLocaleString()}</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{c.percentage}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{c.creditsUsed.toLocaleString()}</td>
                  <td className="py-4 px-5 text-sm text-[#22D3EE]">{c.avgResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Error Codes */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h2 className="font-space text-lg font-semibold text-white mb-4">错误码排行</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">错误码</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">描述</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">次数</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">占比</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {topErrorCodes.map((e) => (
                <tr key={e.code} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F43F5E]/15 text-[#F43F5E]">
                      {e.code}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-sm text-white">{e.message}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{e.count.toLocaleString()}</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{e.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
