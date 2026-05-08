import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Lock,
  Plus,
  Download,
  Eye,
  ArrowUpRight,
  Minus,
  ChevronRight,
  RefreshCcw,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMockData } from '@/hooks/useMockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const creditTrendData = [
  { date: '12-01', consume: 3200, recharge: 5000, calls: 45 },
  { date: '12-02', consume: 4500, recharge: 0, calls: 62 },
  { date: '12-03', consume: 3800, recharge: 0, calls: 51 },
  { date: '12-04', consume: 5200, recharge: 10000, calls: 78 },
  { date: '12-05', consume: 4100, recharge: 0, calls: 55 },
  { date: '12-06', consume: 6700, recharge: 0, calls: 95 },
  { date: '12-07', consume: 3500, recharge: 0, calls: 48 },
  { date: '12-08', consume: 5800, recharge: 20000, calls: 82 },
  { date: '12-09', consume: 4200, recharge: 0, calls: 60 },
  { date: '12-10', consume: 5100, recharge: 0, calls: 73 },
  { date: '12-11', consume: 3900, recharge: 0, calls: 52 },
  { date: '12-12', consume: 4600, recharge: 0, calls: 64 },
  { date: '12-13', consume: 7200, recharge: 50000, calls: 102 },
  { date: '12-14', consume: 4800, recharge: 0, calls: 68 },
  { date: '12-15', consume: 5500, recharge: 0, calls: 77 },
  { date: '12-16', consume: 6100, recharge: 0, calls: 85 },
  { date: '12-17', consume: 3400, recharge: 0, calls: 46 },
  { date: '12-18', consume: 5200, recharge: 0, calls: 71 },
  { date: '12-19', consume: 6800, recharge: 0, calls: 96 },
  { date: '12-20', consume: 4300, recharge: 0, calls: 58 },
  { date: '12-21', consume: 5900, recharge: 0, calls: 80 },
  { date: '12-22', consume: 4700, recharge: 0, calls: 65 },
  { date: '12-23', consume: 8100, recharge: 0, calls: 112 },
  { date: '12-24', consume: 5600, recharge: 0, calls: 76 },
  { date: '12-25', consume: 4900, recharge: 0, calls: 66 },
  { date: '12-26', consume: 6300, recharge: 0, calls: 88 },
  { date: '12-27', consume: 7100, recharge: 0, calls: 98 },
  { date: '12-28', consume: 3800, recharge: 0, calls: 50 },
  { date: '12-29', consume: 5400, recharge: 0, calls: 74 },
  { date: '12-30', consume: 6200, recharge: 0, calls: 86 },
];

const modelUsageData = [
  { name: 'GPT-4o', percent: 45 },
  { name: 'Claude 3.5 Sonnet', percent: 25 },
  { name: 'DALL-E 3', percent: 15 },
];

