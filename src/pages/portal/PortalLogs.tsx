import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { callLogs } from '@/lib/mockData';

function getPortalKey() {
  return localStorage.getItem('ainexus_portal_key') || '';
}

export default function PortalLogs() {
  const portalKey = useMemo(() => getPortalKey(), []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'credits'>('time');

  // Filter logs for this key
  const keyLogs = useMemo(() => {
    return callLogs.filter((log) => {
      const matchesKey = portalKey
        ? 'mock'?.includes(portalKey.slice(-6))
        : true;
      const matchesSearch = search
        ? log.model?.toLowerCase().includes(search.toLowerCase()) ||
          log.requestId?.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesStatus = statusFilter === 'all' ? true : log.status === statusFilter;
      return matchesKey && matchesSearch && matchesStatus;
    });
  }, [portalKey, search, statusFilter]);

  // Sort
  const sortedLogs = useMemo(() => {
    return [...keyLogs].sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return (b.creditsUsed || 0) - (a.creditsUsed || 0);
    });
  }, [keyLogs, sortBy]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(sortedLogs.length / pageSize) || 1;
  const paginatedLogs = sortedLogs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space text-h3 text-white font-semibold">调用记录</h1>
          <p className="text-body-sm text-[var(--slate-500)] mt-1">
            查看当前 API Key 的所有调用明细
          </p>
        </div>
        <button
          onClick={() => alert('导出功能：下载 CSV 格式的调用记录')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]"
        >
          <Download className="w-4 h-4" />
          导出 CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索模型或请求 ID..."
            className="w-full sm:w-[280px] h-10 pl-10 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'success', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#3366FF]/15 text-[#3366FF]'
                  : 'bg-[var(--dark-card)] text-[var(--slate-500)] hover:text-white border border-[var(--dark-border)]'
              }`}
            >
              {s === 'all' ? '全部' : s === 'success' ? '成功' : '失败'}
            </button>
          ))}
          <button
            onClick={() => setSortBy(sortBy === 'time' ? 'credits' : 'time')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-[var(--slate-500)] hover:text-white bg-[var(--dark-card)] border border-[var(--dark-border)] transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortBy === 'time' ? '按时间' : '按消耗'}
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="flex items-center gap-6 text-[12px]">
        <span className="text-[var(--slate-500)]">
          总调用: <span className="text-white font-jetbrains">{keyLogs.length}</span>
        </span>
        <span className="text-[var(--slate-500)]">
          成功: <span className="text-[#10B981] font-jetbrains">{keyLogs.filter((l) => l.status === 'success').length}</span>
        </span>
        <span className="text-[var(--slate-500)]">
          失败: <span className="text-[#EF4444] font-jetbrains">{keyLogs.filter((l) => l.status === 'error').length}</span>
        </span>
        <span className="text-[var(--slate-500)]">
          总消耗: <span className="text-[#A855F7] font-jetbrains">{keyLogs.reduce((s, l) => s + (l.creditsUsed || 0), 0).toFixed(2)}</span> 积分
        </span>
      </div>

      {/* Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--dark-border)] bg-[var(--dark-bg)]">
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium">状态</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium">请求 ID</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium">模型</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium">类型</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium">响应时间</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium text-right">消耗积分</th>
                <th className="py-3 px-4 text-[11px] text-[var(--slate-500)] uppercase font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--dark-border)] hover:bg-[var(--dark-hover)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#10B981]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          成功
                        </span>
                      ) : log.status === 'error' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#EF4444]">
                          <XCircle className="w-3.5 h-3.5" />
                          失败
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#F59E0B]">
                          <Clock className="w-3.5 h-3.5" />
                          超时
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[12px] font-jetbrains text-[var(--dark-text)]">{log.requestId}</td>
                    <td className="py-3 px-4 text-[12px] text-white">{log.model}</td>
                    <td className="py-3 px-4 text-[12px] text-[var(--slate-400)]">{log.type}</td>
                    <td className="py-3 px-4 text-[12px] text-[var(--slate-400)]">{log.duration}ms</td>
                    <td className="py-3 px-4 text-[12px] font-jetbrains text-[#A855F7] text-right">{log.creditsUsed || 0}</td>
                    <td className="py-3 px-4 text-[12px] text-[var(--slate-500)]">{log.timestamp}</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Filter className="w-8 h-8 text-[var(--slate-600)] mx-auto mb-2" />
                    <p className="text-body-sm text-[var(--slate-500)]">暂无调用记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--dark-border)]">
            <span className="text-[12px] text-[var(--slate-500)]">
              第 {page} / {totalPages} 页
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-[12px] text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors disabled:opacity-40"
              >
                上一页
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-[12px] text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
