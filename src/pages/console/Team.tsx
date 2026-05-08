import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  Code,
  Eye,
  UserPlus,
  MoreHorizontal,
  Pencil,
  UserX,
  Check,
  Crown,
  X,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMockData } from '@/hooks/useMockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

type Role = 'owner' | 'admin' | 'developer' | 'viewer';
type Status = 'active' | 'pending' | 'inactive';

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinedAt: string;
  lastActive?: string;
}

const initialMembers: TeamMemberData[] = [
  { id: 'm1', name: '张明远', email: 'zhangmy@company.com', role: 'owner', status: 'active', joinedAt: '2024-01-01', lastActive: '在线' },
  { id: 'm2', name: '李思涵', email: 'lish@company.com', role: 'admin', status: 'active', joinedAt: '2024-01-05', lastActive: '2 分钟前' },
  { id: 'm3', name: '王浩宇', email: 'wanghy@company.com', role: 'developer', status: 'active', joinedAt: '2024-01-08', lastActive: '1 小时前' },
  { id: 'm4', name: '陈晓明', email: 'chenxm@company.com', role: 'developer', status: 'active', joinedAt: '2024-01-10', lastActive: '3 小时前' },
  { id: 'm5', name: '刘芳', email: 'liuf@company.com', role: 'viewer', status: 'active', joinedAt: '2024-01-12', lastActive: '昨天' },
  { id: 'm6', name: '赵强', email: 'zhaoq@partner.com', role: 'developer', status: 'pending', joinedAt: '2024-01-18' },
];

