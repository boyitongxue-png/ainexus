import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import {
  ScrollText,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  FileJson,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  SlidersHorizontal,
} from 'lucide-react';

// --- Types ---
interface RichCallLog {
  id: string;
  requestId: string;
  timestamp: string;
  apiType: string;
  platformKey: string;
  provider: string;
  model: string;
  status: 'success' | 'failed' | 'timeout';
  duration: number;
  creditsDeducted: number;
  errorCode: string | null;
  requestParams: Record<string, unknown>;
  routedModel: string;
  fallbackUsed: boolean;
  tokensInput: number;
  tokensOutput: number;
  responseStatus: number;
  apiPath: string;
  errorMessage: string | null;
}

// --- Generate 25 rich mock logs ---
function generateLogs(): RichCallLog[] {
  const models = [
    { name: 'GPT-4o', provider: 'OpenAI' },
    { name: 'GPT-4o-mini', provider: 'OpenAI' },
    { name: 'GPT-4', provider: 'OpenAI' },
    { name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { name: 'Claude 3 Opus', provider: 'Anthropic' },
    { name: 'DALL-E 3', provider: 'OpenAI' },
    { name: 'Stable Diffusion 3', provider: 'Stability AI' },
    { name: 'Runway Gen-3', provider: 'Runway' },
    { name: 'Text Embedding 3', provider: 'OpenAI' },
    { name: 'Pika 1.5', provider: 'Pika' },
  ];
  const apiTypes = ['chat.completion', 'image.generation', 'video.generation', 'embedding', 'audio.transcription'];
  const platformKeys = ['生产环境 Key', '测试环境 Key', '图片服务 Key', '开发环境 Key', '视频处理 Key'];
  const statuses: ('success' | 'failed' | 'timeout')[] = ['success', 'success', 'success', 'success', 'failed', 'success', 'timeout', 'success', 'success', 'failed'];

  const logs: RichCallLog[] = [];
  const baseTime = new Date('2024-12-10T14:00:00Z');

  for (let i = 0; i < 25; i++) {
    const modelInfo = models[i % models.length];
    const status = statuses[i % statuses.length];
    const isImage = i % 7 === 2;
    const isVideo = i % 9 === 3;
    const apiType = isImage ? 'image.generation' : isVideo ? 'video.generation' : apiTypes[i % 5];
    const duration = status === 'timeout' ? 30000 + Math.floor(Math.random() * 10000) : Math.floor(Math.random() * 5000) + 50;
    const credits = apiType === 'image.generation' ? 500 : apiType === 'video.generation' ? 1000 : Math.floor(Math.random() * 200) + 5;

    logs.push({
      id: `log_${i + 1}`,
      requestId: `req_${['a7x9k2m1', 'b3p5q8r2', 'c5m8n1p3', 'd1p4q7r4', 'e9r6s2t5', 'f2t8u3v6', 'g4v7w1x8', 'h6x9y2z1', 'j1z3a5b7', 'k2b4c6d8', 'l5d7e9f1', 'm8f2g4h6', 'n1h3i5j7', 'p4j6k8l2', 'q7l1m3n5'][i % 15]}`,
      timestamp: new Date(baseTime.getTime() - i * 7 * 60000 - Math.random() * 60000).toISOString(),
      apiType,
      platformKey: platformKeys[i % platformKeys.length],
      provider: modelInfo.provider,
      model: modelInfo.name,
      status,
      duration,
      creditsDeducted: status === 'failed' ? 0 : credits,
      errorCode: status === 'success' ? null : status === 'timeout' ? 'TIMEOUT' : ['RATE_LIMIT', 'INVALID_API_KEY', 'INSUFFICIENT_CREDITS', 'MODEL_UNAVAILABLE'][i % 4],
      requestParams: {
        model: modelInfo.name.toLowerCase().replace(/\s/g, '-'),
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
        temperature: 0.7,
        max_tokens: 2048,
      },
      routedModel: modelInfo.name,
      fallbackUsed: i % 11 === 5,
      tokensInput: Math.floor(Math.random() * 2000) + 10,
      tokensOutput: Math.floor(Math.random() * 3000) + 20,
      responseStatus: status === 'success' ? 200 : status === 'timeout' ? 504 : [429, 401, 402, 503][i % 4],
      apiPath: apiType === 'image.generation' ? '/v1/images/generations' : apiType === 'video.generation' ? '/v1/video/generations' : apiType === 'embedding' ? '/v1/embeddings' : '/v1/chat/completions',
      errorMessage: status === 'success' ? null : status === 'timeout' ? 'Request timeout after 30 seconds' : 'Error occurred during model inference',
    });
  }
  return logs;
}

const allLogs = generateLogs();

const statusConfig = {
  success: { label: '成功', className: 'bg-[#10B981]/15 text-[#10B981]', icon: CheckCircle2, rowBg: '' },
  failed: { label: '失败', className: 'bg-[#EF4444]/15 text-[#EF4444]', icon: XCircle, rowBg: 'bg-[#EF4444]/[0.03]' },
  timeout: { label: '超时', className: 'bg-[#F59E0B]/15 text-[#F59E0B]', icon: AlertTriangle, rowBg: 'bg-[#F59E0B]/[0.03]' },
};

const timeRangeOptions = [
  { key: 'today', label: '今天' },
  { key: '7days', label: '近7天' },
  { key: '30days', label: '近30天' },
  { key: 'custom', label: '自定义' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function StatCard({
  title,
  value,
  change,
  changeLabel,
  accentColor,
}: {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  accentColor: string;
}) {
  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const changeColor = change > 0 ? 'text-[#10B981]' : change < 0 ? 'text-[#EF4444]' : 'text-[var(--slate-500)]';
  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 hover:border-[#3366FF]/30 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-caption text-[var(--slate-400)] uppercase">{title}</span>
      </div>
      <p className="text-mono-data text-white">{value}</p>
      <div className={`flex items-center gap-1 mt-2 ${changeColor}`}>
        <ChangeIcon className="w-3.5 h-3.5" />
        <span className="text-body-sm">{change > 0 ? '+' : ''}{change}{changeLabel}</span>
      </div>
    </div>
  );
}

export default function Logs() {

  const { data: logData } = trpc.log.list.useQuery({ limit: 100 });
  const logs = useMemo(() => {
    if (!logData) return [];
    return logData.items.map((l: any) => ({
      id: String(l.id), requestId: l.requestId || `req_${l.id}`,
      timestamp: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
      apiType: l.type || 'chat', platformKey: l.userId ? `key_${l.userId}` : 'unknown',
      provider: l.modelId ? 'OpenAI' : 'unknown', model: l.modelId ? `model_${l.modelId}` : 'unknown',
      status: (l.status === 'error' ? 'failed' : l.status === 'success' ? 'success' : 'timeout'),
      duration: l.duration || 0, creditsDeducted: 0, errorCode: l.errorCode,
      requestParams: {}, routedModel: l.modelId ? `model_${l.modelId}` : 'unknown', fallbackUsed: false,
      tokensInput: l.inputTokens || 0, tokensOutput: l.outputTokens || 0,
      responseStatus: l.status === 'success' ? 200 : l.status === 'error' ? 500 : 504,
      apiPath: '/v1/chat/completions', errorMessage: l.errorMessage,
    }));
  }, [logData]);

  const [timeRange, setTimeRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [reqTypeFilter, setReqTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyFilter, setKeyFilter] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<RichCallLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reqTypes = ['all', ...Array.from(new Set(allLogs.map((l) => l.apiType)))];
  const providers = ['all', ...Array.from(new Set(allLogs.map((l) => l.provider)))];
  const models = ['all', ...Array.from(new Set(allLogs.map((l) => l.model)))];
  const platformKeyOptions = ['all', ...Array.from(new Set(allLogs.map((l) => l.platformKey)))];

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      if (reqTypeFilter !== 'all' && log.apiType !== reqTypeFilter) return false;
      if (providerFilter !== 'all' && log.provider !== providerFilter) return false;
      if (modelFilter !== 'all' && log.model !== modelFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (keyFilter !== 'all' && log.platformKey !== keyFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.requestId.toLowerCase().includes(q) ||
          log.model.toLowerCase().includes(q) ||
          log.provider.toLowerCase().includes(q) ||
          log.apiType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reqTypeFilter, providerFilter, modelFilter, statusFilter, keyFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => {
    const todayLogs = filteredLogs;
    const successCount = todayLogs.filter((l) => l.status === 'success').length;
    const totalCount = todayLogs.length;
    const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0';
    const avgDuration = totalCount > 0 ? Math.floor(todayLogs.reduce((s, l) => s + l.duration, 0) / totalCount) : 0;
    const errorCount = todayLogs.filter((l) => l.status === 'failed').length;
    return { totalCount, successRate, avgDuration, errorCount };
  }, [filteredLogs]);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Request ID', 'Time', 'API Type', 'Platform Key', 'Provider', 'Model', 'Status', 'Duration(ms)', 'Credits', 'Error Code'];
    const rows = filteredLogs.map((l) => [
      l.requestId,
      new Date(l.timestamp).toLocaleString(),
      l.apiType,
      l.platformKey,
      l.provider,
      l.model,
      l.status,
      String(l.duration),
      String(l.creditsDeducted),
      l.errorCode || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  const resetFilters = () => {
    setSearchQuery('');
    setReqTypeFilter('all');
    setProviderFilter('all');
    setModelFilter('all');
    setStatusFilter('all');
    setKeyFilter('all');
    setPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-space text-h2 text-white">调用日志</h1>
          <p className="mt-1 text-body text-[var(--slate-400)]">
            查看所有 API 调用记录，支持多维度筛选和问题排查。
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--dark-border)] text-[var(--slate-300)] text-sm rounded-lg hover:bg-[var(--dark-hover)] hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          导出 CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="今日调用" value={String(stats.totalCount)} change={8.5} changeLabel="%" accentColor="#3366FF" />
        <StatCard title="成功率" value={`${stats.successRate}%`} change={0.3} changeLabel="%" accentColor="#10B981" />
        <StatCard title="平均耗时" value={`${stats.avgDuration}ms`} change={-12} changeLabel="ms" accentColor="#22D3EE" />
        <StatCard title="错误调用" value={String(stats.errorCount)} change={-23} changeLabel="" accentColor="#EF4444" />
      </div>

      {/* Filters */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 space-y-4">
        {/* Primary filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range */}
          <div className="flex items-center bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)] overflow-hidden">
            {timeRangeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTimeRange(opt.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeRange === opt.key
                    ? 'bg-[#3366FF] text-white'
                    : 'text-[var(--slate-400)] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={reqTypeFilter}
            onChange={(e) => setReqTypeFilter(e.target.value)}
            className="h-9 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
          >
            <option value="all">全部请求类型</option>
            {reqTypes.filter((t) => t !== 'all').map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="h-9 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
          >
            <option value="all">全部供应商</option>
            {providers.filter((p) => p !== 'all').map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="h-9 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
          >
            <option value="all">全部模型</option>
            {models.filter((m) => m !== 'all').map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
          >
            <option value="all">全部状态</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
            <option value="timeout">超时</option>
          </select>

          <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--slate-500)]" />
            <input
              type="text"
              placeholder="搜索请求ID或模型..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] transition-colors"
            />
          </div>
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--slate-400)] hover:text-[#3366FF] transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          高级筛选
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--dark-border)]">
                <select
                  value={keyFilter}
                  onChange={(e) => setKeyFilter(e.target.value)}
                  className="h-9 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
                >
                  <option value="all">全部 Platform Key</option>
                  {platformKeyOptions.filter((k) => k !== 'all').map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  重置筛选
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">请求时间</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">请求ID</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">API 类型</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">Platform Key</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">供应商</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">模型</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">状态</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">耗时</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">积分</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">错误码</th>
                <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {paginatedLogs.map((log, i) => {
                const StatusIcon = statusConfig[log.status].icon;
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedLog(log)}
                    className={`hover:bg-[var(--dark-hover)] transition-colors cursor-pointer ${statusConfig[log.status].rowBg}`}
                  >
                    <td className="py-3 px-4 text-caption text-[var(--slate-400)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-body-sm text-[#7A9FFF] font-jetbrains whitespace-nowrap">{log.requestId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(log.requestId, log.id);
                          }}
                          className="text-[var(--slate-500)] hover:text-[#3366FF] transition-colors"
                        >
                          {copiedId === log.id ? (
                            <Check className="w-3 h-3 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--slate-300)] font-jetbrains whitespace-nowrap">{log.apiType}</td>
                    <td className="py-3 px-4 text-body-sm text-[var(--slate-400)] whitespace-nowrap">{log.platformKey}</td>
                    <td className="py-3 px-4 text-body-sm text-[var(--slate-400)] whitespace-nowrap">{log.provider}</td>
                    <td className="py-3 px-4 text-body-sm text-white whitespace-nowrap">{log.model}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusConfig[log.status].className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[log.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-body-sm text-[#22D3EE] whitespace-nowrap">
                      {log.duration >= 1000 ? `${(log.duration / 1000).toFixed(1)}s` : `${log.duration}ms`}
                    </td>
                    <td className="py-3 px-4 text-body-sm text-[#7A9FFF] font-jetbrains whitespace-nowrap">{log.creditsDeducted}</td>
                    <td className="py-3 px-4">
                      {log.errorCode ? (
                        <span className="text-xs text-[#EF4444] font-jetbrains whitespace-nowrap">{log.errorCode}</span>
                      ) : (
                        <span className="text-xs text-[var(--slate-600)]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-xs text-[#3366FF] hover:underline whitespace-nowrap"
                      >
                        详情
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginatedLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="w-16 h-16 text-[var(--slate-600)] mb-4" />
            <h3 className="text-h4 text-[var(--slate-400)]">未找到日志</h3>
            <p className="mt-2 text-body-sm text-[var(--slate-500)]">尝试调整筛选条件</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--slate-500)]">
            显示 {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredLogs.length)} 条，共 {filteredLogs.length} 条
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (safePage <= 3) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = safePage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    safePage === pageNum
                      ? 'bg-[#3366FF] text-white'
                      : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--slate-500)]">每页</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[600px] bg-[var(--dark-card)] border-l border-[var(--dark-border)] z-modal overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--dark-card)] border-b border-[var(--dark-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
                    <FileJson className="w-5 h-5 text-[#3366FF]" />
                  </div>
                  <div>
                    <h2 className="text-h4 text-white font-semibold">{selectedLog.requestId}</h2>
                    <p className="text-xs text-[var(--slate-400)]">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[selectedLog.status].className}`}>
                    {statusConfig[selectedLog.status].label}
                  </span>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-[var(--dark-bg)] rounded-xl p-5 border border-[var(--dark-border)]">
                  <h3 className="text-sm font-semibold text-white mb-4">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--slate-500)] mb-1">API 路径</p>
                      <p className="text-sm text-[#7A9FFF] font-jetbrains">{selectedLog.apiPath}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--slate-500)] mb-1">响应状态码</p>
                      <p className="text-sm text-white font-medium">{selectedLog.responseStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--slate-500)] mb-1">模型</p>
                      <p className="text-sm text-white font-medium">{selectedLog.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--slate-500)] mb-1">供应商</p>
                      <p className="text-sm text-white font-medium">{selectedLog.provider}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--slate-500)] mb-1">Platform Key</p>
                      <p className="text-sm text-white">{selectedLog.platformKey}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--slate-500)] mb-1">耗时</p>
                      <p className="text-sm text-[#22D3EE] font-medium">
                        {selectedLog.duration >= 1000 ? `${(selectedLog.duration / 1000).toFixed(1)}s` : `${selectedLog.duration}ms`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Routing Info */}
                <div className="bg-[var(--dark-bg)] rounded-xl p-5 border border-[var(--dark-border)]">
                  <h3 className="text-sm font-semibold text-white mb-4">路由信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">最终路由模型</span>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#3366FF]" />
                        <span className="text-sm text-white font-medium">{selectedLog.routedModel}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">是否触发降级</span>
                      <span className={`text-sm font-medium ${selectedLog.fallbackUsed ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                        {selectedLog.fallbackUsed ? '是' : '否'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">供应商</span>
                      <span className="text-sm text-white">{selectedLog.provider}</span>
                    </div>
                  </div>
                </div>

                {/* Fee Details */}
                <div className="bg-[var(--dark-bg)] rounded-xl p-5 border border-[var(--dark-border)]">
                  <h3 className="text-sm font-semibold text-white mb-4">费用详情</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">输入 Tokens</span>
                      <span className="text-sm text-white font-jetbrains">{selectedLog.tokensInput.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">输出 Tokens</span>
                      <span className="text-sm text-white font-jetbrains">{selectedLog.tokensOutput.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">总 Tokens</span>
                      <span className="text-sm text-white font-jetbrains">
                        {(selectedLog.tokensInput + selectedLog.tokensOutput).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-[var(--dark-border)] pt-3 flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">扣除积分</span>
                      <span className="text-mono-data text-[#7A9FFF]">{selectedLog.creditsDeducted}</span>
                    </div>
                  </div>
                </div>

                {/* Request Parameters */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">请求参数</h3>
                  <div className="bg-[#0B1120] rounded-xl p-4 border border-[var(--dark-border)] overflow-x-auto">
                    <pre className="text-xs text-[#A8C3FF] font-jetbrains leading-relaxed">
                      {JSON.stringify(selectedLog.requestParams, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Error Details */}
                {selectedLog.status !== 'success' && selectedLog.errorMessage && (
                  <div className="bg-[#EF4444]/5 rounded-xl p-5 border border-[#EF4444]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-[#EF4444]" />
                      <h3 className="text-sm font-semibold text-[#EF4444]">错误详情</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--slate-400)]">错误码</span>
                        <span className="text-sm text-[#EF4444] font-jetbrains font-medium">{selectedLog.errorCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--slate-400)]">HTTP 状态</span>
                        <span className="text-sm text-[#EF4444] font-medium">{selectedLog.responseStatus}</span>
                      </div>
                      <div className="mt-2 p-3 bg-[#0B1120] rounded-lg">
                        <p className="text-xs text-[#EF4444]">{selectedLog.errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
