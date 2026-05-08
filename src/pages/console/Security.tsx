import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  KeyRound,
  ShieldCheck,
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Globe,
  Monitor,
  Save,
  Fingerprint,
  Bell,
  History,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useMockData } from '@/hooks/useMockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface LoginHistoryEntry {
  id: string;
  time: string;
  ip: string;
  location: string;
  device: string;
  status: 'success' | 'failed';
}

const mockLoginHistory: LoginHistoryEntry[] = [
  { id: '1', time: '2024-12-20 14:32:15', ip: '203.0.113.45', location: '北京', device: 'Chrome / macOS', status: 'success' },
  { id: '2', time: '2024-12-20 09:15:30', ip: '203.0.113.100', location: '北京', device: 'Safari / iOS', status: 'success' },
  { id: '3', time: '2024-12-19 22:45:10', ip: '198.51.100.23', location: '上海', device: 'Firefox / Windows', status: 'success' },
  { id: '4', time: '2024-12-19 16:20:05', ip: '203.0.113.45', location: '北京', device: 'Chrome / macOS', status: 'success' },
  { id: '5', time: '2024-12-18 08:10:22', ip: '192.0.2.156', location: '广州', device: 'Edge / Windows', status: 'failed' },
  { id: '6', time: '2024-12-17 20:55:40', ip: '203.0.113.45', location: '北京', device: 'Chrome / macOS', status: 'success' },
];

function getPasswordStrength(password: string): { label: string; color: string; score: number } {
  if (!password) return { label: '', color: '', score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: '弱', color: '#EF4444', score: score / 5 };
  if (score <= 3) return { label: '中', color: '#F59E0B', score: score / 5 };
  if (score <= 4) return { label: '强', color: '#10B981', score: score / 5 };
  return { label: '非常强', color: '#34D399', score: score / 5 };
}

