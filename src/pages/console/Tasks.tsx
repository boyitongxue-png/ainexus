import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Pause, Trash2, RotateCcw, AlertTriangle,
  Clock, CheckCircle2, XCircle, Image, Video,
  Search,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
type TaskType = 'image' | 'video';
interface TaskRow {
  id: number;
  type: TaskType;
  status: TaskStatus;
  modelName: string;
  prompt: string;
  progress: number;
  creditsUsed: string;
  frozenCredits: string;
  createdAt: Date;
  completedAt: Date | null;
  resultUrl: string | null;
  failureReason: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const statusConfig: Record<TaskStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: '排队中', cls: 'bg-[var(--slate-700)] text-[var(--slate-400)]', icon: Clock },
  processing: { label: '进行中', cls: 'bg-[#3366FF]/15 text-[#3366FF]', icon: RotateCcw },
  completed: { label: '已完成', cls: 'bg-[#10B981]/15 text-[#10B981]', icon: CheckCircle2 },
  failed: { label: '失败', cls: 'bg-[#EF4444]/15 text-[#EF4444]', icon: XCircle },
  cancelled: { label: '已取消', cls: 'bg-[var(--slate-700)] text-[var(--slate-400)]', icon: XCircle },
};

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function ConsoleTasks() {
  const utils = trpc.useUtils();
  const { data: taskData, isLoading } = trpc.log.taskList.useQuery({ limit: 50 });

  const updateTask = trpc.log.taskUpdate.useMutation({
    onSuccess: () => { utils.log.taskList.invalidate(); },
  });
  const deleteTask = trpc.log.taskDelete.useMutation({
    onSuccess: () => { utils.log.taskList.invalidate(); },
  });

  /* ── State ── */
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [sortField] = useState<'created' | 'progress' | 'credits'>('created');
  const [sortDir] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* ── Map data ── */
  const tasks: TaskRow[] = useMemo(() => {
    if (!taskData?.items) return [];
    return taskData.items.map((t) => ({
      id: t.id,
      type: t.taskType as TaskType,
      status: t.status as TaskStatus,
      modelName: t.modelName || '未知',
      prompt: t.prompt || '',
      progress: t.progress,
      creditsUsed: t.creditsUsed,
      frozenCredits: t.frozenCredits,
      createdAt: new Date(t.createdAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : null,
      resultUrl: t.resultUrl,
      failureReason: t.failureReason,
    }));
  }, [taskData]);

  /* ── Filter & sort ── */
  const filtered = useMemo(() => {
    let list = tasks;
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.modelName.toLowerCase().includes(q) || t.prompt.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created') cmp = a.createdAt.getTime() - b.createdAt.getTime();
      else if (sortField === 'progress') cmp = a.progress - b.progress;
      else if (sortField === 'credits') cmp = parseFloat(a.creditsUsed) - parseFloat(b.creditsUsed);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [tasks, statusFilter, typeFilter, sortField, sortDir, searchQuery]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = tasks.length;
    const running = tasks.filter((t) => t.status === 'processing').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const failed = tasks.filter((t) => t.status === 'failed').length;
    const frozen = tasks.reduce((s, t) => s + parseFloat(t.frozenCredits), 0);
    return { total, running, pending, completed, failed, frozen };
  }, [tasks]);

  /* ── Actions ── */
  const handleCancel = useCallback((id: number) => {
    updateTask.mutate({ id, status: 'cancelled' });
  }, [updateTask]);

  const handleRetry = useCallback((id: number) => {
    updateTask.mutate({ id, status: 'pending', progress: 0 });
  }, [updateTask]);

  const handleDelete = useCallback(() => {
    if (deletingId !== null) {
      deleteTask.mutate({ id: deletingId }, { onSuccess: () => setDeletingId(null) });
    }
  }, [deletingId, deleteTask]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-tight">异步任务</h1>
          <p className="mt-1 text-[14px] text-[var(--slate-400)]">追踪图片生成、视频生成等异步任务的执行进度、积分冻结与结果回传</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模型或提示词..."
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--dark-text)] text-sm rounded-lg pl-9 pr-4 py-2.5 w-56 outline-none focus:border-[#3366FF] transition-colors placeholder:text-[var(--slate-500)]" />
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: '总任务', value: stats.total, accent: '#3366FF' },
          { label: '进行中', value: stats.running, accent: '#3366FF' },
          { label: '排队中', value: stats.pending, accent: '#A855F7' },
          { label: '已完成', value: stats.completed, accent: '#10B981' },
          { label: '失败', value: stats.failed, accent: '#EF4444' },
          { label: '冻结积分', value: stats.frozen.toFixed(2), accent: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 text-center">
            <p className="text-[11px] text-[var(--slate-400)] uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-space text-[22px] font-bold" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all ${
              statusFilter === s ? 'bg-[#3366FF] text-white' : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
            }`}>
            {s === 'all' ? '全部' : statusConfig[s].label}
          </button>
        ))}
        <div className="w-px h-5 bg-[var(--dark-border)]" />
        {(['all', 'image', 'video'] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all flex items-center gap-1.5 ${
              typeFilter === t ? 'bg-[#3366FF] text-white' : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
            }`}>
            {t === 'image' ? <Image className="w-3 h-3" /> : t === 'video' ? <Video className="w-3 h-3" /> : null}
            {t === 'all' ? '全部类型' : t === 'image' ? '图片生成' : '视频生成'}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-[#3366FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[var(--slate-400)]">加载中...</p>
        </div>
      )}

      {/* ── Table ── */}
      {!isLoading && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">ID</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">任务类型</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">模型</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">状态</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">进度</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">积分</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider">创建时间</th>
                  <th className="py-2.5 px-5 text-[11px] font-medium text-[var(--slate-400)] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-[13px] text-[var(--slate-500)]">暂无任务</td></tr>
                )}
                {filtered.map((task) => {
                  const scfg = statusConfig[task.status];
                  const StatusIcon = scfg.icon;
                  return (
                    <motion.tr key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-[var(--dark-hover)] transition-colors group">
                      <td className="py-3 px-5 text-[12px] text-[var(--slate-400)] font-jetbrains">#{task.id}</td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--dark-text)]">
                          {task.type === 'image' ? <Image className="w-3.5 h-3.5 text-[#A855F7]" /> : <Video className="w-3.5 h-3.5 text-[#F59E0B]" />}
                          {task.type === 'image' ? '图片' : '视频'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-[12px] text-white font-medium">{task.modelName}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full font-medium ${scfg.cls}`}>
                          <StatusIcon className="w-3 h-3" /> {scfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-5 w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--dark-hover)] overflow-hidden">
                            <motion.div className="h-full rounded-full"
                              style={{ backgroundColor: task.status === 'completed' ? '#10B981' : '#3366FF' }}
                              initial={{ width: 0 }} animate={{ width: `${task.progress}%` }} transition={{ duration: 0.5 }} />
                          </div>
                          <span className="text-[11px] text-[var(--slate-400)] font-jetbrains w-8">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[12px] text-[#F59E0B] font-medium font-jetbrains">
                        {parseFloat(task.creditsUsed).toFixed(2)} / {parseFloat(task.frozenCredits).toFixed(2)}
                      </td>
                      <td className="py-3 px-5 text-[11px] text-[var(--slate-400)] font-jetbrains whitespace-nowrap">
                        {task.createdAt.toLocaleString('zh-CN')}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(task.status === 'pending' || task.status === 'processing') && (
                            <button onClick={() => handleCancel(task.id)}
                              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F59E0B] hover:bg-[var(--dark-hover)] transition-colors" title="取消">
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {task.status === 'failed' && (
                            <button onClick={() => handleRetry(task.id)}
                              className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#10B981] hover:bg-[var(--dark-hover)] transition-colors" title="重试">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => setDeletingId(task.id)}
                            className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title="删除">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deletingId !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingId(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl p-5" style={{ maxWidth: 400, width: '100%' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#F43F5E] mt-0.5" />
              <div>
                <p className="text-[14px] text-white">确定要删除此任务吗？</p>
                <p className="text-[12px] text-[var(--slate-400)] mt-1">此操作不可撤销。</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-[13px] text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">取消</button>
              <button onClick={handleDelete}
                className="px-5 py-2 bg-[#F43F5E] text-white text-[13px] font-semibold rounded-lg hover:bg-[#E11D48] transition-colors">
                确认删除
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
