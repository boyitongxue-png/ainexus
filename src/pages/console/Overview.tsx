import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Coins,
  Zap,
  Brain,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Shield,
  Key,
  Code2,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import {
  callLogs,
  asyncTasks,
  creditTransactions,
  platformKeys,
  modelCatalog,
} from '@/lib/mockData';
import type { CallLog, AsyncTask, CreditTransaction } from '@/lib/mockData';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const } }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Mock sparkline data for KPI cards                                  */
/* ------------------------------------------------------------------ */
const sparkDataCredits = [
  { v: 120 }, { v: 132 }, { v: 101 }, { v: 134 }, { v: 90 }, { v: 230 }, { v: 210 },
];
const sparkDataRequests = [
  { v: 65 }, { v: 78 }, { v: 90 }, { v: 81 }, { v: 96 }, { v: 105 }, { v: 120 },
];
const sparkDataSuccess = [
  { v: 95 }, { v: 96 }, { v: 94 }, { v: 97 }, { v: 98 }, { v: 97 }, { v: 99 },
];
const sparkDataModels = [
  { v: 12 }, { v: 13 }, { v: 14 }, { v: 14 }, { v: 16 }, { v: 17 }, { v: 18 },
];

/* ------------------------------------------------------------------ */
/*  Mini Sparkline component                                           */
/* ------------------------------------------------------------------ */
function MiniSparkline({ data, color, width = 80, height = 30 }: { data: { v: number }[]; color: string; width?: number; height?: number }) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} fill={`url(#spark-${color.replace('#', '')})`} strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusBadge(status: CallLog['status']) {
  switch (status) {
    case 'success':
      return { cls: 'bg-[#10B981]/15 text-[#10B981]', label: '成功' };
    case 'error':
      return { cls: 'bg-[#EF4444]/15 text-[#EF4444]', label: '失败' };
    case 'timeout':
      return { cls: 'bg-[#F59E0B]/15 text-[#F59E0B]', label: '超时' };
  }
}

function taskStatusConfig(status: AsyncTask['status']) {
  switch (status) {
    case 'completed':
      return { icon: CheckCircle2, color: '#10B981', bg: '#10B981/15', label: '已完成' };
    case 'processing':
      return { icon: RefreshCw, color: '#3366FF', bg: '#3366FF/15', label: '处理中' };
    case 'pending':
      return { icon: Clock, color: '#F59E0B', bg: '#F59E0B/15', label: '等待中' };
    case 'failed':
      return { icon: XCircle, color: '#EF4444', bg: '#EF4444/15', label: '失败' };
  }
}

/* ------------------------------------------------------------------ */
/*  Zero-code integration steps                                        */
/* ------------------------------------------------------------------ */
const integrationSteps = [
  {
    icon: Brain,
    title: '浏览平台模型',
    desc: '在「模型目录」查看平台已上架的全部模型能力、定价与参数',
  },
  {
    icon: Shield,
    title: '创建平台 Key',
    desc: '在「平台 API Key」页面创建调用统一接口的密钥，设置权限和限流',
  },
  {
    icon: Code2,
    title: '修改 Base URL',
    desc: '将现有代码中的 OpenAI base_url 替换为 AI Nexus 的统一接口地址',
  },
  {
    icon: Zap,
    title: '开始调用',
    desc: '无需改动其他代码，即可通过统一接口调用所有聚合模型',
  },
];

