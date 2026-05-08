import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Zap,
  AlertTriangle,
  ClipboardCheck,
  Coins,
  Users,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  providerHealthData,
  recentAlerts,
  activityTimeline,
  hourlyRequestData,
  rechargeRecords,
} from '@/lib/adminMockData';

const kpiCards = [
  { label: '活跃工作区', value: '1,245', icon: Briefcase, color: '#3366FF', change: '+12 今日新增', changeColor: '#34D399' },
  { label: '今日 API 请求', value: '2.4M', icon: Zap, color: '#22D3EE', change: '+15.3% 较昨日', changeColor: '#34D399' },
  { label: '请求失败率', value: '0.8%', icon: AlertTriangle, color: '#F43F5E', change: '-0.3% 较昨日', changeColor: '#34D399' },
  { label: '待审核充值', value: '23', icon: ClipboardCheck, color: '#FBBF24', change: '最早 1 天前提交', changeColor: '#FBBF24' },
  { label: '今日收入', value: '¥12,580', icon: Coins, color: '#34D399', change: '+8.2% 较昨日', changeColor: '#34D399' },
  { label: '当前在线用户', value: '186', icon: Users, color: '#A855F7', change: '控制台 + API 调用', changeColor: '#94A3B8' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function AdminOverview() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const pendingRecharges = rechargeRecords.filter((r) => r.status === 'pending').slice(0, 5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">运营总览</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">平台实时运营数据监控中心</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="h-10 px-3 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]">
            <option>今天</option>
            <option>昨天</option>
            <option>最近7天</option>
            <option>最近30天</option>
          </select>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 relative overflow-hidden hover:border-[#3366FF]/30 transition-colors"
            style={{ borderTop: `3px solid ${card.color}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">{card.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <p className="mt-3 font-jetbrains text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-xs" style={{ color: card.changeColor }}>{card.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Request Trend Chart */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-space text-lg font-semibold text-white">实时请求趋势</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-400">实时</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={hourlyRequestData}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3366FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3366FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
            <XAxis dataKey="hour" stroke="var(--slate-500)" fontSize={12} />
            <YAxis stroke="var(--slate-500)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--dark-card)',
                border: '1px solid var(--dark-border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--slate-300)' }}
            />
            <Area type="monotone" dataKey="requests" stroke="#3366FF" fill="url(#colorRequests)" strokeWidth={2} name="总请求" />
            <Area type="monotone" dataKey="success" stroke="#34D399" fill="url(#colorSuccess)" strokeWidth={2} name="成功请求" />
            <Bar dataKey="failed" fill="#F43F5E" radius={[2, 2, 0, 0]} name="失败请求" barSize={6} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[var(--dark-border)]">
          {[
            { label: '峰值 QPS', value: '4,230' },
            { label: '平均 QPS', value: '2,810' },
            { label: '总请求 (今日)', value: '2.4M' },
            { label: '平均响应', value: '156ms' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xs text-[var(--slate-400)]">{s.label}</p>
              <p className="font-jetbrains text-lg font-semibold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pending Recharges + Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Recharges */}
        <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-space text-lg font-semibold text-white">待审核充值</h2>
            <Link to="/admin/recharge-review" className="text-xs text-[#3366FF] hover:underline flex items-center gap-1">
              查看全部 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingRecharges.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-[var(--dark-border)] last:border-0">
                <div>
                  <p className="text-sm text-white">{r.customerName} <span className="text-[var(--slate-500)]">({r.workspaceId})</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-jetbrains text-white">¥{r.paymentAmount.toLocaleString()} <span className="text-[#34D399]">+{r.requestedCredits.toLocaleString()}</span></p>
                  <p className="text-xs text-[var(--slate-500)]">{r.bankName} {r.accountLast4}</p>
                </div>
                <span className="ml-3 text-xs px-2.5 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">待审核</span>
              </div>
            ))}
            {pendingRecharges.length === 0 && (
              <div className="text-center py-6 text-sm text-[var(--slate-500)]">暂无待审核充值</div>
            )}
          </div>
        </motion.div>

        {/* System Alerts */}
        <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <h2 className="font-space text-lg font-semibold text-white mb-4">系统告警</h2>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 py-3 border-b border-[var(--dark-border)] last:border-0">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                  style={{
                    backgroundColor:
                      alert.severity === 'critical' ? '#F43F5E' : alert.severity === 'warning' ? '#FBBF24' : '#3B82F6',
                    boxShadow: `0 0 8px ${alert.severity === 'critical' ? '#F43F5E' : alert.severity === 'warning' ? '#FBBF24' : '#3B82F6'}`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{alert.message}</p>
                  <p className="text-xs text-[var(--slate-500)] mt-0.5">{alert.source} · {alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Provider Health */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h2 className="font-space text-lg font-semibold text-white mb-4">供应商健康状态</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {providerHealthData.map((provider) => (
            <motion.div
              key={provider.name}
              variants={itemVariants}
              className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4 hover:border-[#3366FF]/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: provider.status === 'healthy' ? '#34D399' : provider.status === 'warning' ? '#FBBF24' : '#F43F5E',
                    boxShadow: `0 0 6px ${provider.status === 'healthy' ? '#34D399' : provider.status === 'warning' ? '#FBBF24' : '#F43F5E'}`,
                  }}
                />
                <h4 className="text-sm font-semibold text-white">{provider.name}</h4>
              </div>
              <p className="text-xs text-[var(--slate-400)] mb-1">
                {provider.status === 'healthy' ? '正常' : provider.status === 'warning' ? '响应缓慢' : '服务异常'}
              </p>
              <div className="space-y-1 mt-2">
                <p className="text-xs text-[#22D3EE]">响应: {provider.avgResponse}</p>
                <p className="text-xs text-[#34D399]">成功率: {provider.successRate}</p>
                <p className="text-xs text-[var(--slate-400)]">今日: {provider.todayCalls}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <h2 className="font-space text-lg font-semibold text-white mb-4">最近动态</h2>
        <div className="space-y-0">
          {activityTimeline.map((item, index) => (
            <div key={index} className="flex items-start gap-4 py-3 border-b border-[var(--dark-border)] last:border-0">
              <span className="w-20 text-xs text-[var(--slate-500)] flex-shrink-0 pt-0.5">{item.time}</span>
              <div className="relative flex-shrink-0 pt-1">
                <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: item.color }} />
                {index < activityTimeline.length - 1 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-full bg-[var(--dark-border)]" />
                )}
              </div>
              <p className="text-sm text-[var(--slate-300)]">{item.content}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
