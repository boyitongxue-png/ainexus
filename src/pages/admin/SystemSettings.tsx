import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cog, Shield, UserCog, KeyRound, Bell, Globe, Database, Lock,
  Save, RefreshCw, Users, Fingerprint, Trash2, Plus, Pencil, X, Search,
} from 'lucide-react';

/* ── Types ── */
type TabKey = 'general' | 'security' | 'rbac' | 'notifications' | 'database';
type RbacSubTab = 'roles' | 'permissions' | 'accounts';

/* ── Tab Config ── */
const tabs: { key: TabKey; label: string; icon: typeof Cog }[] = [
  { key: 'general', label: '通用设置', icon: Cog },
  { key: 'security', label: '安全设置', icon: Shield },
  { key: 'rbac', label: '权限管理', icon: Fingerprint },
  { key: 'notifications', label: '通知设置', icon: Bell },
  { key: 'database', label: '数据管理', icon: Database },
];

/* ── Toggle Switch ── */
function Toggle({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {desc && <p className="text-xs text-[var(--slate-500)] mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} className="relative w-11 h-6 rounded-full transition-colors duration-200" style={{ backgroundColor: value ? '#3366FF' : 'var(--slate-700)' }}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

/* ── Setting Row ── */
function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--dark-border)] last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm text-white font-medium">{label}</p>
        {desc && <p className="text-xs text-[var(--slate-500)] mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ================================================================== */
/*  RBAC SUB-COMPONENTS                                               */
/* ================================================================== */

/* ── Roles Manager ── */
function RolesManager() {
  const [subTab, setSubTab] = useState<RbacSubTab>('roles');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPerms, setFormPerms] = useState<string[]>([]);

  // Mock roles data
  const roles = [
    { id: 1, name: '超级管理员', description: '拥有所有权限', permissions: ['*'], userCount: 2, isSystem: true },
    { id: 2, name: '运维管理员', description: '系统运维和监控', permissions: ['system.*', 'model.read', 'model.write', 'log.*', 'config.*'], userCount: 3, isSystem: true },
    { id: 3, name: '财务人员', description: '充值审核和台账', permissions: ['recharge.*', 'credit.*', 'report.read'], userCount: 1, isSystem: false },
    { id: 4, name: '客服人员', description: '客户管理和基础操作', permissions: ['customer.read', 'customer.write', 'key.read', 'log.read'], userCount: 2, isSystem: false },
    { id: 5, name: '审计员', description: '只读审计权限', permissions: ['*read'], userCount: 1, isSystem: false },
  ];

  const allPermissions = [
    { code: '*', label: '所有权限' },
    { code: 'system.*', label: '系统管理' },
    { code: 'model.read', label: '模型查看' },
    { code: 'model.write', label: '模型编辑' },
    { code: 'customer.*', label: '客户管理' },
    { code: 'recharge.*', label: '充值审核' },
    { code: 'credit.*', label: '积分台账' },
    { code: 'log.*', label: '日志查看' },
    { code: 'config.*', label: '系统配置' },
    { code: 'report.*', label: '报表查看' },
    { code: 'key.*', label: '密钥管理' },
    { code: 'admin.*', label: '管理员管理' },
    { code: 'rbac.*', label: '权限管理' },
  ];

  const filtered = roles.filter(r => !search || r.name.includes(search) || r.description.includes(search));

  const openEdit = (role: any) => {
    setEditing(role);
    setFormName(role.name);
    setFormDesc(role.description);
    setFormPerms(role.permissions);
  };

  const closeEdit = () => { setEditing(null); setFormName(''); setFormDesc(''); setFormPerms([]); };

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <div className="flex items-center gap-1 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-1 w-fit">
        {[
          { key: 'roles' as RbacSubTab, label: '角色管理', icon: UserCog },
          { key: 'permissions' as RbacSubTab, label: '权限配置', icon: KeyRound },
          { key: 'accounts' as RbacSubTab, label: '管理员账号', icon: Users },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${subTab === t.key ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {subTab === 'roles' && (
        <>
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--slate-500)]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索角色..."
                className="h-8 pl-8 pr-3 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-xs text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-48" />
            </div>
            <button onClick={() => openEdit({ id: 0, name: '', description: '', permissions: [], isSystem: false })}
              className="h-8 px-3 bg-[#3366FF] text-white text-xs rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />新增角色
            </button>
          </div>

          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">角色名称</th>
                <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">描述</th>
                <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase text-right">人员</th>
                <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">类型</th>
                <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase text-right">操作</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                    <td className="py-3 px-4"><p className="text-sm text-white font-medium">{r.name}</p></td>
                    <td className="py-3 px-4 text-xs text-[var(--slate-400)]">{r.description}</td>
                    <td className="py-3 px-4 text-right font-jetbrains text-sm text-white">{r.userCount}</td>
                    <td className="py-3 px-4">{r.isSystem
                      ? <span className="text-[11px] px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B]">系统</span>
                      : <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--dark-hover)] text-[var(--slate-400)]">自定义</span>}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)]"><Pencil className="w-3.5 h-3.5" /></button>
                      {!r.isSystem && <button className="p-1.5 rounded text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)]"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {subTab === 'permissions' && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
              <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">权限编码</th>
              <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">权限名称</th>
              <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">描述</th>
              <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">模块</th>
            </tr></thead>
            <tbody className="divide-y divide-[var(--dark-border)]">
              {allPermissions.map(p => (
                <tr key={p.code} className="hover:bg-[var(--dark-hover)] transition-colors">
                  <td className="py-3 px-4 font-jetbrains text-xs text-[#7A9FFF]">{p.code}</td>
                  <td className="py-3 px-4 text-sm text-white">{p.label}</td>
                  <td className="py-3 px-4 text-xs text-[var(--slate-400)]">允许{p.label.includes('查看') ? '查看' : p.label.includes('编辑') ? '编辑' : '操作'}{p.label.replace('查看', '').replace('编辑', '')}</td>
                  <td className="py-3 px-4 text-xs text-[var(--slate-500)]">{p.code.split('.')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'accounts' && <AdminAccountsManager />}

      {/* Edit Role Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={closeEdit}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-space text-lg font-semibold text-white">{editing.id === 0 ? '新增角色' : `编辑角色: ${editing.name}`}</h3>
              <button onClick={closeEdit} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--slate-400)] mb-1">角色名称</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--slate-400)] mb-1">描述</label>
                <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--slate-400)] mb-2">权限配置</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {allPermissions.map(p => (
                    <label key={p.code} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input type="checkbox" checked={formPerms.includes(p.code)} onChange={e => {
                        if (e.target.checked) setFormPerms([...formPerms, p.code]);
                        else setFormPerms(formPerms.filter(x => x !== p.code));
                      }} className="w-3.5 h-3.5 accent-[#3366FF]" />
                      <span className="text-xs text-white">{p.label}</span>
                      <span className="text-[10px] text-[var(--slate-500)] font-jetbrains">{p.code}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeEdit} className="px-4 py-2 text-xs text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg">取消</button>
                <button onClick={closeEdit} className="px-4 py-2 bg-[#3366FF] text-white text-xs rounded-lg hover:bg-[#2244CC]">保存</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ── Admin Accounts Manager ── */
function AdminAccountsManager() {
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState([
    { id: 1, username: 'admin', name: '系统管理员', email: 'admin@apimix.ai', role: '超级管理员', status: 'active', lastLogin: '2026-05-09 14:30', createdAt: '2024-01-01' },
    { id: 2, username: 'ops01', name: '运维小王', email: 'ops01@apimix.ai', role: '运维管理员', status: 'active', lastLogin: '2026-05-09 12:15', createdAt: '2024-03-15' },
    { id: 3, username: 'ops02', name: '运维小李', email: 'ops02@apimix.ai', role: '运维管理员', status: 'active', lastLogin: '2026-05-08 18:00', createdAt: '2024-06-20' },
    { id: 4, username: 'finance01', name: '财务小张', email: 'finance@apimix.ai', role: '财务人员', status: 'active', lastLogin: '2026-05-09 09:00', createdAt: '2024-08-01' },
    { id: 5, username: 'cs01', name: '客服小陈', email: 'cs01@apimix.ai', role: '客服人员', status: 'inactive', lastLogin: '2026-04-20 16:45', createdAt: '2025-01-10' },
    { id: 6, username: 'auditor01', name: '审计小赵', email: 'audit@apimix.ai', role: '审计员', status: 'active', lastLogin: '2026-05-07 11:20', createdAt: '2025-02-01' },
  ]);
  const [editModal, setEditModal] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('运维管理员');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const roles = ['超级管理员', '运维管理员', '财务人员', '客服人员', '审计员'];
  const filtered = accounts.filter(a => !search || a.name.includes(search) || a.username.includes(search) || a.role.includes(search));

  const openEdit = (a: any) => {
    setEditModal(a);
    setFormUsername(a.username);
    setFormName(a.name);
    setFormEmail(a.email);
    setFormRole(a.role);
    setFormStatus(a.status);
  };

  const openAdd = () => {
    setAddModal(true);
    setFormUsername('');
    setFormName('');
    setFormEmail('');
    setFormRole('运维管理员');
    setFormStatus('active');
  };

  const closeModal = () => { setEditModal(null); setAddModal(false); };

  const handleSaveEdit = () => {
    if (!editModal) return;
    setAccounts(prev => prev.map(a => a.id === editModal.id ? { ...a, username: formUsername, name: formName, email: formEmail, role: formRole, status: formStatus } : a));
    closeModal();
  };

  const handleAdd = () => {
    const newId = Math.max(...accounts.map(a => a.id)) + 1;
    setAccounts(prev => [...prev, { id: newId, username: formUsername, name: formName, email: formEmail, role: formRole, status: formStatus, lastLogin: '-', createdAt: new Date().toISOString().slice(0, 10) }]);
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除该管理员账号吗？')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a));
  };

  const AccountModal = ({ title, onSave }: { title: string; onSave: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={closeModal}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space text-lg font-semibold text-white">{title}</h3>
          <button onClick={closeModal} className="p-1.5 rounded-lg text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1">账号</label>
            <input type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="如 ops03"
              className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1">姓名</label>
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="姓名"
              className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1">邮箱</label>
            <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@apimix.ai"
              className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--slate-400)] mb-1">角色</label>
              <select value={formRole} onChange={e => setFormRole(e.target.value)}
                className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--slate-400)] mb-1">状态</label>
              <select value={formStatus} onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
                className="w-full h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]">
                <option value="active">正常</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={closeModal} className="px-4 py-2 text-xs text-[var(--slate-300)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg">取消</button>
            <button onClick={onSave} className="px-4 py-2 bg-[#3366FF] text-white text-xs rounded-lg hover:bg-[#2244CC]">保存</button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--slate-500)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索账号..."
            className="h-8 pl-8 pr-3 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-xs text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] w-48" />
        </div>
        <button onClick={openAdd} className="h-8 px-3 bg-[#3366FF] text-white text-xs rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />新增账号
        </button>
      </div>

      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
            <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">账号</th>
            <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">姓名</th>
            <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">角色</th>
            <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">状态</th>
            <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase">最近登录</th>
            <th className="py-2.5 px-4 text-[11px] text-[var(--slate-400)] uppercase text-right">操作</th>
          </tr></thead>
          <tbody className="divide-y divide-[var(--dark-border)]">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-[var(--dark-hover)] transition-colors">
                <td className="py-3 px-4">
                  <p className="text-sm text-white font-medium">{a.username}</p>
                  <p className="text-[10px] text-[var(--slate-500)]">{a.email}</p>
                </td>
                <td className="py-3 px-4 text-sm text-white">{a.name}</td>
                <td className="py-3 px-4"><span className="text-[11px] px-2 py-0.5 rounded bg-[var(--dark-hover)] text-[var(--slate-300)]">{a.role}</span></td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleStatus(a.id)} className="cursor-pointer">
                    {a.status === 'active'
                      ? <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981]"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />正常</span>
                      : <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[var(--slate-700)] text-[var(--slate-400)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--slate-500)]" />停用</span>}
                  </button>
                </td>
                <td className="py-3 px-4 text-xs text-[var(--slate-500)]">{a.lastLogin}</td>
                <td className="py-3 px-4"><div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded text-[var(--slate-400)] hover:text-[#3366FF] hover:bg-[var(--dark-hover)] transition-colors" title="编辑"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded text-[var(--slate-400)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal && <AccountModal title={`编辑账号: ${editModal.username}`} onSave={handleSaveEdit} />}
      {/* Add Modal */}
      {addModal && <AccountModal title="新增管理员账号" onSave={handleAdd} />}
    </div>
  );
}

/* ================================================================== */
/*  MAIN SYSTEM SETTINGS                                              */
/* ================================================================== */
export default function AdminSystemSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  // General settings state
  const [siteName, setSiteName] = useState('ApiMix');
  const [autoApprove, setAutoApprove] = useState(false);
  const [regOpen, setRegOpen] = useState(true);
  const [maintMode, setMaintMode] = useState(false);
  const [apiLogging, setApiLogging] = useState(true);

  // Security settings state
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [pwdPolicy, setPwdPolicy] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Notification settings state
  const [notifyRecharge, setNotifyRecharge] = useState(true);
  const [notifyError, setNotifyError] = useState(true);
  const [notifySecurity, setNotifySecurity] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings...`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space text-3xl font-semibold text-white tracking-tight">系统设置</h1>
        <p className="mt-1 text-sm text-[var(--slate-400)]">配置平台各项参数和权限管理</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-1.5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#3366FF] text-white shadow-lg'
                : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── General ── */}
      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Platform Info */}
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#3366FF]" />平台信息
            </h3>
            <SettingRow label="平台名称" desc="显示在网站标题和邮件中的名称">
              <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)}
                className="h-9 w-48 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]" />
            </SettingRow>
            <SettingRow label="平台版本" desc="当前运行版本">
              <span className="text-sm text-[var(--slate-400)] font-jetbrains">v2.0.0</span>
            </SettingRow>
            <SettingRow label="运行环境" desc="当前部署环境">
              <span className="text-sm text-[var(--slate-400)]">Production</span>
            </SettingRow>
            <div className="flex justify-end mt-4">
              <button onClick={() => handleSave('platform')} className="h-9 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />保存
              </button>
            </div>
          </div>

          {/* Business Config */}
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#3366FF]" />业务配置
            </h3>
            <p className="text-xs text-[var(--slate-500)] mb-4">影响平台核心业务流程的设置项</p>
            <Toggle value={autoApprove} onChange={setAutoApprove} label="自动审批充值"
              desc="开启后小额充值将自动通过审批" />
            <Toggle value={regOpen} onChange={setRegOpen} label="开放注册"
              desc="关闭后新用户将无法注册" />
            <Toggle value={maintMode} onChange={setMaintMode} label="维护模式"
              desc="开启后仅管理员可访问平台" />
            <Toggle value={apiLogging} onChange={setApiLogging} label="API 调用日志"
              desc="记录所有 API 请求和响应详情" />
          </div>
        </motion.div>
      )}

      {/* ── Security ── */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#3366FF]" />访问控制
            </h3>
            <p className="text-xs text-[var(--slate-500)] mb-4">管理后台访问安全策略</p>
            <Toggle value={mfaEnabled} onChange={setMfaEnabled} label="强制双因素认证"
              desc="所有管理员必须启用 MFA" />
            <Toggle value={pwdPolicy} onChange={setPwdPolicy} label="强密码策略"
              desc="要求 8 位以上含大小写字母和数字" />
            <SettingRow label="会话超时" desc="无操作后自动登出时间">
              <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
                className="h-9 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF]">
                <option value="15">15 分钟</option>
                <option value="30">30 分钟</option>
                <option value="60">1 小时</option>
                <option value="120">2 小时</option>
                <option value="240">4 小时</option>
              </select>
            </SettingRow>
            <SettingRow label="IP 白名单" desc="限制管理后台访问来源IP，留空不限制">
              <input type="text" value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)}
                placeholder="例: 192.168.1.0/24, 10.0.0.1"
                className="h-9 w-64 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF] placeholder:text-[var(--slate-600)]" />
            </SettingRow>
            <div className="flex justify-end mt-4">
              <button onClick={() => handleSave('security')} className="h-9 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />保存
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── RBAC ── */}
      {activeTab === 'rbac' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#3366FF]" />权限角色账号管理
            </h3>
            <p className="text-xs text-[var(--slate-500)] mb-4">管理后台角色的权限配置和管理员账号</p>
            <RolesManager />
          </div>
        </motion.div>
      )}

      {/* ── Notifications ── */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#3366FF]" />通知开关
            </h3>
            <p className="text-xs text-[var(--slate-500)] mb-4">配置各类事件的通知方式</p>
            <Toggle value={notifyRecharge} onChange={setNotifyRecharge} label="充值通知"
              desc="用户提交充值申请时通知管理员" />
            <Toggle value={notifyError} onChange={setNotifyError} label="异常告警"
              desc="API 错误率超过阈值时发送告警" />
            <Toggle value={notifySecurity} onChange={setNotifySecurity} label="安全告警"
              desc="登录异常、暴力破解等安全事件" />
          </div>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#3366FF]" />Webhook 配置
            </h3>
            <p className="text-xs text-[var(--slate-500)] mb-4">接收事件通知的外部地址</p>
            <SettingRow label="通知 Webhook" desc="所有通知将 POST 到该地址">
              <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="h-9 w-72 bg-[var(--dark-bg)] border border-[var(--dark-border)] text-white text-sm rounded-lg px-3 outline-none focus:border-[#3366FF] placeholder:text-[var(--slate-600)]" />
            </SettingRow>
            <div className="flex justify-end mt-4">
              <button onClick={() => handleSave('notifications')} className="h-9 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />保存
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Database ── */}
      {activeTab === 'database' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#3366FF]" />数据维护
            </h3>
            <SettingRow label="数据备份" desc="上次备份: 2026-05-09 03:00">
              <button className="h-9 px-4 bg-[var(--dark-hover)] text-white text-sm rounded-lg hover:bg-[var(--dark-border)] transition-colors flex items-center gap-2 border border-[var(--dark-border)]">
                <RefreshCw className="w-4 h-4" />立即备份
              </button>
            </SettingRow>
            <SettingRow label="日志清理" desc="自动清理 30 天前的 API 日志">
              <button className="h-9 px-4 bg-[var(--dark-hover)] text-[#F59E0B] text-sm rounded-lg hover:bg-[#F59E0B]/10 transition-colors flex items-center gap-2 border border-[var(--dark-border)]">
                <Trash2 className="w-4 h-4" />清理日志
              </button>
            </SettingRow>
            <SettingRow label="缓存刷新" desc="清除所有 Redis 缓存">
              <button className="h-9 px-4 bg-[var(--dark-hover)] text-white text-sm rounded-lg hover:bg-[var(--dark-border)] transition-colors flex items-center gap-2 border border-[var(--dark-border)]">
                <RefreshCw className="w-4 h-4" />刷新缓存
              </button>
            </SettingRow>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
