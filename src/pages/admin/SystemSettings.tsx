import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Zap, Bell, Wrench, AlertTriangle, Check } from 'lucide-react';

const STORAGE_KEY = 'ainexus_system_settings';

const defaultSystemSettings: Record<string, string> = {
  platformName: 'AI Nexus',
  logRetentionDays: '30',
  defaultRateLimit: '1000',
  defaultTaskTimeout: '300',
  smtpHost: 'smtp.example.com',
  smtpPort: '587',
  smtpUsername: 'noreply@ainexus.com',
  smtpPassword: 'encrypted_password',
  smtpSender: 'AI Nexus <noreply@ainexus.com>',
  emailAlerts: 'true',
  webhookAlerts: 'false',
  webhookUrl: '',
  maintenanceMode: 'false',
  maintenanceTitle: '系统维护中',
  maintenanceMessage: '我们正在升级系统，请稍后再试。',
  failRateAlertThreshold: '5',
  responseTimeAlertThreshold: '5000',
  queueAlertThreshold: '50',
  defaultLanguage: 'zh-CN',
  timezone: 'Asia/Shanghai',
  workspaceRateLimit: '100',
  ipRateLimit: '50',
  burstLimit: '10',
  rateLimitResponse: '429+retry',
  useTls: 'true',
};

