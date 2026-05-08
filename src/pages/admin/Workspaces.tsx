import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Settings, Coins, Snowflake, Lock, LockOpen, Briefcase, X, Zap } from 'lucide-react';
import { adminWorkspaces } from '@/lib/adminMockData';
import { statusBadgeConfig } from '@/lib/adminMockData';

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '活跃' },
  { value: 'idle', label: '空闲' },
  { value: 'inactive', label: '停用' },
];

export default function AdminWorkspaces() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState<typeof adminWorkspaces[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return adminWorkspaces.filter((w) => {
      const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase()) || w.customerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const stats = [
    { label: '总工作区', value: adminWorkspaces.length, icon: Briefcase, color: '#3366FF' },
    { label: '活跃工作区', value: adminWorkspaces.filter((w) => w.status === 'active').length, icon: Zap, color: '#34D399' },
    { label: '今日总调用', value: adminWorkspaces.reduce((sum, w) => sum + w.todayCalls, 0).toLocaleString(), icon: Zap, color: '#22D3EE' },
    { label: '空闲工作区', value: adminWorkspaces.filter((w) => w.status === 'idle').length, icon: Snowflake, color: '#FBBF24' },
  ];

  const openDrawer = (workspace: typeof adminWorkspaces[0]) => {
    setSelectedWorkspace(workspace);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedWorkspace(null), 200);
  };

  const statusBadge = (status: string) => {
    const config = statusBadgeConfig[status] || statusBadgeConfig.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">工作区管理</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">管理所有客户的工作空间</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索工作区名称、ID、客户..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-72"
          />
        </div>
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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                statusFilter === f.value ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">工作区名称 / ID</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">所属客户</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">当前套餐</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">成员</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">可用供应商</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">平台 Key</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">当前积分</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">今日调用</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">最后调用</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#3366FF]/15 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-[#3366FF]" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{w.name}</p>
                        <p className="text-xs text-[var(--slate-500)]">{w.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-white">{w.customerName}</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)] capitalize">{w.plan}</td>
                  <td className="py-4 px-5 text-sm text-white">{w.memberCount} 人</td>
                  <td className="py-4 px-5 text-sm text-[var(--slate-300)]">{w.availableProviders.join(', ')}</td>
                  <td className="py-4 px-5 text-sm text-white">{w.platformKeyCount} 个</td>
                  <td className={`py-4 px-5 font-jetbrains text-sm ${w.currentCredits < 5000 ? 'text-[#F43F5E]' : 'text-white'}`}>
                    {w.currentCredits.toLocaleString()}
                  </td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{w.todayCalls.toLocaleString()}</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{new Date(w.lastCallTime).toLocaleString()}</td>
                  <td className="py-4 px-5">{statusBadge(w.status)}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDrawer(w)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors" title="查看详情">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title={w.status === 'active' ? '冻结' : '解冻'}>
                        {w.status === 'active' ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的工作区</div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedWorkspace && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100]" onClick={closeDrawer} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[var(--dark-card)] border-l border-[var(--dark-border)] z-[110] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-[#3366FF]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selectedWorkspace.name}</h2>
                      <p className="text-xs text-[var(--slate-500)]">{selectedWorkspace.id}</p>
                    </div>
                  </div>
                  <button onClick={closeDrawer} className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">基本信息</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[var(--slate-500)]">所属客户</span><p className="text-white">{selectedWorkspace.customerName}</p></div>
                      <div><span className="text-[var(--slate-500)]">套餐</span><p className="text-white capitalize">{selectedWorkspace.plan}</p></div>
                      <div><span className="text-[var(--slate-500)]">成员数</span><p className="text-white">{selectedWorkspace.memberCount} 人</p></div>
                      <div><span className="text-[var(--slate-500)]">平台 API Key</span><p className="text-white">{selectedWorkspace.platformKeyCount} 个</p></div>
                      <div><span className="text-[var(--slate-500)]">创建时间</span><p className="text-white">{selectedWorkspace.createdAt}</p></div>
                      <div><span className="text-[var(--slate-500)]">最后调用</span><p className="text-white">{new Date(selectedWorkspace.lastCallTime).toLocaleString()}</p></div>
                    </div>
                  </div>

                  <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">调用统计</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                        <p className="text-xs text-[var(--slate-400)]">今日调用</p>
                        <p className="font-jetbrains text-xl text-white mt-1">{selectedWorkspace.todayCalls.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                        <p className="text-xs text-[var(--slate-400)]">当前积分</p>
                        <p className={`font-jetbrains text-xl mt-1 ${selectedWorkspace.currentCredits < 5000 ? 'text-[#F43F5E]' : 'text-white'}`}>
                          {selectedWorkspace.currentCredits.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">可用供应商</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorkspace.availableProviders.map((p) => (
                        <span key={p} className="px-3 py-1 rounded-full bg-[var(--dark-card)] border border-[var(--dark-border)] text-xs text-white">{p}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">已启用模型</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorkspace.modelsEnabled.map((m) => (
                        <span key={m} className="px-3 py-1 rounded-full bg-[#3366FF]/10 border border-[#3366FF]/20 text-xs text-[#3366FF]">{m}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 h-10 rounded-lg border border-[#3366FF] text-[#3366FF] text-sm font-medium hover:bg-[#3366FF]/10 transition-colors flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" /> 编辑配置
                    </button>
                    <button className="flex-1 h-10 rounded-lg bg-[#3366FF] text-white text-sm font-medium hover:bg-[#2244CC] transition-colors flex items-center justify-center gap-2">
                      <Coins className="w-4 h-4" /> 调整积分
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