const roleConfig: Record<Role, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  owner: { label: '所有者', color: '#3366FF', bg: 'rgba(51,102,255,0.15)', icon: Crown },
  admin: { label: '管理员', color: '#A855F7', bg: 'rgba(168,85,247,0.15)', icon: Shield },
  developer: { label: '开发者', color: '#22D3EE', bg: 'rgba(34,211,238,0.15)', icon: Code },
  viewer: { label: '只读', color: '#94A3B8', bg: 'rgba(148,163,184,0.15)', icon: Eye },
};

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  active: { label: '活跃', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  pending: { label: '待接受', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  inactive: { label: '已停用', color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
};

export default function Team() {
  const { getTeamMembers } = useMockData();
  const existingMembers = getTeamMembers();

  const [members, setMembers] = useState<TeamMemberData[]>(
    existingMembers.length >= 4
      ? existingMembers.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role as Role,
          status: m.status as Status,
          joinedAt: m.joinedAt,
          lastActive: initialMembers.find((im) => im.id === m.id)?.lastActive,
        }))
      : initialMembers
  );

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('developer');
  const [inviteSent, setInviteSent] = useState(false);

  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [editRole, setEditRole] = useState<Role>('developer');

  const [removingMember, setRemovingMember] = useState<TeamMemberData | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleInvite = useCallback(() => {
    if (!inviteEmails.trim()) return;
    const emails = inviteEmails.split('\n').filter((e) => e.trim());
    const newMembers: TeamMemberData[] = emails.map((email, idx) => ({
      id: `invite_${Date.now()}_${idx}`,
      name: email.split('@')[0],
      email: email.trim(),
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
    }));
    setMembers((prev) => [...prev, ...newMembers]);
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmails('');
      setInviteRole('developer');
      setInviteOpen(false);
    }, 2000);
  }, [inviteEmails, inviteRole]);

  const handleEditRole = useCallback(() => {
    if (!editingMember) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === editingMember.id ? { ...m, role: editRole } : m))
    );
    setEditingMember(null);
  }, [editingMember, editRole]);

  const handleRemove = useCallback(() => {
    if (!removingMember) return;
    setMembers((prev) => prev.filter((m) => m.id !== removingMember.id));
    setRemovingMember(null);
  }, [removingMember]);

  const handleDeactivate = useCallback((id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'inactive' as Status } : m))
    );
    setOpenMenuId(null);
  }, []);

  const memberCount = members.length;
  const adminCount = members.filter((m) => m.role === 'admin' || m.role === 'owner').length;
  const devCount = members.filter((m) => m.role === 'developer').length;
  const viewerCount = members.filter((m) => m.role === 'viewer').length;

  const stats = [
    { label: '团队成员', value: memberCount, icon: Users, color: '#3366FF' },
    { label: '管理员', value: adminCount, icon: Shield, color: '#F59E0B' },
    { label: '开发者', value: devCount, icon: Code, color: '#22D3EE' },
    { label: '只读成员', value: viewerCount, icon: Eye, color: '#94A3B8' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-space text-[36px] font-semibold text-white leading-[1.25]">团队成员</h1>
          <p className="mt-1 text-[var(--slate-400)]">邀请团队成员协作管理，设置不同角色的访问权限。</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] hover:shadow-[0_0_60px_rgba(51,102,255,0.25)] hover:-translate-y-px active:scale-[0.97] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          邀请成员
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 flex items-center gap-4 hover:border-[rgba(51,102,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="font-jetbrains text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-[var(--slate-400)]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Member Table */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)] hover:bg-[var(--dark-sidebar)]">
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">成员</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">角色</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">状态</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">加入时间</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">最近活跃</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, idx) => {
                const rc = roleConfig[member.role];
                const sc = statusConfig[member.status];
                const RoleIcon = rc.icon;
                const isOwner = member.role === 'owner';

                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.06, duration: 0.4 }}
                    className="border-b border-[var(--dark-border)] hover:bg-[var(--dark-hover)] transition-colors"
                  >
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3366FF] to-[#A855F7] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{member.name}</p>
                          <p className="text-xs text-[var(--slate-500)]">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: rc.bg, color: rc.color }}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {rc.label}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 text-xs text-[var(--slate-500)]">{member.joinedAt}</TableCell>
                    <TableCell className="px-4 text-xs text-[var(--slate-500)]">
                      {member.lastActive || '-'}
                    </TableCell>
                    <TableCell className="px-4 text-right relative">
                      {!isOwner && (
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                            className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          <AnimatePresence>
                            {openMenuId === member.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 bottom-10 z-50 min-w-[160px] bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.18)] py-1"
                                >
                                  <button
                                    onClick={() => {
                                      setEditingMember(member);
                                      setEditRole(member.role);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    编辑角色
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeactivate(member.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--slate-300)] hover:text-[#F59E0B] hover:bg-[var(--dark-hover)] transition-colors"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    停用成员
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRemovingMember(member);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-[var(--dark-hover)] transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    移除成员
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={(v) => { if (!v) { setInviteOpen(false); setInviteSent(false); setInviteEmails(''); } }}>
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-space">邀请团队成员</DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {inviteSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-[#10B981]" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">邀请已发送</h4>
                <p className="text-sm text-[var(--slate-400)]">被邀请人将收到邮件通知</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5 mt-2"
              >
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">
                    邮箱地址 <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    placeholder="每行一个邮箱地址，最多 10 个"
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors resize-none"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-medium text-[var(--slate-300)] mb-2">
                    分配角色
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['admin', 'developer', 'viewer'] as Role[]).map((role) => {
                      const cfg = roleConfig[role];
                      const Icon = cfg.icon;
                      const isSelected = inviteRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => setInviteRole(role)}
                          className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                            isSelected
                              ? 'border-[#3366FF] bg-[rgba(51,102,255,0.1)]'
                              : 'border-[var(--dark-border)] hover:border-[var(--slate-500)]'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: cfg.color }} />
                          <p className="text-sm font-medium text-white">{cfg.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setInviteOpen(false)}
                    className="px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmails.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" />
                    发送邀请
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white font-space">编辑角色</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-[var(--slate-400)] mb-4">
              为 <span className="text-white font-medium">{editingMember?.name}</span> 选择新角色：
            </p>
            <div className="space-y-2">
              {(['admin', 'developer', 'viewer'] as Role[]).map((role) => {
                const cfg = roleConfig[role];
                const Icon = cfg.icon;
                const isSelected = editRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setEditRole(role)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#3366FF] bg-[rgba(51,102,255,0.1)]'
                        : 'border-[var(--dark-border)] hover:border-[var(--slate-500)]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{cfg.label}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#3366FF] ml-auto" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEditRole}
                className="px-5 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] active:scale-[0.97] transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <DialogContent className="bg-[var(--dark-card)] border-[var(--dark-border)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white font-space">确认移除</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-[var(--slate-400)]">
              确定要将 <span className="text-white font-medium">{removingMember?.name}</span> 从团队中移除吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setRemovingMember(null)}
                className="px-4 py-2 text-sm text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRemove}
                className="px-5 py-2 bg-[#EF4444] text-white text-sm font-semibold rounded-full hover:bg-[#DC2626] active:scale-[0.97] transition-all"
              >
                确认移除
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
