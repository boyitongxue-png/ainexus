import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ChevronDown, ChevronUp, Shield, ShieldAlert, ShieldCheck, FileText } from 'lucide-react';
import { adminLogEntries } from '@/lib/adminMockData';
import { statusBadgeConfig } from '@/lib/adminMockData';

const moduleFilters = [
  { value: 'all', label: '全部模块' },
  { value: '积分调整', label: '积分调整' },
  { value: '充值审核', label: '充值审核' },
  { value: '模型配置', label: '模型配置' },
  { value: '客户管理', label: '客户管理' },
  { value: '系统设置', label: '系统设置' },
  { value: '价格规则', label: '价格规则' },
  { value: '登录/登出', label: '登录/登出' },
  { value: '工作区管理', label: '工作区管理' },
];

const actionTypeFilters = [
  { value: 'all', label: '全部操作' },
  { value: 'credit_adjust', label: '积分调整' },
  { value: 'recharge_approve', label: '充值通过' },
  { value: 'recharge_reject', label: '充值拒绝' },
  { value: 'model_update', label: '模型更新' },
  { value: 'customer_suspend', label: '客户停用' },
  { value: 'setting_update', label: '设置更新' },
  { value: 'login', label: '登录' },
];

const sensitivityFilters = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '普通' },
  { value: 'sensitive', label: '敏感' },
  { value: 'highrisk', label: '高危' },
];

export default function AdminLogs() {
  const [logs] = useState(adminLogEntries);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [sensitivityFilter, setSensitivityFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch = !search || l.adminName.toLowerCase().includes(search.toLowerCase()) || l.targetObject.toLowerCase().includes(search.toLowerCase());
      const matchModule = moduleFilter === 'all' || l.module === moduleFilter;
      const matchAction = actionTypeFilter === 'all' || l.actionType === actionTypeFilter;
      const matchSensitivity = sensitivityFilter === 'all' || l.sensitivity === sensitivityFilter;
      return matchSearch && matchModule && matchAction && matchSensitivity;
    });
  }, [logs, search, moduleFilter, actionTypeFilter, sensitivityFilter]);

  const todayOps = logs.filter((l) => new Date(l.time).toDateString() === new Date().toDateString()).length;
  const sensitiveOps = logs.filter((l) => l.sensitivity === 'highrisk' || l.sensitivity === 'sensitive').length;
  const adminCount = new Set(logs.map((l) => l.adminName)).size;

  const stats = [
    { label: '今日操作', value: todayOps || 156, icon: FileText, color: '#3366FF' },
    { label: '敏感操作', value: sensitiveOps, icon: ShieldAlert, color: '#F43F5E' },
    { label: '操作管理员', value: adminCount, icon: ShieldCheck, color: '#A855F7' },
    { label: '异常告警', value: 2, icon: Shield, color: '#FBBF24' },
  ];

  const sensitivityBadge = (sensitivity: string) => {
    const config = statusBadgeConfig[sensitivity] || statusBadgeConfig.normal;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleExport = () => {
    const csv = [
      ['时间', '操作人', '模块', '操作类型', '操作对象', '敏感度', 'IP地址', '变更前', '变更后'].join(','),
      ...filtered.map((l) =>
        [l.time, l.adminName, l.module, l.actionType, l.targetObject, l.sensitivity, l.ipAddress, l.beforeValue, l.afterValue].join(',')
      ),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDiff = (before: string, after: string) => {
    try {
      const beforeObj = JSON.parse(before);
      const afterObj = JSON.parse(after);
      const allKeys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
      return Array.from(allKeys).map((key) => {
        const beforeVal = JSON.stringify(beforeObj[key]);
        const afterVal = JSON.stringify(afterObj[key]);
        if (beforeVal !== afterVal) {
          return (
            <div key={key} className="flex items-start gap-2 text-xs">
              <span className="text-[var(--slate-400)] min-w-[120px]">{key}:</span>
              <span className="text-[#F43F5E] line-through">{beforeVal}</span>
              <span className="text-[#34D399]">{afterVal}</span>
            </div>
          );
        }
        return null;
      }).filter(Boolean);
    } catch {
      return (
        <div className="flex items-start gap-2 text-xs">
          <span className="text-[#F43F5E] line-through">{before}</span>
          <span className="text-[#34D399]">{after}</span>
        </div>
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">管理员日志</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">审计后台所有敏感操作</p>
        </div>
        <button onClick={handleExport} className="h-10 px-4 border border-[var(--dark-border)] text-[var(--slate-300)] text-sm rounded-lg hover:bg-[var(--dark-hover)] transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> 导出
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--slate-400)] uppercase tracking-wider">{s.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="mt-3 font-jetbrains text-2xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-xs text-white focus:outline-none focus:border-[#3366FF]"
        >
          {moduleFilters.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select
          value={actionTypeFilter}
          onChange={(e) => setActionTypeFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-xs text-white focus:outline-none focus:border-[#3366FF]"
        >
          {actionTypeFilters.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1">
          {sensitivityFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setSensitivityFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                sensitivityFilter === f.value ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索操作人、操作对象..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">时间</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作人</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">模块</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作类型</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作对象</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">敏感度</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">IP 地址</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filtered.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--dark-hover)] transition-colors cursor-pointer"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{new Date(log.time).toLocaleString()}</td>
                    <td className="py-4 px-5 text-sm text-white font-medium">{log.adminName}</td>
                    <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{log.module}</td>
                    <td className="py-4 px-5 text-xs text-[var(--slate-300)]">{log.actionType}</td>
                    <td className="py-4 px-5 text-sm text-white">{log.targetObject}</td>
                    <td className="py-4 px-5">{sensitivityBadge(log.sensitivity)}</td>
                    <td className="py-4 px-5 font-jetbrains text-xs text-[var(--slate-400)]">{log.ipAddress}</td>
                    <td className="py-4 px-5">
                      {expandedRow === log.id ? (
                        <ChevronUp className="w-4 h-4 text-[var(--slate-400)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--slate-400)]" />
                      )}
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedRow === log.id && (
                      <motion.tr
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td colSpan={8} className="px-5 pb-4">
                          <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                            <h4 className="text-sm font-medium text-white mb-3">变更对比</h4>
                            <div className="space-y-2">
                              {formatDiff(log.beforeValue, log.afterValue)}
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-[var(--slate-500)]">
                              <span>IP: {log.ipAddress}</span>
                              <span>时间: {new Date(log.time).toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的日志记录</div>
        )}
      </div>
    </motion.div>
  );
}