export default function Credits() {
  const navigate = useNavigate();
  const { getCreditTransactions } = useMockData();
  const transactions = getCreditTransactions();

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');
  const [filterType, setFilterType] = useState<string>('all');
  const [detailTx, setDetailTx] = useState<typeof transactions[0] | null>(null);

  const balanceOverview = {
    available: 128500,
    frozen: 5000,
    totalRecharged: 250000,
    totalConsumed: 121500,
    totalRefunded: 5000,
  };

  const filteredTx = filterType === 'all'
    ? transactions
    : transactions.filter((tx) => tx.type === filterType);

  const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    recharge: { label: '充值', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
    consume: { label: '消耗', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
    refund: { label: '退款', color: '#22D3EE', bg: 'rgba(34,211,238,0.15)' },
    freeze: { label: '冻结', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
  };

  const handleExport = useCallback(() => {
    const headers = ['流水号', '时间', '类型', '变动积分', '余额', '描述'];
    const rows = filteredTx.map((tx) => [
      tx.id,
      new Date(tx.createdAt).toLocaleString(),
      typeConfig[tx.type]?.label || tx.type,
      tx.amount,
      tx.balance,
      tx.description,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredTx]);

  const relatedObjectMap: Record<string, string> = {
    '支付宝充值': '-',
    'API 调用消费': 'GPT-4o',
    '图片生成消费': 'DALL-E 3',
    '调用异常退款': '-',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-[1.25]">积分中心</h1>
          <p className="mt-1 text-[var(--slate-400)]">管理您的积分余额、查看消耗趋势和积分流水记录。</p>
        </div>
        <button
          onClick={() => navigate('/console/recharge')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] hover:shadow-[0_0_60px_rgba(51,102,255,0.25)] hover:-translate-y-px active:scale-[0.97] transition-all"
        >
          <Plus className="w-4 h-4" />
          充值积分
        </button>
      </motion.div>

      {/* Balance Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Available Credits */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 relative overflow-hidden group hover:border-[rgba(51,102,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#34D399]" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(52,211,153,0.15)] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#34D399]" />
            </div>
            <span className="text-xs text-[var(--slate-400)] font-medium">当前积分余额</span>
          </div>
          <p className="font-jetbrains text-[28px] font-semibold text-white leading-[1.2] tracking-tight">
            {balanceOverview.available.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--slate-500)] mt-1">≈ ¥{(balanceOverview.available / 100).toFixed(2)}</p>
        </div>

        {/* Frozen Credits */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 relative overflow-hidden group hover:border-[rgba(51,102,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#A855F7]" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.15)] flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#A855F7]" />
            </div>
            <span className="text-xs text-[var(--slate-400)] font-medium">冻结积分</span>
          </div>
          <p className="font-jetbrains text-[28px] font-semibold text-white leading-[1.2] tracking-tight">
            {balanceOverview.frozen.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--slate-500)] mt-1">异步任务预扣</p>
        </div>

        {/* Total Recharged */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 relative overflow-hidden group hover:border-[rgba(51,102,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#3366FF]" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(51,102,255,0.15)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#3366FF]" />
            </div>
            <span className="text-xs text-[var(--slate-400)] font-medium">累计充值</span>
          </div>
          <p className="font-jetbrains text-[28px] font-semibold text-white leading-[1.2] tracking-tight">
            {balanceOverview.totalRecharged.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--slate-500)] mt-1">共 5 次充值</p>
        </div>

        {/* Total Consumed */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 relative overflow-hidden group hover:border-[rgba(51,102,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F43F5E]" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(244,63,94,0.15)] flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-[#F43F5E]" />
            </div>
            <span className="text-xs text-[var(--slate-400)] font-medium">累计消耗</span>
          </div>
          <p className="font-jetbrains text-[28px] font-semibold text-white leading-[1.2] tracking-tight">
            {balanceOverview.totalConsumed.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--slate-500)] mt-1">API 调用 + 任务</p>
        </div>

        {/* Total Refunded */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 relative overflow-hidden group hover:border-[rgba(51,102,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F59E0B]" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
              <RefreshCcw className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <span className="text-xs text-[var(--slate-400)] font-medium">累计退款</span>
          </div>
          <p className="font-jetbrains text-[28px] font-semibold text-white leading-[1.2] tracking-tight">
            {balanceOverview.totalRefunded.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--slate-500)] mt-1">异常调用退款</p>
        </div>
      </motion.div>

      {/* Credit Consumption Trend Chart */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-space text-xl font-semibold text-white">积分消耗趋势</h2>
            <span className="text-xs text-[var(--slate-500)]">
              近{timeRange === '30d' ? '30' : '7'}天
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[var(--dark-bg)] rounded-lg p-0.5">
            {(['7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-[#3366FF] text-white'
                    : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
                }`}
              >
                近{range === '7d' ? '7' : '30'}天
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1" style={{ minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={creditTrendData.slice(timeRange === '7d' ? -7 : 0)}>
                <defs>
                  <linearGradient id="consumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3366FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3366FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--slate-500)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--slate-500)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--dark-card)',
                    border: '1px solid var(--dark-border)',
                    borderRadius: '12px',
                    color: 'var(--dark-text)',
                  }}
                  formatter={(value: number) => [value.toLocaleString(), '消耗积分']}
                />
                <Area
                  type="monotone"
                  dataKey="consume"
                  stroke="#3366FF"
                  strokeWidth={2}
                  fill="url(#consumeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Side Statistics */}
          <div className="lg:w-56 space-y-4">
            <div>
              <p className="text-xs text-[var(--slate-400)]">总消耗</p>
              <p className="font-jetbrains text-xl font-semibold text-white mt-1">
                {creditTrendData.reduce((s, d) => s + d.consume, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--slate-400)]">总充值</p>
              <p className="font-jetbrains text-xl font-semibold text-[#34D399] mt-1">
                {creditTrendData.reduce((s, d) => s + d.recharge, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--slate-400)]">净消耗</p>
              <p className="font-jetbrains text-xl font-semibold text-[#F43F5E] mt-1">
                {(creditTrendData.reduce((s, d) => s + d.consume, 0) - creditTrendData.reduce((s, d) => s + d.recharge, 0)).toLocaleString()}
              </p>
            </div>
            <div className="border-t border-[var(--dark-border)] pt-4">
              <p className="text-xs text-[var(--slate-400)] mb-3">最常用模型 Top 3</p>
              {modelUsageData.map((model) => (
                <div key={model.name} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--slate-300)]">{model.name}</span>
                    <span className="text-xs text-[var(--slate-400)]">{model.percent}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--dark-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3366FF] rounded-full transition-all duration-500"
                      style={{ width: `${model.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Credit Rules */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(51,102,255,0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-[#3366FF]" />
          </div>
          <div>
            <h3 className="font-space text-lg font-semibold text-white mb-2">积分规则说明</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-[var(--slate-400)]">
              <div className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#3366FF] mt-0.5 flex-shrink-0" />
                <span>1 积分 = ¥0.01，充值时按此汇率自动换算</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#3366FF] mt-0.5 flex-shrink-0" />
                <span>文本模型按 token 数量扣减积分</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#3366FF] mt-0.5 flex-shrink-0" />
                <span>图片/视频模型按生成次数扣减积分</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#3366FF] mt-0.5 flex-shrink-0" />
                <span>调用异常时自动触发积分退款</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#3366FF] mt-0.5 flex-shrink-0" />
                <span>异步任务提交时预扣积分，完成后多退少补</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#3366FF] mt-0.5 flex-shrink-0" />
                <span>积分不足时 API 调用将返回 402 错误</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Credit Transaction Table */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-4 gap-4">
          <h2 className="font-space text-xl font-semibold text-white">积分流水</h2>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-[var(--dark-text)] rounded-lg px-3 py-2 outline-none focus:border-[#3366FF] transition-colors"
            >
              <option value="all">全部类型</option>
              <option value="recharge">充值</option>
              <option value="consume">消耗</option>
              <option value="refund">退款</option>
              <option value="freeze">冻结</option>
            </select>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              导出流水
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)] hover:bg-[var(--dark-sidebar)]">
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">流水号</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">类型</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">变动积分</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">变动后余额</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">关联对象</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">时间</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">备注</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTx.map((tx, idx) => {
                const tc = typeConfig[tx.type] || typeConfig.consume;
                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    className="border-b border-[var(--dark-border)] hover:bg-[var(--dark-hover)] transition-colors cursor-pointer"
                    onClick={() => setDetailTx(tx)}
                  >
                    <TableCell className="px-4">
                      <span className="font-jetbrains text-sm text-[#7A9FFF]">{tx.id}</span>
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: tc.bg, color: tc.color }}
                      >
                        {tx.type === 'recharge' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                        {tx.type === 'consume' && <Minus className="w-3 h-3 mr-1" />}
                        {tx.type === 'refund' && <RefreshCcw className="w-3 h-3 mr-1" />}
                        {tx.type === 'freeze' && <Lock className="w-3 h-3 mr-1" />}
                        {tc.label}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className="font-jetbrains text-sm font-semibold"
                        style={{ color: tx.amount > 0 ? '#34D399' : tx.amount < 0 ? '#EF4444' : 'var(--slate-300)' }}
                      >
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 font-jetbrains text-sm text-white">
                      {tx.balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 text-sm text-[var(--slate-400)]">
                      {relatedObjectMap[tx.description] || tx.description.split(' ')[0]}
                    </TableCell>
                    <TableCell className="px-4 text-xs text-[var(--slate-500)]">
                      {new Date(tx.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell className="px-4 text-sm text-[var(--slate-300)] max-w-[200px] truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailTx(tx);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#3366FF] hover:text-[#7A9FFF] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看
                      </button>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!detailTx} onOpenChange={() => setDetailTx(null)}>
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-space">流水详情</DialogTitle>
          </DialogHeader>
          {detailTx && (
            <div className="space-y-3 text-sm mt-2">
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">流水号</span>
                <span className="font-jetbrains text-[#7A9FFF]">{detailTx.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">类型</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: typeConfig[detailTx.type].bg,
                    color: typeConfig[detailTx.type].color,
                  }}
                >
                  {typeConfig[detailTx.type].label}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">变动积分</span>
                <span
                  className="font-jetbrains font-semibold"
                  style={{ color: detailTx.amount > 0 ? '#34D399' : '#EF4444' }}
                >
                  {detailTx.amount > 0 ? '+' : ''}{detailTx.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">变动后余额</span>
                <span className="font-jetbrains text-white">{detailTx.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--dark-border)]">
                <span className="text-[var(--slate-400)]">时间</span>
                <span className="text-[var(--slate-300)]">{new Date(detailTx.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--slate-400)]">备注</span>
                <span className="text-[var(--slate-300)] text-right">{detailTx.description}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
