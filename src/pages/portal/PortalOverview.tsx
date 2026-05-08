import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Coins,
  Zap,
  Brain,
  Clock,
} from 'lucide-react';
import { callLogs, modelCatalog } from '@/lib/mockData';

function getPortalKey() {
  return localStorage.getItem('ainexus_portal_key') || '';
}

function getPortalUser() {
  try {
    const raw = localStorage.getItem('ainexus_portal_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function PortalOverview() {
  const portalKey = useMemo(() => getPortalKey(), []);
  const portalUser = useMemo(() => getPortalUser(), []);

  // Filter logs for this key (mock: filter by key prefix match)
  const keyLogs = useMemo(() => {
    return callLogs.filter((_log) =>
      portalKey ? 'mock'?.includes(portalKey.slice(-6)) : true
    );
  }, [portalKey]);

  const totalCalls = keyLogs.length;
  const successCalls = keyLogs.filter((l) => l.status === 'success').length;
  const successRate = totalCalls > 0 ? Math.round((successCalls / totalCalls) * 100) : 100;
  const totalCredits = keyLogs.reduce((sum, l) => sum + (l.creditsUsed || 0), 0);
  const avgLatency = totalCalls > 0
    ? Math.round(keyLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / totalCalls)
    : 0;

  // Recent calls (last 5)
  const recentCalls = keyLogs.slice(0, 5);

  // Available models based on permissions
  const availableModels = useMemo(() => {
    const perms = portalUser?.permissions || ['chat'];
    return modelCatalog.filter((m) =>
      perms.some((p: string) => {
        if (p === 'chat' && m.type === 'text') return true;
        if (p === 'image' && m.type === 'image') return true;
        if (p === 'video' && m.type === 'video') return true;
        if (p === 'audio' && m.type === 'audio') return true;
        if (p === 'embedding' && m.type === 'embedding') return true;
        return false;
      })
    );
  }, [portalUser]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space text-h3 text-white font-semibold">开发者总览</h1>
        <p className="text-body-sm text-[var(--slate-500)] mt-1">
          Key: <span className="text-[#3366FF] font-jetbrains">{portalKey ? `${portalKey.slice(0, 12)}...${portalKey.slice(-4)}` : '未登录'}</span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: '本月调用次数',
            value: totalCalls,
            unit: '次',
            icon: Activity,
            color: '#3366FF',
            trend: '+12%',
          },
          {
            label: '消耗积分',
            value: totalCredits.toFixed(2),
            unit: '积分',
            icon: Coins,
            color: '#A855F7',
            trend: null,
          },
          {
            label: '成功率',
            value: `${successRate}%`,
            unit: '',
            icon: Zap,
            color: '#10B981',
            trend: successRate >= 95 ? '稳定' : '需关注',
          },
          {
            label: '平均响应',
            value: avgLatency,
            unit: 'ms',
            icon: Clock,
            color: '#F59E0B',
            trend: null,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-4.5 h-4.5" style={{ color: card.color }} />
              </div>
              {card.trend && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  card.trend.includes('+') || card.trend === '稳定'
                    ? 'bg-[#10B981]/15 text-[#10B981]'
                    : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                }`}>
                  {card.trend}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-h3 font-semibold text-white font-jetbrains">{card.value}</span>
              <span className="text-caption text-[var(--slate-500)]">{card.unit}</span>
            </div>
            <p className="text-caption text-[var(--slate-500)] mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent calls */}
        <div className="lg:col-span-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-space text-[16px] font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3366FF]" />
              最近调用记录
            </h2>
            <span className="text-caption text-[var(--slate-500)]">共 {totalCalls} 条</span>
          </div>

          {recentCalls.length > 0 ? (
            <div className="space-y-2">
              {recentCalls.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] hover:border-[#3366FF]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-[#10B981]' :
                      log.status === 'error' ? 'bg-[#EF4444]' :
                      'bg-[#F59E0B]'
                    }`} />
                    <div>
                      <p className="text-[13px] text-white">{log.model}</p>
                      <p className="text-[11px] text-[var(--slate-500)]">{log.requestId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-jetbrains text-white">{log.creditsUsed || 0} 积分</p>
                    <p className="text-[11px] text-[var(--slate-500)]">{log.duration}ms · {log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-[var(--slate-600)] mx-auto mb-2" />
              <p className="text-body-sm text-[var(--slate-500)]">暂无调用记录</p>
              <p className="text-caption text-[var(--slate-600)] mt-1">使用您的 API Key 发起请求后将显示在此处</p>
            </div>
          )}
        </div>

        {/* Available models */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <h2 className="font-space text-[16px] font-semibold text-white flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-[#A855F7]" />
            可用模型
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {availableModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)]"
              >
                <div>
                  <p className="text-[13px] text-white">{model.name}</p>
                  <p className="text-[11px] text-[var(--slate-500)]">{model.provider}</p>
                </div>
                <span className="text-[12px] font-jetbrains text-[#A855F7]">
                  {model.platformPrice || model.costPer1KTokens} 积分
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--dark-border)]">
            <p className="text-[11px] text-[var(--slate-500)]">
              共 {availableModels.length} 个模型可用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}