function loadSettings(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string>;
      return { ...defaultSystemSettings, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaultSystemSettings };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(loadSettings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: prev[key] === 'true' ? 'false' : 'true' }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: typeof Globe; title: string; subtitle?: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#3366FF]" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--slate-400)]">{subtitle}</p>}
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, type = 'text', placeholder, description }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    description?: string;
  }) => (
    <div>
      <label className="block text-xs text-[var(--slate-400)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
      />
      {description && <p className="mt-1 text-xs text-[var(--slate-500)]">{description}</p>}
    </div>
  );

  const ToggleField = ({ label, value, onChange, description }: {
    label: string;
    value: boolean;
    onChange: () => void;
    description?: string;
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-white">{label}</p>
        {description && <p className="text-xs text-[var(--slate-500)]">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#3366FF]' : 'bg-[var(--slate-600)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">系统设置</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">管理系统级参数和全局配置</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-5 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? '保存中...' : saved ? '已保存' : '保存设置'}
        </button>
      </div>

      {/* Basic Config */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <SectionTitle icon={Globe} title="基础配置" />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField label="平台名称" value={settings.platformName} onChange={(v) => handleChange('platformName', v)} />
          <InputField label="客服邮箱" value={settings.smtpSender} onChange={(v) => handleChange('smtpSender', v)} type="email" />
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1.5">默认语言</label>
            <select
              value={settings.defaultLanguage || 'zh-CN'}
              onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1.5">时区</label>
            <select
              value={settings.timezone || 'Asia/Shanghai'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
            >
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rate Limit */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <SectionTitle icon={Zap} title="API 限流策略" />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="全局 QPS 限制"
            value={settings.defaultRateLimit}
            onChange={(v) => handleChange('defaultRateLimit', v)}
            type="number"
            description="请求/秒"
          />
          <InputField
            label="单工作区 QPS 限制"
            value={settings.workspaceRateLimit || '100'}
            onChange={(v) => handleChange('workspaceRateLimit', v)}
            type="number"
            description="请求/秒"
          />
          <InputField
            label="单 IP QPS 限制"
            value={settings.ipRateLimit || '50'}
            onChange={(v) => handleChange('ipRateLimit', v)}
            type="number"
            description="请求/秒"
          />
          <InputField
            label="Burst 限制"
            value={settings.burstLimit || '10'}
            onChange={(v) => handleChange('burstLimit', v)}
            type="number"
            description="允许的突发请求数"
          />
          <div>
            <label className="block text-xs text-[var(--slate-400)] mb-1.5">限流响应</label>
            <select
              value={settings.rateLimitResponse || '429+retry'}
              onChange={(e) => handleChange('rateLimitResponse', e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
            >
              <option value="429+retry">429 + Retry-After</option>
              <option value="429">429</option>
              <option value="503">503</option>
            </select>
          </div>
          <InputField
            label="默认任务超时"
            value={settings.defaultTaskTimeout}
            onChange={(v) => handleChange('defaultTaskTimeout', v)}
            type="number"
            description="秒"
          />
        </div>
        <button onClick={handleSave} className="mt-4 h-9 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors">
          保存限流策略
        </button>
      </div>

      {/* Notification */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <SectionTitle icon={Bell} title="通知配置" />
        <div className="space-y-4 mb-5">
          <h4 className="text-sm font-medium text-white">SMTP 配置</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField label="SMTP 服务器" value={settings.smtpHost} onChange={(v) => handleChange('smtpHost', v)} />
            <InputField label="端口" value={settings.smtpPort} onChange={(v) => handleChange('smtpPort', v)} type="number" />
            <InputField label="用户名" value={settings.smtpUsername} onChange={(v) => handleChange('smtpUsername', v)} />
            <InputField label="密码" value={settings.smtpPassword} onChange={(v) => handleChange('smtpPassword', v)} type="password" />
            <InputField label="发件人" value={settings.smtpSender} onChange={(v) => handleChange('smtpSender', v)} />
            <div className="flex items-end">
              <ToggleField label="使用 TLS" value={settings.useTls === 'true'} onChange={() => handleToggle('useTls')} />
            </div>
          </div>
          <button className="h-8 px-3 border border-[#3366FF] text-[#3366FF] text-xs rounded-lg hover:bg-[#3366FF]/10 transition-colors">
            测试连接
          </button>
        </div>

        <div className="border-t border-[var(--dark-border)] pt-4 space-y-4">
          <h4 className="text-sm font-medium text-white">告警阈值</h4>
          <div className="grid sm:grid-cols-3 gap-4">
            <InputField
              label="失败率告警阈值"
              value={settings.failRateAlertThreshold}
              onChange={(v) => handleChange('failRateAlertThreshold', v)}
              type="number"
              description="%"
            />
            <InputField
              label="响应时间告警阈值"
              value={settings.responseTimeAlertThreshold}
              onChange={(v) => handleChange('responseTimeAlertThreshold', v)}
              type="number"
              description="ms"
            />
            <InputField
              label="队列拥堵告警阈值"
              value={settings.queueAlertThreshold}
              onChange={(v) => handleChange('queueAlertThreshold', v)}
              type="number"
              description="排队任务数"
            />
          </div>
        </div>

        <div className="border-t border-[var(--dark-border)] pt-4 space-y-3">
          <h4 className="text-sm font-medium text-white">通知渠道</h4>
          <ToggleField label="邮件通知" value={settings.emailAlerts === 'true'} onChange={() => handleToggle('emailAlerts')} />
          <ToggleField label="Webhook 通知" value={settings.webhookAlerts === 'true'} onChange={() => handleToggle('webhookAlerts')} />
          {settings.webhookAlerts === 'true' && (
            <InputField label="Webhook URL" value={settings.webhookUrl || ''} onChange={(v) => handleChange('webhookUrl', v)} placeholder="https://..." />
          )}
        </div>
        <button onClick={handleSave} className="mt-4 h-9 px-4 bg-[#3366FF] text-white text-sm rounded-lg hover:bg-[#2244CC] transition-colors">
          保存通知设置
        </button>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-[var(--dark-card)] border border-[#FBBF24]/30 rounded-xl p-6">
        <SectionTitle icon={Wrench} title="维护模式" />
        <div className="space-y-4">
          <ToggleField
            label="开启维护模式"
            value={settings.maintenanceMode === 'true'}
            onChange={() => handleToggle('maintenanceMode')}
            description="维护模式下所有 API 请求将返回 503 错误"
          />
          {settings.maintenanceMode === 'true' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-[#FBBF24] flex-shrink-0" />
                <span className="text-xs text-[#FBBF24]">维护模式下所有 API 请求将返回 503 错误，请谨慎使用</span>
              </div>
              <InputField
                label="维护页面标题"
                value={settings.maintenanceTitle}
                onChange={(v) => handleChange('maintenanceTitle', v)}
              />
              <div>
                <label className="block text-xs text-[var(--slate-400)] mb-1.5">维护页面描述</label>
                <textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF] resize-none"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Log Retention */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
        <SectionTitle icon={Globe} title="日志保留" />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="默认日志保留天数"
            value={settings.logRetentionDays}
            onChange={(v) => handleChange('logRetentionDays', v)}
            type="number"
            description="天"
          />
        </div>
      </div>

      {/* Global Save */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-[#34D399] flex items-center gap-1">
            <Check className="w-4 h-4" /> 设置已保存
          </motion.span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-6 bg-[#3366FF] text-white text-sm font-medium rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? '保存中...' : <><Save className="w-4 h-4" /> 保存所有设置</>}
        </button>
      </div>
    </motion.div>
  );
}
