import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Image,
  Video,
  Search,
  X,
  RotateCcw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

// --- Types ---
interface AsyncTaskItem {
  id: string;
  taskId: string;
  taskType: 'image' | 'video';
  provider: string;
  model: string;
  createdAt: string;
  status: 'processing' | 'success' | 'failed' | 'cancelled';
  progress: number;
  frozenCredits: number;
  actualCredits: number;
  resultUrl: string | null;
  failureReason: string | null;
  prompt: string;
  params: Record<string, unknown>;
}

// --- Mock Data (10+ tasks in various states) ---
const initialTasks: AsyncTaskItem[] = [
  {
    id: 't1',
    taskId: 'img_a1b2c3d4',
    taskType: 'image',
    provider: 'OpenAI',
    model: 'DALL-E 3',
    createdAt: '2024-12-10T14:30:00Z',
    status: 'success',
    progress: 100,
    frozenCredits: 500,
    actualCredits: 500,
    resultUrl: 'https://cdn.example.com/results/img_a1b2c3d4.png',
    failureReason: null,
    prompt: 'A futuristic cityscape at night with neon lights and flying cars',
    params: { size: '1024x1024', quality: 'hd', style: 'vivid' },
  },
  {
    id: 't2',
    taskId: 'vid_c3d4e5f6',
    taskType: 'video',
    provider: 'Runway',
    model: 'Runway Gen-3',
    createdAt: '2024-12-10T14:25:00Z',
    status: 'processing',
    progress: 65,
    frozenCredits: 1000,
    actualCredits: 0,
    resultUrl: null,
    failureReason: null,
    prompt: 'Slow motion waterfall in a lush green forest, cinematic lighting',
    params: { duration: 4, resolution: '1080p', motion: 'medium' },
  },
  {
    id: 't3',
    taskId: 'img_e5f6g7h8',
    taskType: 'image',
    provider: 'Stability AI',
    model: 'Stable Diffusion 3',
    createdAt: '2024-12-10T14:35:00Z',
    status: 'processing',
    progress: 30,
    frozenCredits: 200,
    actualCredits: 0,
    resultUrl: null,
    failureReason: null,
    prompt: 'Abstract geometric art with bold colors and sharp lines',
    params: { cfg_scale: 7.0, steps: 30, size: '1024x1024' },
  },
  {
    id: 't4',
    taskId: 'img_g7h8i9j0',
    taskType: 'image',
    provider: 'OpenAI',
    model: 'DALL-E 3',
    createdAt: '2024-12-10T14:20:00Z',
    status: 'failed',
    progress: 0,
    frozenCredits: 500,
    actualCredits: 0,
    resultUrl: null,
    failureReason: '上游服务返回错误: content_policy_violation - 提示词包含违规内容',
    prompt: 'Portrait of a cyberpunk character with neon implants',
    params: { size: '1024x1024', quality: 'standard' },
  },
  {
    id: 't5',
    taskId: 'vid_i9j0k1l2',
    taskType: 'video',
    provider: 'Pika',
    model: 'Pika 1.5',
    createdAt: '2024-12-10T14:15:00Z',
    status: 'cancelled',
    progress: 0,
    frozenCredits: 800,
    actualCredits: 0,
    resultUrl: null,
    failureReason: '用户主动取消',
    prompt: 'Animated logo reveal with particle effects',
    params: { duration: 3, motion: 'high' },
  },
  {
    id: 't6',
    taskId: 'img_k1l2m3n4',
    taskType: 'image',
    provider: 'Midjourney',
    model: 'Midjourney V6',
    createdAt: '2024-12-10T14:10:00Z',
    status: 'success',
    progress: 100,
    frozenCredits: 600,
    actualCredits: 600,
    resultUrl: 'https://cdn.example.com/results/img_k1l2m3n4.png',
    failureReason: null,
    prompt: 'Fantasy landscape with floating islands and waterfalls',
    params: { ar: '16:9', style: 'raw', v: 6 },
  },
  {
    id: 't7',
    taskId: 'vid_m3n4o5p6',
    taskType: 'video',
    provider: 'Runway',
    model: 'Runway Gen-3',
    createdAt: '2024-12-10T14:05:00Z',
    status: 'success',
    progress: 100,
    frozenCredits: 2000,
    actualCredits: 2000,
    resultUrl: 'https://cdn.example.com/results/vid_m3n4o5p6.mp4',
    failureReason: null,
    prompt: 'Drone shot of a tropical beach at sunset, waves gently rolling',
    params: { duration: 10, resolution: '4k', motion: 'low' },
  },
  {
    id: 't8',
    taskId: 'img_o5p6q7r8',
    taskType: 'image',
    provider: 'Stability AI',
    model: 'Stable Diffusion 3',
    createdAt: '2024-12-10T14:00:00Z',
    status: 'failed',
    progress: 0,
    frozenCredits: 200,
    actualCredits: 0,
    resultUrl: null,
    failureReason: '上游 API 超时: 请求在 60 秒内未完成',
    prompt: 'Photorealistic product shot of a luxury watch on marble surface',
    params: { cfg_scale: 8.0, steps: 50 },
  },
  {
    id: 't9',
    taskId: 'img_q7r8s9t0',
    taskType: 'image',
    provider: 'OpenAI',
    model: 'DALL-E 3',
    createdAt: '2024-12-10T13:55:00Z',
    status: 'processing',
    progress: 80,
    frozenCredits: 500,
    actualCredits: 0,
    resultUrl: null,
    failureReason: null,
    prompt: 'Minimalist office interior with natural lighting and plants',
    params: { size: '1792x1024', quality: 'hd' },
  },
  {
    id: 't10',
    taskId: 'vid_s9t0u1v2',
    taskType: 'video',
    provider: 'Pika',
    model: 'Pika 1.5',
    createdAt: '2024-12-10T13:50:00Z',
    status: 'success',
    progress: 100,
    frozenCredits: 800,
    actualCredits: 800,
    resultUrl: 'https://cdn.example.com/results/vid_s9t0u1v2.mp4',
    failureReason: null,
    prompt: 'A cat playing piano in a jazz club, anthropomorphic style',
    params: { duration: 3, motion: 'medium' },
  },
  {
    id: 't11',
    taskId: 'img_u1v2w3x4',
    taskType: 'image',
    provider: 'Stability AI',
    model: 'Stable Diffusion 3',
    createdAt: '2024-12-10T13:45:00Z',
    status: 'cancelled',
    progress: 0,
    frozenCredits: 200,
    actualCredits: 0,
    resultUrl: null,
    failureReason: '超出队列等待时间限制',
    prompt: 'Sci-fi spaceship interior with holographic displays',
    params: { cfg_scale: 7.0, steps: 25 },
  },
  {
    id: 't12',
    taskId: 'img_w3x4y5z6',
    taskType: 'image',
    provider: 'OpenAI',
    model: 'DALL-E 3',
    createdAt: '2024-12-10T13:40:00Z',
    status: 'success',
    progress: 100,
    frozenCredits: 500,
    actualCredits: 500,
    resultUrl: 'https://cdn.example.com/results/img_w3x4y5z6.png',
    failureReason: null,
    prompt: 'Cute robot watering plants in a garden, Pixar style',
    params: { size: '1024x1024', quality: 'standard', style: 'natural' },
  },
];