/* ------------------------------------------------------------------ */
/*  Credit transaction badge                                         */
/* ------------------------------------------------------------------ */
function txBadge(tx: CreditTransaction) {
  switch (tx.type) {
    case 'recharge':
      return { cls: 'text-[#10B981]', sign: '+' };
    case 'consume':
      return { cls: 'text-[#EF4444]', sign: '' };
    case 'refund':
      return { cls: 'text-[#F59E0B]', sign: '+' };
    case 'freeze':
      return { cls: 'text-[#94A3B8]', sign: '' };
  }
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function ConsoleOverview() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7d');

  // Derived mock data
  const recentLogs = callLogs.slice(0, 8);
  const recentTasks = asyncTasks.slice(0, 4);
  const recentTx = creditTransactions.slice(0, 5);
  const activePlatformKeys = platformKeys.filter((k) => k.status === 'active');
  const availableModels = modelCatalog.filter((m) => m.status === 'active');

  // KPI definitions
  const kpis = [
    {
      label: '可用积分',
      value: '128,500',
      sub: '+5,000 本月充值',
      subColor: 'text-[#34D399]',
      icon: Coins,
      iconColor: '#34D399',
      borderColor: 'border-t-[3px] border-t-[#34D399]',
      trend: 'up' as const,
      spark: sparkDataCredits,
      sparkColor: '#34D399',
    },
    {
      label: '本月请求量',
      value: '284,750',
      sub: '+12.5% 较上月',
      subColor: 'text-[#34D399]',
      icon: Zap,
      iconColor: '#3366FF',
      borderColor: 'border-t-[3px] border-t-[#3366FF]',
      trend: 'up' as const,
      spark: sparkDataRequests,
      sparkColor: '#3366FF',
    },
    {
      label: '成功率',
      value: '99.7%',
      sub: '-0.1% 较上月',
      subColor: 'text-[#94A3B8]',
      icon: TrendingUp,
      iconColor: '#22D3EE',
      borderColor: 'border-t-[3px] border-t-[#22D3EE]',
      trend: 'down' as const,
      spark: sparkDataSuccess,
      sparkColor: '#22D3EE',
    },
    {
      label: '可用模型',
      value: String(availableModels.length),
      sub: '全部正常运行',
      subColor: 'text-[#34D399]',
      icon: Brain,
      iconColor: '#A855F7',
      borderColor: 'border-t-[3px] border-t-[#A855F7]',
      trend: 'up' as const,
      spark: sparkDataModels,
      sparkColor: '#A855F7',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Section 1: Workspace Info Bar ────────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-space text-[36px] font-semibold text-white leading-tight">总览</h1>
            <p className="mt-1 text-[14px] text-[var(--slate-400)]">
              欢迎回来，张明远。以下是您的账户概况。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#3366FF] transition-colors"
            >
              <option value="today">今天</option>
              <option value="7d">近 7 天</option>
              <option value="30d">近 30 天</option>
              <option value="custom">自定义</option>
            </select>
            <button
              onClick={() => navigate('/console/platform-keys')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] transition-colors hover:shadow-glow-hover"
            >
              <Key className="w-4 h-4" />
              创建 API Key
            </button>
            <button
              onClick={() => window.open('/docs', '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 text-[var(--slate-300)] text-sm rounded-full hover:bg-[var(--dark-hover)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              查看文档
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: KPI Stat Cards ────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
      >
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            variants={fadeUp}
            custom={i}
            className={`bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 ${kpi.borderColor} cursor-pointer hover:border-[#3366FF]/30 hover:shadow-lg transition-all`}
            onClick={() => {
              if (i === 0) navigate('/console/credits');
              if (i === 1) navigate('/console/logs');
              if (i === 3) navigate('/console/models');
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <kpi.icon className="w-5 h-5" style={{ color: kpi.iconColor }} />
                <span className="text-[12px] font-medium text-[var(--slate-400)] uppercase tracking-wide">
                  {kpi.label}
                </span>
              </div>
              <MiniSparkline data={kpi.spark} color={kpi.sparkColor} />
            </div>
            <p className="mt-3 font-jetbrains text-[28px] font-semibold text-white leading-tight">{kpi.value}</p>
            <div className="mt-2 flex items-center gap-1">
              {kpi.trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#34D399]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              )}
              <span className={`text-[13px] ${kpi.subColor}`}>{kpi.sub}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Section 3: Zero-code Integration Process ─────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mb-8">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-space text-[20px] font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#3366FF]" />
                零代码接入流程
              </h2>
              <p className="mt-1 text-[13px] text-[var(--slate-400)]">四步完成接入，无需改造现有业务代码</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationSteps.map((step, i) => (
              <div
                key={step.title}
                className="relative bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4 hover:border-[#3366FF]/30 transition-all group cursor-pointer"
                onClick={() => {
                  if (i === 0) navigate('/console/models');
                  if (i === 1) navigate('/console/platform-keys');
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#3366FF]/15 flex items-center justify-center text-[#3366FF] text-sm font-bold">
                    {i + 1}
                  </div>
                  {i < integrationSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-6 w-4 h-4 text-[var(--slate-600)]" />
                  )}
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#3366FF]/15 flex items-center justify-center mb-3 group-hover:shadow-glow transition-shadow">
                  <step.icon className="w-5 h-5 text-[#3366FF]" />
                </div>
                <h4 className="text-[14px] font-semibold text-white mb-1">{step.title}</h4>
                <p className="text-[12px] text-[var(--slate-400)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Section 4: Two-column layout (Models + Platform Keys) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Platform Models Overview */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="lg:col-span-2">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-space text-[20px] font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#3366FF]" />
                平台模型速览
              </h2>
              <button
                onClick={() => navigate('/console/models')}
                className="text-[13px] text-[#3366FF] hover:text-[#7A9FFF] flex items-center gap-1 transition-colors"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modelCatalog.slice(0, 4).map((model) => (
                <motion.div
                  key={model.id}
                  whileHover={{ y: -2, borderColor: 'rgba(51,102,255,0.3)' }}
                  className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4 cursor-pointer transition-all"
                  onClick={() => navigate('/console/models')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-[14px] font-medium text-white">{model.name}</h4>
                      <p className="text-[12px] text-[var(--slate-400)]">{model.provider}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      model.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' :
                      model.status === 'beta' ? 'bg-[#3B82F6]/15 text-[#3B82F6]' :
                      'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}>
                      {model.status === 'active' ? '可用' : model.status === 'beta' ? 'Beta' : '已停用'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--slate-500)]">类型</span>
                      <span className="text-[var(--dark-text)]">{model.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--slate-500)]">积分价格</span>
                      <span className="text-[#A855F7]">{model.costPer1KTokens} 积分 / 1K tokens</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {model.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--dark-hover)] text-[var(--slate-400)]">{cap}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Platform API Key Status */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-space text-[20px] font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#A855F7]" />
                平台 API Key
              </h2>
              <button
                onClick={() => navigate('/console/platform-keys')}
                className="text-[13px] text-[#3366FF] hover:text-[#7A9FFF] flex items-center gap-1 transition-colors"
              >
                管理 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {platformKeys.map((pk) => {
                const isActive = pk.status === 'active';
                return (
                  <motion.div
                    key={pk.id}
                    whileHover={{ x: 4, borderColor: 'rgba(51,102,255,0.3)' }}
                    className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4 cursor-pointer transition-all"
                    onClick={() => navigate('/console/platform-keys')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#A855F7]" />
                        <span className="text-[14px] font-medium text-white">{pk.name}</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[var(--slate-700)] text-[var(--slate-400)]'}`}>
                        {isActive ? '启用' : '已禁用'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[var(--slate-400)]">
                      <code className="text-[11px] font-jetbrains text-[var(--slate-500)]">{pk.keyPreview}</code>
                      <span>|</span>
                      <span>QPS: {pk.rateLimit}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pk.permissions.slice(0, 3).map((perm) => (
                        <span key={perm} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--dark-hover)] text-[var(--slate-400)] border border-[var(--dark-border)]">
                          {perm}
                        </span>
                      ))}
                    </div>
                    {pk.lastUsedAt && (
                      <p className="mt-2 text-[11px] text-[var(--slate-500)]">
                        最近使用: {formatDate(pk.lastUsedAt)}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--dark-border)] flex items-center justify-between text-[12px] text-[var(--slate-400)]">
              <span>启用: <span className="text-[#10B981] font-medium">{activePlatformKeys.length}</span></span>
              <span>总计: <span className="text-white font-medium">{platformKeys.length}</span></span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Section 5: Recent Call Logs Table ────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="mb-8">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-space text-[20px] font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#22D3EE]" />
              最近调用日志
            </h2>
            <button
              onClick={() => navigate('/console/logs')}
              className="text-[13px] text-[#3366FF] hover:text-[#7A9FFF] flex items-center gap-1 transition-colors"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-6 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">时间</th>
                  <th className="py-3 px-6 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">请求 ID</th>
                  <th className="py-3 px-6 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">类型</th>
                  <th className="py-3 px-6 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">模型</th>
                  <th className="py-3 px-6 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-3 px-6 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">耗时</th>
                  <th className="py-3 px-6 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">积分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {recentLogs.map((log: CallLog, i: number) => {
                  const badge = statusBadge(log.status);
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
                      className="hover:bg-[var(--dark-hover)] transition-colors cursor-pointer"
                      onClick={() => navigate('/console/logs')}
                    >
                      <td className="py-3 px-6 text-[13px] text-[var(--slate-400)] font-jetbrains whitespace-nowrap">{formatTime(log.timestamp)}</td>
                      <td className="py-3 px-6 text-[13px] text-[var(--slate-400)] font-jetbrains">{log.requestId}</td>
                      <td className="py-3 px-6 text-[13px] text-[var(--dark-text)]">{log.type}</td>
                      <td className="py-3 px-6 text-[13px] text-white font-medium">{log.model}</td>
                      <td className="py-3 px-6">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="py-3 px-6 text-[13px] text-[var(--slate-400)] font-jetbrains">{log.duration}ms</td>
                      <td className="py-3 px-6 text-[13px] text-[var(--slate-400)] font-jetbrains">{log.creditsUsed}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Section 6: Two-column (Async Tasks + Credit Tx) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Async Tasks */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8}>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-space text-[20px] font-semibold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#F59E0B]" />
                最近异步任务
              </h2>
              <button
                onClick={() => navigate('/console/tasks')}
                className="text-[13px] text-[#3366FF] hover:text-[#7A9FFF] flex items-center gap-1 transition-colors"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentTasks.map((task: AsyncTask, i: number) => {
                const cfg = taskStatusConfig(task.status);
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{ x: 4, borderColor: 'rgba(51,102,255,0.2)' }}
                    className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4 cursor-pointer transition-all"
                    onClick={() => navigate('/console/tasks')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <StatusIcon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-medium text-white truncate">{task.prompt}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ml-2 shrink-0`} style={{ color: cfg.color, backgroundColor: `${cfg.color}15` }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--slate-500)]">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {task.model}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {task.creditsUsed} 积分
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.createdAt).toLocaleTimeString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Credit Transactions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9}>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-space text-[20px] font-semibold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#34D399]" />
                最近积分流水
              </h2>
              <button
                onClick={() => navigate('/console/credits')}
                className="text-[13px] text-[#3366FF] hover:text-[#7A9FFF] flex items-center gap-1 transition-colors"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--dark-border)]">
                    <th className="pb-3 text-[11px] font-medium text-[var(--slate-400)] uppercase">时间</th>
                    <th className="pb-3 text-[11px] font-medium text-[var(--slate-400)] uppercase">类型</th>
                    <th className="pb-3 text-[11px] font-medium text-[var(--slate-400)] uppercase text-right">变动</th>
                    <th className="pb-3 text-[11px] font-medium text-[var(--slate-400)] uppercase text-right">余额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dark-border)]">
                  {recentTx.map((tx: CreditTransaction, i: number) => {
                    const badge = txBadge(tx);
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.08 }}
                        className="hover:bg-[var(--dark-hover)] transition-colors cursor-pointer"
                        onClick={() => navigate('/console/credits')}
                      >
                        <td className="py-3 text-[12px] text-[var(--slate-400)] whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="py-3 text-[12px] text-[var(--dark-text)]">{tx.description}</td>
                        <td className={`py-3 text-[13px] font-jetbrains font-medium text-right ${badge.cls}`}>
                          {badge.sign}{tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 text-[13px] font-jetbrains text-[var(--dark-text)] text-right">
                          {tx.balance.toLocaleString()}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
