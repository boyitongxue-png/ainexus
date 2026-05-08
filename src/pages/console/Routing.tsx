import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  Plus,
  ArrowRight,
  GitBranch,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Zap,
  Clock,
  DollarSign,
  Save,
  Search,
} from 'lucide-react';

// --- Types ---
interface RoutingScenario {
  id: string;
  scenarioName: string;
  requestType: string;
  primaryModel: string;
  backupModel: string;
  strategyDescription: string;
  timeoutThreshold: number;
  costPriority: boolean;
  status: 'active' | 'inactive';
  notes: string;
  callCount: number;
}

// --- Mock Data ---
const initialScenarios: RoutingScenario[] = [
  {
    id: 'rs_1',
    scenarioName: '生产文本对话',
    requestType: 'chat.completion',
    primaryModel: 'GPT-4o',
    backupModel: 'Claude 3.5 Sonnet',
    strategyDescription: '质量优先，自动降级',
    timeoutThreshold: 30,
    costPriority: false,
    status: 'active',
    notes: '生产环境主路由策略，确保高质量响应',
    callCount: 8234,
  },
  {
    id: 'rs_2',
    scenarioName: '测试环境',
    requestType: 'chat.completion',
    primaryModel: 'GPT-4o-mini',
    backupModel: 'Claude 3 Haiku',
    strategyDescription: '成本优先，快速响应',
    timeoutThreshold: 15,
    costPriority: true,
    status: 'active',
    notes: '测试环境使用低成本模型',
    callCount: 2156,
  },
  {
    id: 'rs_3',
    scenarioName: '图片生成',
    requestType: 'image.generation',
    primaryModel: 'DALL-E 3',
    backupModel: 'Stable Diffusion 3',
    strategyDescription: '质量优先，排队等待',
    timeoutThreshold: 60,
    costPriority: false,
    status: 'active',
    notes: '图片生成任务路由',
    callCount: 1890,
  },
  {
    id: 'rs_4',
    scenarioName: '视频处理',
    requestType: 'video.generation',
    primaryModel: 'Runway Gen-3',
    backupModel: 'Pika 1.5',
    strategyDescription: '质量优先，自动降级',
    timeoutThreshold: 120,
    costPriority: false,
    status: 'active',
    notes: '视频生成任务路由',
    callCount: 567,
  },
  {
    id: 'rs_5',
    scenarioName: '低成本方案',
    requestType: 'chat.completion',
    primaryModel: 'GPT-3.5 Turbo',
    backupModel: 'GPT-4o-mini',
    strategyDescription: '成本优先，快速响应',
    timeoutThreshold: 20,
    costPriority: true,
    status: 'active',
    notes: '对成本敏感的场景',
    callCount: 3420,
  },
  {
    id: 'rs_6',
    scenarioName: 'Embedding 处理',
    requestType: 'embedding',
    primaryModel: 'Text Embedding 3',
    backupModel: 'Text Embedding 3',
    strategyDescription: '速度优先',
    timeoutThreshold: 10,
    costPriority: true,
    status: 'inactive',
    notes: '文本向量化专用路由',
    callCount: 120,
  },
];

const modelOptions = [
  'GPT-4o',
  'GPT-4o-mini',
  'GPT-4',
  'GPT-3.5 Turbo',
  'Claude 3 Opus',
  'Claude 3.5 Sonnet',
  'Claude 3 Haiku',
  'DALL-E 3',
  'Stable Diffusion 3',
  'Midjourney V6',
  'Runway Gen-3',
  'Pika 1.5',
  'Text Embedding 3',
];

const requestTypeOptions = [
  'chat.completion',
  'image.generation',
  'video.generation',
  'embedding',
  'audio.transcription',
];