export default function Security() {
  const { getSecuritySettings } = useMockData();
  const settings = getSecuritySettings();

  const [currentEmail] = useState('admin@company.com');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [mfaEnabled, setMfaEnabled] = useState(settings.mfaEnabled);
  const [ipWhitelist, setIpWhitelist] = useState(settings.allowedIps?.join('\n') || '');
  const [alerts, setAlerts] = useState({
    login: true,
    keyChanges: true,
    creditThreshold: false,
  });
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(passwordForm.new);
  const passwordsMatch = passwordForm.new && passwordForm.confirm && passwordForm.new === passwordForm.confirm;

  const handleSave = useCallback((section: string) => {
    setSaveSuccess(section);
    setTimeout(() => setSaveSuccess(null), 3000);
  }, []);

  const showSuccessToast = (_section: string) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 text-sm text-[#10B981] mt-3"
    >
      <Check className="w-4 h-4" />
      已保存
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-space text-[36px] font-semibold text-white leading-[1.25]">安全设置</h1>
        <p className="mt-1 text-[var(--slate-400)]">管理账户安全策略，保护您的 API Key 和数据安全。</p>
      </motion.div>

      {/* Login Email */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[rgba(51,102,255,0.15)] flex items-center justify-center">
            <Mail className="w-4 h-4 text-[#3366FF]" />
          </div>
          <h2 className="font-space text-lg font-semibold text-white">登录邮箱</h2>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-[var(--dark-border)]">
          <div>
            <p className="text-sm text-white font-medium">{currentEmail}</p>
            <p className="text-xs text-[var(--slate-500)] mt-0.5">此邮箱用于登录和接收安全通知</p>
          </div>
          <button className="px-4 py-2 text-sm text-[#3366FF] border border-[#3366FF] rounded-full hover:bg-[rgba(51,102,255,0.1)] transition-colors">
            更改
          </button>
        </div>
      </motion.div>

      {/* Password Management */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(244,63,94,0.15)] flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <h2 className="font-space text-lg font-semibold text-white">密码管理</h2>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">当前密码</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                placeholder="请输入当前密码"
                className="w-full h-10 px-3 pr-10 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
              />
              <button
                onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)] hover:text-white transition-colors"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">新密码</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, new: e.target.value }))}
                placeholder="至少 8 位，包含大小写字母和数字"
                className="w-full h-10 px-3 pr-10 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors"
              />
              <button
                onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)] hover:text-white transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength Indicator */}
            {passwordForm.new && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-[var(--dark-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${passwordStrength.score * 100}%`, backgroundColor: passwordStrength.color }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-[var(--slate-300)] mb-1.5">确认新密码</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                placeholder="再次输入新密码"
                className={`w-full h-10 px-3 pr-10 bg-[var(--dark-bg)] border rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors ${
                  passwordForm.confirm && !passwordsMatch ? 'border-[#EF4444]' : 'border-[var(--dark-border)]'
                }`}
              />
              <button
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)] hover:text-white transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordForm.confirm && !passwordsMatch && (
              <p className="text-xs text-[#EF4444] mt-1">两次输入的密码不一致</p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-[#10B981] mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> 密码一致
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setPasswordForm({ current: '', new: '', confirm: '' });
              handleSave('password');
            }}
            disabled={!passwordForm.current || !passwordForm.new || !passwordsMatch}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            更新密码
          </button>
          {saveSuccess === 'password' && showSuccessToast('password')}
        </div>
      </motion.div>

      {/* 2FA Status */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>
          <h2 className="font-space text-lg font-semibold text-white">双因素认证 (2FA)</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: mfaEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)',
                  color: mfaEnabled ? '#10B981' : '#94A3B8',
                }}
              >
                {mfaEnabled ? '已启用' : '未启用'}
              </span>
            </div>
            <p className="text-xs text-[var(--slate-500)] mt-1">
              {mfaEnabled
                ? '登录时需要输入动态验证码，账户安全性更高'
                : '启用后登录时需要额外输入验证码，大幅提升账户安全性'}
            </p>
          </div>
          <button
            onClick={() => {
              setMfaEnabled(!mfaEnabled);
              handleSave('mfa');
            }}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              mfaEnabled
                ? 'text-[var(--slate-300)] border border-[var(--dark-border)] hover:bg-[var(--dark-hover)]'
                : 'text-white bg-[#3366FF] hover:bg-[#2244CC]'
            }`}
          >
            {mfaEnabled ? '配置' : '启用'}
          </button>
        </div>
        {saveSuccess === 'mfa' && showSuccessToast('mfa')}
      </motion.div>

      {/* IP Whitelist */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.15)] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div>
            <h2 className="font-space text-lg font-semibold text-white">IP 白名单</h2>
            <p className="text-xs text-[var(--slate-500)]">设置允许访问 API 的 IP 地址范围，留空表示不限制</p>
          </div>
        </div>

        <textarea
          value={ipWhitelist}
          onChange={(e) => setIpWhitelist(e.target.value)}
          placeholder={`每行一个 IP 或 CIDR，例如：
192.168.1.1
10.0.0.0/8
203.0.113.0/24`}
          rows={5}
          className="w-full px-3 py-2 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-white placeholder-[var(--slate-500)] outline-none focus:border-[#3366FF] transition-colors resize-none font-jetbrains"
        />
        <button
          onClick={() => handleSave('ip')}
          className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] active:scale-[0.97] transition-all"
        >
          <Save className="w-4 h-4" />
          保存白名单
        </button>
        {saveSuccess === 'ip' && showSuccessToast('ip')}
      </motion.div>

      {/* Login History */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="w-8 h-8 rounded-lg bg-[rgba(34,211,238,0.15)] flex items-center justify-center">
            <History className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div>
            <h2 className="font-space text-lg font-semibold text-white">登录历史</h2>
            <p className="text-xs text-[var(--slate-500)]">最近 6 次登录记录</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)] hover:bg-[var(--dark-sidebar)]">
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">时间</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">IP 地址</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">地点</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">设备</TableHead>
                <TableHead className="text-xs text-[var(--slate-400)] uppercase font-medium px-4">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLoginHistory.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={`border-b border-[var(--dark-border)] hover:bg-[var(--dark-hover)] transition-colors ${
                    entry.status === 'failed' ? 'bg-[rgba(239,68,68,0.05)]' : ''
                  }`}
                >
                  <TableCell className="px-4 text-sm text-[var(--slate-300)]">{entry.time}</TableCell>
                  <TableCell className="px-4 font-jetbrains text-sm text-[#7A9FFF]">{entry.ip}</TableCell>
                  <TableCell className="px-4 text-sm text-[var(--slate-400)] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {entry.location}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-[var(--slate-400)] flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    {entry.device}
                  </TableCell>
                  <TableCell className="px-4">
                    {entry.status === 'success' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(16,185,129,0.15)] text-[#10B981]">
                        成功
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(239,68,68,0.15)] text-[#EF4444]">
                        失败
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Security Alerts */}
      <motion.div variants={itemVariants} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[rgba(51,102,255,0.3)] transition-all">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="font-space text-lg font-semibold text-white">安全提醒</h2>
            <p className="text-xs text-[var(--slate-500)]">选择需要接收的安全通知类型</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'login' as const, label: '新设备登录提醒', desc: '检测到新设备或新地点登录时发送通知', icon: Fingerprint },
            { key: 'keyChanges' as const, label: 'API Key 变更提醒', desc: 'API Key 被创建、修改或删除时发送通知', icon: KeyRound },
            { key: 'creditThreshold' as const, label: '积分余额预警', desc: '积分余额低于设定阈值时发送通知', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isEnabled = alerts[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-3 border-b border-[var(--dark-border)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isEnabled ? 'bg-[rgba(51,102,255,0.15)]' : 'bg-[var(--dark-hover)]'}`}>
                    <Icon className={`w-4 h-4 ${isEnabled ? 'text-[#3366FF]' : 'text-[var(--slate-500)]'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-xs text-[var(--slate-500)]">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAlerts((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                    handleSave(`alert-${item.key}`);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    isEnabled ? 'bg-[#3366FF]' : 'bg-[var(--slate-600)]'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: isEnabled ? '22px' : '2px' }}
                  />
                </button>
              </div>
            );
          })}
        </div>
        {saveSuccess?.startsWith('alert-') && showSuccessToast('alerts')}
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants} className="bg-[rgba(244,63,94,0.05)] border border-[rgba(244,63,94,0.3)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(244,63,94,0.15)] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <h2 className="font-space text-lg font-semibold text-[#F43F5E]">危险操作</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[rgba(244,63,94,0.15)]">
            <div>
              <p className="text-sm text-white font-medium">导出所有数据</p>
              <p className="text-xs text-[var(--slate-500)]">导出您的所有配置、日志和设置数据</p>
            </div>
            <button className="px-4 py-2 text-sm text-[#3366FF] border border-[#3366FF] rounded-full hover:bg-[rgba(51,102,255,0.1)] transition-colors">
              导出数据
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-white font-medium">退出所有设备</p>
              <p className="text-xs text-[var(--slate-500)]">强制所有已登录设备退出登录</p>
            </div>
            <button className="px-4 py-2 text-sm text-[#F43F5E] border border-[#F43F5E] rounded-full hover:bg-[rgba(244,63,94,0.1)] transition-colors">
              退出所有设备
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