const statusConfig = {
  processing: {
    label: '处理中',
    className: 'bg-[#3B82F6]/15 text-[#3B82F6]',
    icon: Loader2,
    animate: true,
  },
  success: {
    label: '成功',
    className: 'bg-[#10B981]/15 text-[#10B981]',
    icon: CheckCircle2,
    animate: false,
  },
  failed: {
    label: '失败',
    className: 'bg-[#EF4444]/15 text-[#EF4444]',
    icon: XCircle,
    animate: false,
  },
  cancelled: {
    label: '已取消',
    className: 'bg-[var(--slate-700)] text-[var(--slate-400)]',
    icon: XCircle,
    animate: false,
  },
};

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

export default function Tasks() {
  const [tasks, setTasks] = useState<AsyncTaskItem[]>(initialTasks);
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTask, setSelectedTask] = useState<AsyncTaskItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskTypeFilter !== 'all' && t.taskType !== taskTypeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.taskId.toLowerCase().includes(q) ||
          t.model.toLowerCase().includes(q) ||
          t.prompt.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, taskTypeFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedTasks = filteredTasks.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => {
    const processing = tasks.filter((t) => t.status === 'processing').length;
    const completed = tasks.filter((t) => t.status === 'success').length;
    const failed = tasks.filter((t) => t.status === 'failed').length;
    const successRate = tasks.length > 0 ? ((completed / (completed + failed)) * 100).toFixed(1) : '0';
    return { processing, completed, successRate };
  }, [tasks]);

  const retryTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: 'processing' as const, progress: 0, failureReason: null, actualCredits: 0 }
            : t
        )
      );
    },
    []
  );

  const copyResultUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-space text-h2 text-white">异步任务</h1>
        <p className="mt-1 text-body text-[var(--slate-400)]">
          管理图片生成和视频生成等异步任务。
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="进行中" value={String(stats.processing)} change={3} changeLabel="" accentColor="#3B82F6" />
        <StatCard title="今日完成" value={String(stats.completed)} change={24} changeLabel="" accentColor="#10B981" />
        <StatCard title="成功率" value={`${stats.successRate}%`} change={1.2} changeLabel="%" accentColor="#A855F7" />
        <StatCard title="平均耗时" value="12.3s" change={-2.1} changeLabel="s" accentColor="#22D3EE" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={taskTypeFilter}
          onChange={(e) => setTaskTypeFilter(e.target.value)}
          className="h-9 px-3 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
        >
          <option value="all">全部类型</option>
          <option value="image">图片生成</option>
          <option value="video">视频生成</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
        >
          <option value="all">全部状态</option>
          <option value="processing">处理中</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
          <option value="cancelled">已取消</option>
        </select>

        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
          <input
            type="text"
            placeholder="搜索任务ID或模型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-[var(--slate-500)] hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">任务ID</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">类型</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">供应商</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">模型</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">创建时间</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">状态</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">冻结积分</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">实际积分</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">结果</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">失败原因</th>
                <th className="py-3.5 px-4 text-caption text-[var(--slate-400)] uppercase whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {paginatedTasks.map((task, i) => {
                const StatusIcon = statusConfig[task.status].icon;
                return (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-[var(--dark-hover)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <span className="text-body-sm text-[#7A9FFF] font-jetbrains whitespace-nowrap">{task.taskId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                          task.taskType === 'image'
                            ? 'bg-[#A855F7]/15 text-[#A855F7]'
                            : 'bg-[#22D3EE]/15 text-[#22D3EE]'
                        }`}
                      >
                        {task.taskType === 'image' ? <Image className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {task.taskType === 'image' ? '图片' : '视频'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-body-sm text-[var(--slate-400)] whitespace-nowrap">{task.provider}</td>
                    <td className="py-3.5 px-4 text-body-sm text-white whitespace-nowrap">{task.model}</td>
                    <td className="py-3.5 px-4 text-caption text-[var(--slate-400)] whitespace-nowrap">
                      {new Date(task.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusConfig[task.status].className}`}
                      >
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${statusConfig[task.status].animate ? 'animate-spin' : ''}`}
                        />
                        {statusConfig[task.status].label}
                        {task.status === 'processing' && (
                          <span className="text-[10px] opacity-70">{task.progress}%</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-body-sm text-[var(--slate-300)] font-jetbrains whitespace-nowrap">
                      {task.frozenCredits}
                    </td>
                    <td className="py-3.5 px-4 text-body-sm text-[var(--slate-300)] font-jetbrains whitespace-nowrap">
                      {task.actualCredits || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {task.resultUrl ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#10B981] whitespace-nowrap">
                          <ExternalLink className="w-3 h-3" />
                          可用
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--slate-600)]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {task.failureReason ? (
                        <span className="text-xs text-[#EF4444] max-w-[150px] truncate block" title={task.failureReason}>
                          {task.failureReason}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--slate-600)]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                          className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[#3366FF]/10 transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {task.status === 'failed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              retryTask(task.id);
                            }}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                            title="重试"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {task.resultUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyResultUrl(task.resultUrl!);
                            }}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
                            title="复制结果链接"
                          >
                            {copiedUrl ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginatedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="w-16 h-16 text-[var(--slate-600)] mb-4" />
            <h3 className="text-h4 text-[var(--slate-400)]">暂无异步任务</h3>
            <p className="mt-2 text-body-sm text-[var(--slate-500)]">发起图片或视频生成调用后，任务将显示在这里</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTasks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--slate-500)]">
            显示 {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredTasks.length)} 条，共 {filteredTasks.length} 条
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
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-[var(--dark-card)] border-l border-[var(--dark-border)] z-modal overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--dark-card)] border-b border-[var(--dark-border)]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor:
                        selectedTask.taskType === 'image' ? 'rgba(168,85,247,0.15)' : 'rgba(34,211,238,0.15)',
                    }}
                  >
                    {selectedTask.taskType === 'image' ? (
                      <Image className="w-5 h-5 text-[#A855F7]" />
                    ) : (
                      <Video className="w-5 h-5 text-[#22D3EE]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-h4 text-white font-semibold">{selectedTask.taskId}</h2>
                    <p className="text-xs text-[var(--slate-400)]">{selectedTask.provider} / {selectedTask.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[selectedTask.status].className}`}
                  >
                    {statusConfig[selectedTask.status].label}
                  </span>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Progress (if processing) */}
                {selectedTask.status === 'processing' && (
                  <div className="bg-[#3B82F6]/5 rounded-xl p-5 border border-[#3B82F6]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
                      <h3 className="text-sm font-semibold text-[#3B82F6]">任务处理中</h3>
                    </div>
                    <div className="w-full h-2 bg-[var(--dark-border)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedTask.progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#3366FF] to-[#7A9FFF] rounded-full"
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-[var(--slate-400)]">处理进度</span>
                      <span className="text-xs text-[#7A9FFF] font-medium">{selectedTask.progress}%</span>
                    </div>
                  </div>
                )}

                {/* Task Info */}
                <div className="bg-[var(--dark-bg)] rounded-xl p-5 border border-[var(--dark-border)]">
                  <h3 className="text-sm font-semibold text-white mb-4">任务信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">任务类型</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          selectedTask.taskType === 'image'
                            ? 'bg-[#A855F7]/15 text-[#A855F7]'
                            : 'bg-[#22D3EE]/15 text-[#22D3EE]'
                        }`}
                      >
                        {selectedTask.taskType === 'image' ? '图片生成' : '视频生成'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">模型</span>
                      <span className="text-sm text-white font-medium">{selectedTask.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">供应商</span>
                      <span className="text-sm text-white">{selectedTask.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">创建时间</span>
                      <span className="text-sm text-white">{new Date(selectedTask.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">提示词</h3>
                  <div className="bg-[var(--dark-bg)] rounded-xl p-4 border border-[var(--dark-border)]">
                    <p className="text-sm text-[var(--dark-text)] leading-relaxed">{selectedTask.prompt}</p>
                  </div>
                </div>

                {/* Task Parameters */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">生成参数</h3>
                  <div className="bg-[#0B1120] rounded-xl p-4 border border-[var(--dark-border)] overflow-x-auto">
                    <pre className="text-xs text-[#A8C3FF] font-jetbrains leading-relaxed">
                      {JSON.stringify(selectedTask.params, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Credits */}
                <div className="bg-[var(--dark-bg)] rounded-xl p-5 border border-[var(--dark-border)]">
                  <h3 className="text-sm font-semibold text-white mb-4">积分消耗</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">冻结积分</span>
                      <span className="text-sm text-[#7A9FFF] font-jetbrains">{selectedTask.frozenCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">实际消耗</span>
                      <span className="text-sm text-white font-jetbrains">
                        {selectedTask.actualCredits || '-'}
                      </span>
                    </div>
                    {selectedTask.status === 'success' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--slate-400)]">退还积分</span>
                        <span className="text-sm text-[#10B981] font-jetbrains">
                          {selectedTask.frozenCredits - selectedTask.actualCredits}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Result URL (if success) */}
                {selectedTask.resultUrl && (
                  <div className="bg-[#10B981]/5 rounded-xl p-5 border border-[#10B981]/20">
                    <h3 className="text-sm font-semibold text-[#10B981] mb-3">结果</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedTask.resultUrl}
                        className="flex-1 h-9 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-xs text-[var(--dark-text)] font-jetbrains focus:outline-none"
                      />
                      <button
                        onClick={() => copyResultUrl(selectedTask.resultUrl!)}
                        className="h-9 px-3 bg-[#10B981]/15 text-[#10B981] rounded-lg text-xs font-medium hover:bg-[#10B981]/25 transition-colors"
                      >
                        {copiedUrl ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> 已复制
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3.5 h-3.5" /> 复制
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Details (if failed) */}
                {selectedTask.status === 'failed' && selectedTask.failureReason && (
                  <div className="bg-[#EF4444]/5 rounded-xl p-5 border border-[#EF4444]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                      <h3 className="text-sm font-semibold text-[#EF4444]">失败原因</h3>
                    </div>
                    <p className="text-sm text-[#EF4444]">{selectedTask.failureReason}</p>
                    <button
                      onClick={() => retryTask(selectedTask.id)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3366FF] text-white text-xs font-semibold rounded-lg hover:bg-[#2244CC] transition-all active:scale-[0.97]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      重试任务
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-[var(--dark-border)] flex items-center gap-3">
                  {selectedTask.status === 'failed' && (
                    <button
                      onClick={() => retryTask(selectedTask.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#3366FF] text-white text-sm font-semibold rounded-lg hover:bg-[#2244CC] transition-all active:scale-[0.97]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重试任务
                    </button>
                  )}
                  {selectedTask.resultUrl && (
                    <button
                      onClick={() => copyResultUrl(selectedTask.resultUrl!)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#10B981]/15 text-[#10B981] text-sm font-semibold rounded-lg hover:bg-[#10B981]/25 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      复制结果链接
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