// --- Components ---

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  subtitle,
  subtitleColor,
}: {
  icon: typeof Route;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
  subtitle: string;
  subtitleColor: string;
}) {
  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 hover:border-[#3366FF]/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-mono-data text-white">{value}</p>
          <p className="text-caption text-[var(--slate-400)]">{label}</p>
        </div>
      </div>
      <p className={`mt-3 text-body-sm ${subtitleColor}`}>{subtitle}</p>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-6">
      {/* Request */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-xl bg-[#3366FF]/15 border border-[#3366FF]/30 flex items-center justify-center">
          <Zap className="w-7 h-7 text-[#3366FF]" />
        </div>
        <span className="text-xs text-[var(--slate-400)] font-medium">API 请求</span>
      </div>

      <ArrowRight className="w-5 h-5 text-[var(--slate-500)] hidden sm:block" />
      <div className="w-5 h-5 text-[var(--slate-500)] sm:hidden rotate-90">
        <ArrowRight className="w-5 h-5" />
      </div>

      {/* Router */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3366FF] to-[#7A9FFF] flex items-center justify-center shadow-glow">
          <Route className="w-8 h-8 text-white" />
        </div>
        <span className="text-xs text-[var(--slate-400)] font-medium">智能路由</span>
      </div>

      <ArrowRight className="w-5 h-5 text-[var(--slate-500)] hidden sm:block" />
      <div className="w-5 h-5 text-[var(--slate-500)] sm:hidden rotate-90">
        <ArrowRight className="w-5 h-5" />
      </div>

      {/* Primary Model */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center">
          <Check className="w-7 h-7 text-[#10B981]" />
        </div>
        <span className="text-xs text-[var(--slate-400)] font-medium">主模型</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-[var(--slate-500)]">失败时</span>
        <ArrowRight className="w-5 h-5 text-[var(--slate-500)] hidden sm:block" />
        <div className="w-5 h-5 text-[var(--slate-500)] sm:hidden rotate-90">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Backup Model */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center">
          <GitBranch className="w-7 h-7 text-[#F59E0B]" />
        </div>
        <span className="text-xs text-[var(--slate-400)] font-medium">备用模型</span>
      </div>
    </div>
  );
}

export default function Routing() {
  const [scenarios, setScenarios] = useState<RoutingScenario[]>(initialScenarios);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<RoutingScenario | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form state
  const [formName, setFormName] = useState('');
  const [formRequestType, setFormRequestType] = useState('');
  const [formPrimary, setFormPrimary] = useState('');
  const [formBackup, setFormBackup] = useState('');
  const [formTimeout, setFormTimeout] = useState(30);
  const [formCostPriority, setFormCostPriority] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formNotes, setFormNotes] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const openCreate = () => {
    setIsCreating(true);
    setEditingScenario(null);
    setFormName('');
    setFormRequestType(requestTypeOptions[0]);
    setFormPrimary(modelOptions[0]);
    setFormBackup(modelOptions[1]);
    setFormTimeout(30);
    setFormCostPriority(false);
    setFormStatus('active');
    setFormNotes('');
    setFormDescription('');
    setEditModalOpen(true);
  };

  const openEdit = (scenario: RoutingScenario) => {
    setIsCreating(false);
    setEditingScenario(scenario);
    setFormName(scenario.scenarioName);
    setFormRequestType(scenario.requestType);
    setFormPrimary(scenario.primaryModel);
    setFormBackup(scenario.backupModel);
    setFormTimeout(scenario.timeoutThreshold);
    setFormCostPriority(scenario.costPriority);
    setFormStatus(scenario.status);
    setFormNotes(scenario.notes);
    setFormDescription(scenario.strategyDescription);
    setEditModalOpen(true);
  };

  const saveScenario = () => {
    if (!formName.trim()) return;
    if (isCreating) {
      const newScenario: RoutingScenario = {
        id: `rs_${Date.now()}`,
        scenarioName: formName,
        requestType: formRequestType,
        primaryModel: formPrimary,
        backupModel: formBackup,
        strategyDescription: formDescription || (formCostPriority ? '成本优先' : '质量优先') + '，自动降级',
        timeoutThreshold: formTimeout,
        costPriority: formCostPriority,
        status: formStatus,
        notes: formNotes,
        callCount: 0,
      };
      setScenarios((prev) => [...prev, newScenario]);
    } else if (editingScenario) {
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === editingScenario.id
            ? {
                ...s,
                scenarioName: formName,
                requestType: formRequestType,
                primaryModel: formPrimary,
                backupModel: formBackup,
                strategyDescription: formDescription || s.strategyDescription,
                timeoutThreshold: formTimeout,
                costPriority: formCostPriority,
                status: formStatus,
                notes: formNotes,
              }
            : s
        )
      );
    }
    setEditModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
    );
  };

  const deleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.scenarioName.toLowerCase().includes(q) ||
          s.primaryModel.toLowerCase().includes(q) ||
          s.requestType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [scenarios, statusFilter, searchQuery]);

  const activeCount = scenarios.filter((s) => s.status === 'active').length;
  const totalCalls = scenarios.reduce((sum, s) => sum + s.callCount, 0);
  const fallbackCount = Math.floor(totalCalls * 0.018);

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
          <h1 className="font-space text-h2 text-white">路由策略</h1>
          <p className="mt-1 text-body text-[var(--slate-400)]">
            配置不同业务场景下使用的 AI 模型，支持自动降级和负载均衡。
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] hover:shadow-glow-hover transition-all active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          创建策略
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Route}
          iconColor="#3366FF"
          iconBg="rgba(51,102,255,0.15)"
          value={String(activeCount)}
          label="活跃策略"
          subtitle={`${scenarios.filter((s) => s.callCount > 0).length} 个策略今日被触发`}
          subtitleColor="text-[#7A9FFF]"
        />
        <StatCard
          icon={GitBranch}
          iconColor="#34D399"
          iconBg="rgba(52,211,153,0.15)"
          value={totalCalls.toLocaleString()}
          label="今日路由"
          subtitle="98.2% 命中率"
          subtitleColor="text-[#34D399]"
        />
        <StatCard
          icon={AlertTriangle}
          iconColor="#FBBF24"
          iconBg="rgba(251,191,36,0.15)"
          value={String(fallbackCount)}
          label="今日降级"
          subtitle="主模型不可用时自动切换"
          subtitleColor="text-[var(--slate-400)]"
        />
      </div>

      {/* Routing Flow Diagram */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-5 h-5 text-[#3366FF]" />
          <h3 className="text-h4 text-white font-semibold">路由流程</h3>
        </div>
        <p className="text-body-sm text-[var(--slate-400)] mb-4">请求进入系统后，路由引擎根据策略匹配最优模型</p>
        <FlowDiagram />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索策略或模型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--slate-500)] uppercase">状态</span>
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === s
                  ? s === 'all'
                    ? 'bg-[#3366FF] text-white'
                    : s === 'active'
                    ? 'bg-[#10B981]/15 text-[#10B981]'
                    : 'bg-[var(--slate-600)] text-[var(--slate-300)]'
                  : 'bg-[var(--dark-hover)] text-[var(--slate-500)] hover:text-[var(--slate-300)]'
              }`}
            >
              {s === 'all' ? '全部' : s === 'active' ? '启用' : '禁用'}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">策略名称</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">请求类型</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">主模型</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">备用模型</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">策略描述</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">超时</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">状态</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {filteredScenarios.map((scenario, i) => (
                <motion.tr
                  key={scenario.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[var(--dark-hover)] transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#3366FF]/15 flex items-center justify-center flex-shrink-0">
                        <Route className="w-4 h-4 text-[#3366FF]" />
                      </div>
                      <span className="text-body-sm text-white font-medium whitespace-nowrap">{scenario.scenarioName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--dark-hover)] text-[var(--slate-300)] font-jetbrains whitespace-nowrap">
                      {scenario.requestType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#3366FF]/15 text-[#3366FF] font-medium whitespace-nowrap">
                      <Zap className="w-3 h-3" />
                      {scenario.primaryModel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--dark-hover)] text-[var(--slate-300)] whitespace-nowrap">
                      <GitBranch className="w-3 h-3" />
                      {scenario.backupModel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-body-sm text-[var(--slate-400)] max-w-[200px] truncate">
                    {scenario.strategyDescription}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-body-sm text-[var(--slate-400)] whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      {scenario.timeoutThreshold}s
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleStatus(scenario.id)}
                      className="transition-transform active:scale-95"
                    >
                      {scenario.status === 'active' ? (
                        <ToggleRight className="w-7 h-7 text-[#10B981]" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-[var(--slate-600)]" />
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(scenario)}
                        className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[#3366FF]/10 transition-colors"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteScenario(scenario.id)}
                        className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredScenarios.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Route className="w-16 h-16 text-[var(--slate-600)] mb-4" />
            <h3 className="text-h4 text-[var(--slate-400)]">未找到匹配的策略</h3>
            <p className="mt-2 text-body-sm text-[var(--slate-500)]">尝试调整筛选条件</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              className="fixed inset-0 z-modal flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--dark-border)]">
                  <h3 className="text-h4 text-white font-semibold">
                    {isCreating ? '创建路由策略' : '编辑路由策略'}
                  </h3>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                  {/* Scenario Name */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--dark-text)] mb-1.5">
                      策略名称 <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="如: 生产环境文本对话"
                      className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] transition-colors"
                    />
                  </div>

                  {/* Request Type */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--dark-text)] mb-1.5">请求类型</label>
                    <select
                      value={formRequestType}
                      onChange={(e) => setFormRequestType(e.target.value)}
                      className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
                    >
                      {requestTypeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Model */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--dark-text)] mb-1.5">主模型</label>
                    <select
                      value={formPrimary}
                      onChange={(e) => setFormPrimary(e.target.value)}
                      className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
                    >
                      {modelOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Backup Model */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--dark-text)] mb-1.5">备用模型</label>
                    <select
                      value={formBackup}
                      onChange={(e) => setFormBackup(e.target.value)}
                      className="w-full h-10 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
                    >
                      {modelOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Timeout Slider */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--dark-text)] mb-1.5">
                      超时阈值: <span className="text-[#7A9FFF] font-jetbrains">{formTimeout}s</span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={180}
                      step={5}
                      value={formTimeout}
                      onChange={(e) => setFormTimeout(Number(e.target.value))}
                      className="w-full accent-[#3366FF]"
                    />
                    <div className="flex justify-between text-xs text-[var(--slate-500)] mt-1">
                      <span>5s</span>
                      <span>180s</span>
                    </div>
                  </div>

                  {/* Cost/Quality Priority */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--dark-text)] mb-2">优先级</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setFormCostPriority(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          !formCostPriority
                            ? 'border-[#3366FF] bg-[#3366FF]/10 text-[#3366FF]'
                            : 'border-[var(--dark-border)] text-[var(--slate-400)] hover:text-[var(--slate-300)]'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        质量优先
                      </button>
                      <button
                        onClick={() => setFormCostPriority(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          formCostPriority
                            ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]'
                            : 'border-[var(--dark-border)] text-[var(--slate-400)] hover:text-[var(--slate-300)]'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        成本优先
                      </button>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[var(--dark-text)]">启用状态</label>
                    <button
                      onClick={() => setFormStatus(formStatus === 'active' ? 'inactive' : 'active')}
                      className="transition-transform active:scale-95"
                    >
                      {formStatus === 'active' ? (
                        <ToggleRight className="w-8 h-8 text-[#10B981]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-[var(--slate-600)]" />
                      )}
                    </button>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--dark-text)] mb-1.5">备注</label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="策略说明或备注信息..."
                      rows={3}
                      className="w-full px-3 py-2 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--dark-border)]">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={saveScenario}
                    disabled={!formName.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] hover:shadow-glow transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    保存策略
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
