import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Snowflake, Lock, Users, UserPlus, Building2, X, LockOpen, Key, Activity, Coins, CreditCard, Globe, Cpu } from 'lucide-react';
import { adminCustomers, adminWorkspaces } from '@/lib/adminMockData';
import { platformKeys, callLogs } from '@/lib/mockData';
import { statusBadgeConfig } from '@/lib/adminMockData';

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '活跃' },
  { value: 'inactive', label: '停用' },
  { value: 'suspended', label: '暂停' },
];

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof adminCustomers[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'workspaces' | 'developers' | 'usage'>('overview');

  const filtered = useMemo(() => {
    return adminCustomers.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  // Get workspaces for a customer
  const getCustomerWorkspaces = (customerId: string) => {
    return adminWorkspaces.filter(w => w.customerId === customerId);
  };

  // Get API keys for a customer (mock)
  const getCustomerKeys = (customerId: string) => {
    return platformKeys.slice(0, Math.floor(Math.random() * 3) + 1).map((k, i) => ({
      id: `pk_${customerId}_${i}`,
      name: `${k.name} - Key ${i + 1}`,
      keyPreview: k.keyPreview,
      status: k.status,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    }));
  };

  // Get usage stats for a customer
  const getCustomerUsage = (_customerId: string) => {
    const logs = callLogs.slice(0, Math.floor(Math.random() * 8) + 3);  // Mock filter
    const totalCalls = logs.length;
    const totalCredits = logs.reduce((s, l) => s + (l.creditsUsed || 0), 0);
    const successRate = totalCalls > 0 ? Math.round((logs.filter(l => l.status === 'success').length / totalCalls) * 100) : 100;
    return { totalCalls, totalCredits, successRate };
  };

  const stats = [
    { label: '总客户', value: adminCustomers.length, icon: Users, color: '#3366FF' },
    { label: '本月新增', value: 3, icon: UserPlus, color: '#34D399' },
    { label: '活跃客户', value: adminCustomers.filter((c) => c.status === 'active').length, icon: Building2, color: '#22D3EE' },
    { label: '已停用', value: adminCustomers.filter((c) => c.status === 'inactive' || c.status === 'suspended').length, icon: Snowflake, color: '#94A3B8' },
  ];

  const openDrawer = (customer: typeof adminCustomers[0]) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
    setDrawerTab('overview');
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedCustomer(null), 200);
  };

  const toggleCustomerStatus = (customerId: string) => {
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(prev => prev ? { ...prev, status: prev.status === 'active' ? 'suspended' : 'active' } : null);
    }
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
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">客户管理</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">管理所有客户信息、工作区、开发者数据和消耗情况</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索客户名称、邮箱、ID..."
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
      <div className="flex flex-wrap items-center gap-3">
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
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">客户名称 / ID</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">联系人 / 联系方式</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">状态</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">累计充值</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">当前积分</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">工作区</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">创建时间</th>
                <th className="py-3 px-5 text-xs text-[var(--slate-400)] uppercase tracking-wider font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3366FF] to-[#A855F7] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{c.name}</p>
                        <p className="text-xs text-[var(--slate-500)]">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <p className="text-sm text-white">{c.contactPerson}</p>
                    <p className="text-xs text-[var(--slate-500)]">{c.email}</p>
                  </td>
                  <td className="py-4 px-5">{statusBadge(c.status)}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">¥{c.totalRecharge.toLocaleString()}</td>
                  <td className="py-4 px-5 font-jetbrains text-sm text-white">{c.currentCredits.toLocaleString()}</td>
                  <td className="py-4 px-5 text-sm text-white">{c.workspaceCount} 个</td>
                  <td className="py-4 px-5 text-xs text-[var(--slate-400)]">{c.createdAt}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDrawer(c)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors" title="查看详情">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleCustomerStatus(c.id)} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title={c.status === 'active' ? '冻结' : '解冻'}>
                        {c.status === 'active' ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--slate-500)]">未找到匹配的客户</div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100]"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[var(--dark-card)] border-l border-[var(--dark-border)] z-[110] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3366FF] to-[#A855F7] flex items-center justify-center text-white text-lg font-bold">
                      {selectedCustomer.name[0]}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selectedCustomer.name}</h2>
                      {statusBadge(selectedCustomer.status)}
                    </div>
                  </div>
                  <button onClick={closeDrawer} className="p-2 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-1 mb-6">
                  {[
                    { key: 'overview' as const, label: '概览', icon: Activity },
                    { key: 'workspaces' as const, label: '工作区', icon: Building2 },
                    { key: 'developers' as const, label: '开发者', icon: Key },
                    { key: 'usage' as const, label: '消耗', icon: Coins },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setDrawerTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md transition-colors ${
                        drawerTab === tab.key ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {drawerTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">基本信息</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-[var(--slate-500)]">客户ID</span><p className="text-white">{selectedCustomer.id}</p></div>
                        <div><span className="text-[var(--slate-500)]">联系人</span><p className="text-white">{selectedCustomer.contactPerson}</p></div>
                        <div><span className="text-[var(--slate-500)]">邮箱</span><p className="text-white">{selectedCustomer.email}</p></div>
                        <div><span className="text-[var(--slate-500)]">电话</span><p className="text-white">{selectedCustomer.phone}</p></div>
                        <div><span className="text-[var(--slate-500)]">注册时间</span><p className="text-white">{selectedCustomer.createdAt}</p></div>
                        <div><span className="text-[var(--slate-500)]">最后登录</span><p className="text-white">{new Date(selectedCustomer.lastLoginAt).toLocaleString()}</p></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-white mb-3">统计信息</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                          <p className="text-xs text-[var(--slate-400)]">工作区</p>
                          <p className="font-jetbrains text-xl text-white mt-1">{selectedCustomer.workspaceCount}</p>
                        </div>
                        <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                          <p className="text-xs text-[var(--slate-400)]">当前积分</p>
                          <p className="font-jetbrains text-xl text-white mt-1">{selectedCustomer.currentCredits.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-[var(--dark-card)] rounded-lg">
                          <p className="text-xs text-[var(--slate-400)]">累计充值</p>
                          <p className="font-jetbrains text-xl text-[#34D399] mt-1">¥{selectedCustomer.totalRecharge.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button onClick={() => alert('编辑客户信息：可修改客户名称、联系人等信息')} className="flex-1 h-10 rounded-lg border border-[#3366FF] text-[#3366FF] text-sm font-medium hover:bg-[#3366FF]/10 transition-colors">
                        编辑信息
                      </button>
                      <button onClick={() => selectedCustomer && toggleCustomerStatus(selectedCustomer.id)} className={`flex-1 h-10 rounded-lg text-sm font-medium text-white transition-colors ${
                        selectedCustomer.status === 'active' ? 'bg-[#F43F5E] hover:bg-[#DC2626]' : 'bg-[#10B981] hover:bg-[#059669]'
                      }`}>
                        {selectedCustomer.status === 'active' ? '停用账户' : '启用账户'}
                      </button>
                    </div>
                  </div>
                )}

                {drawerTab === 'workspaces' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#3366FF]" />
                      工作区列表 ({getCustomerWorkspaces(selectedCustomer.id).length} 个)
                    </h3>
                    {getCustomerWorkspaces(selectedCustomer.id).map((w) => (
                      <div key={w.id} className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4 hover:border-[#3366FF]/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#3366FF]" />
                            <span className="text-sm font-medium text-white">{w.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' : w.status === 'inactive' ? 'bg-[#F43F5E]/15 text-[#F43F5E]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'}`}>
                            {w.status === 'active' ? '正常' : w.status === 'inactive' ? '已停用' : '空闲'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                          <div><span className="text-[var(--slate-500)]">ID:</span> <span className="text-[var(--slate-300)]">{w.id}</span></div>
                          <div><span className="text-[var(--slate-500)]">成员:</span> <span className="text-[var(--slate-300)]">{w.memberCount} 人</span></div>
                          <div><span className="text-[var(--slate-500)]">积分:</span> <span className="text-white font-jetbrains">{w.currentCredits.toLocaleString()}</span></div>
                          <div><span className="text-[var(--slate-500)]">模型:</span> <span className="text-[var(--slate-300)]">{w.modelsEnabled.length} 个</span></div>
                          <div><span className="text-[var(--slate-500)]">最后调用:</span> <span className="text-[var(--slate-300)]">{w.lastCallTime}</span></div>
                        </div>
                      </div>
                    ))}
                    {getCustomerWorkspaces(selectedCustomer.id).length === 0 && (
                      <div className="text-center py-8 text-sm text-[var(--slate-500)]">该客户暂无工作区</div>
                    )}
                  </div>
                )}

                {drawerTab === 'developers' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#A855F7]" />
                      API Key 列表
                    </h3>
                    {getCustomerKeys(selectedCustomer.id).map((k) => (
                      <div key={k.id} className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-[#A855F7]" />
                            <span className="text-sm font-medium text-white">{k.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${k.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#F43F5E]/15 text-[#F43F5E]'}`}>
                            {k.status === 'active' ? '正常' : '已停用'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-[var(--slate-500)]">Key:</span>
                          <code className="text-[var(--slate-300)] font-jetbrains">{k.keyPreview}</code>
                        </div>
                        <div className="flex items-center gap-4 text-xs mt-2 text-[var(--slate-500)]">
                          <span>创建: {k.createdAt}</span>
                          <span>最后使用: {k.lastUsedAt || '从未'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {drawerTab === 'usage' && (
                  <div className="space-y-6">
                    {(() => {
                      const usage = getCustomerUsage(selectedCustomer.id);
                      return (
                        <>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-4 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg">
                              <Activity className="w-5 h-5 text-[#3366FF] mx-auto mb-2" />
                              <p className="text-xs text-[var(--slate-400)]">总调用次数</p>
                              <p className="font-jetbrains text-2xl text-white mt-1">{usage.totalCalls}</p>
                            </div>
                            <div className="text-center p-4 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg">
                              <CreditCard className="w-5 h-5 text-[#A855F7] mx-auto mb-2" />
                              <p className="text-xs text-[var(--slate-400)]">消耗积分</p>
                              <p className="font-jetbrains text-2xl text-white mt-1">{usage.totalCredits.toFixed(2)}</p>
                            </div>
                            <div className="text-center p-4 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg">
                              <Cpu className="w-5 h-5 text-[#10B981] mx-auto mb-2" />
                              <p className="text-xs text-[var(--slate-400)]">成功率</p>
                              <p className="font-jetbrains text-2xl text-[#10B981] mt-1">{usage.successRate}%</p>
                            </div>
                          </div>
                          <div className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-white mb-3">最近调用记录</h3>
                            {callLogs.slice(0, 5).map((log) => (
                              <div key={log.id} className="flex items-center justify-between py-2 border-b border-[var(--dark-border)] last:border-0">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                                  <span className="text-xs text-white">{log.model}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-[var(--slate-400)]">{log.creditsUsed || 0} 积分</span>
                                  <span className="text-[var(--slate-500)]">{log.timestamp}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
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