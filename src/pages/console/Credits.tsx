import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Coins, TrendingDown, TrendingUp, Gift,
  ArrowDownLeft, CreditCard,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const txTypeConfig: Record<string, { label: string; icon: typeof TrendingDown; color: string; sign: string }> = {
  recharge: { label: '充值', icon: TrendingUp, color: '#10B981', sign: '+' },
  consume: { label: '消耗', icon: TrendingDown, color: '#F59E0B', sign: '-' },
  refund: { label: '退款', icon: ArrowDownLeft, color: '#10B981', sign: '+' },
  gift: { label: '赠送', icon: Gift, color: '#A855F7', sign: '+' },
  adjust: { label: '调整', icon: CreditCard, color: '#3366FF', sign: '+' },
};

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function ConsoleCredits() {
  const { data: balanceData } = trpc.credit.getBalance.useQuery();
  const { data: txData } = trpc.credit.transactionList.useQuery({ limit: 20 });

  /* ── Balance ── */
  const balance = parseFloat(balanceData?.balance || '0');
  const totalRecharged = parseFloat(balanceData?.totalRecharged || '0');
  const totalConsumed = parseFloat(balanceData?.totalConsumed || '0');

  /* ── Transactions ── */
  const transactions = useMemo(() => {
    if (!txData?.items) return [];
    return txData.items.map((tx) => {
      const cfg = txTypeConfig[tx.txType] || txTypeConfig.adjust;
      return {
        id: tx.id,
        type: tx.txType,
        amount: parseFloat(tx.amount),
        balanceAfter: parseFloat(tx.balanceAfter),
        description: tx.description || cfg.label,
        operator: tx.operator,
        createdAt: new Date(tx.createdAt).toLocaleString('zh-CN'),
        cfg,
      };
    });
  }, [txData]);

  /* ── Stats ── */
  const todayConsume = useMemo(() => {
    const today = new Date().toDateString();
    return transactions
      .filter((tx) => new Date(tx.createdAt).toDateString() === today && tx.type === 'consume')
      .reduce((s, tx) => s + Math.abs(tx.amount), 0);
  }, [transactions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-space text-[36px] font-semibold text-white leading-tight">积分中心</h1>
        <p className="mt-1 text-[14px] text-[var(--slate-400)]">查看您的积分余额、充值、消费明细及充值入口</p>
      </div>

      {/* ── Balance Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-[var(--slate-400)] uppercase tracking-wider">当前余额</p>
            <div className="p-2 rounded-lg bg-[#3366FF]/15"><Coins className="w-5 h-5 text-[#3366FF]" /></div>
          </div>
          <p className="font-space text-[32px] font-bold text-white">{balance.toFixed(2)}</p>
          <p className="text-[12px] text-[var(--slate-500)] mt-1">1 元 = 10 积分</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-[var(--slate-400)] uppercase tracking-wider">累计充值</p>
            <div className="p-2 rounded-lg bg-[#10B981]/15"><TrendingUp className="w-5 h-5 text-[#10B981]" /></div>
          </div>
          <p className="font-space text-[32px] font-bold text-[#10B981]">+{totalRecharged.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-[var(--slate-400)] uppercase tracking-wider">累计消耗</p>
            <div className="p-2 rounded-lg bg-[#F59E0B]/15"><TrendingDown className="w-5 h-5 text-[#F59E0B]" /></div>
          </div>
          <p className="font-space text-[32px] font-bold text-[#F59E0B]">-{totalConsumed.toFixed(2)}</p>
          <p className="text-[12px] text-[var(--slate-500)] mt-1">今日: {todayConsume.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* ── Transactions ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="font-space text-[15px] font-semibold text-white">积分明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">类型</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">金额</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">余额</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">说明</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">操作人</th>
                <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-[13px] text-[var(--slate-500)]">暂无记录</td></tr>
              )}
              {transactions.map((tx) => {
                const Icon = tx.cfg.icon;
                return (
                  <tr key={tx.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tx.cfg.color}15` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: tx.cfg.color }} />
                        </div>
                        <span className="text-[12px] text-[var(--dark-text)]">{tx.cfg.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-[13px] font-medium font-jetbrains" style={{ color: tx.amount > 0 ? '#10B981' : '#F59E0B' }}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains">{tx.balanceAfter.toFixed(2)}</td>
                    <td className="py-3 px-5 text-[12px] text-[var(--dark-text)]">{tx.description}</td>
                    <td className="py-3 px-5 text-[12px] text-[var(--slate-400)]">{tx.operator}</td>
                    <td className="py-3 px-5 text-[11px] text-[var(--slate-500)] font-jetbrains text-right whitespace-nowrap">{tx.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
