import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Home,
  Tag,
  FileText,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Link,
} from 'lucide-react';
import { useCmsConfig, defaultCmsConfig, type CmsConfig, type CmsPricingModel, type CmsPricingFaq, type CmsFeatureConfig } from '@/hooks/useCmsConfig';

const iconOptions = ['Zap', 'Route', 'Clock', 'Shield', 'Coins', 'Activity', 'Brain', 'Image', 'Video', 'AudioLines', 'Hash', 'Sparkles'];

const categoryOptions: CmsPricingModel['category'][] = ['text', 'image', 'video', 'embedding', 'audio'];

/* ================================================================== */
/*  Section Card                                                      */
/* ================================================================== */
function SectionCard({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--dark-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#3366FF]" />
          </div>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[var(--slate-500)]" /> : <ChevronDown className="w-4 h-4 text-[var(--slate-500)]" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[var(--dark-border)] pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  Input Components                                                  */
/* ================================================================== */
function TextInput({ label, value, onChange, placeholder = '', type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-[12px] text-[var(--slate-400)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF]"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = '', rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-[12px] text-[var(--slate-400)] mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] resize-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? 'bg-[#3366FF]' : 'bg-[var(--slate-600)]'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-[var(--slate-300)]">{label}</span>
    </label>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */
export default function CmsSettings() {
  const { config, setConfig, resetConfig } = useCmsConfig();
  const [draft, setDraft] = useState<CmsConfig>(config);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'site' | 'home' | 'pricing' | 'docs'>('site');

  // Keep draft in sync when switching
  const updateDraft = useCallback((updater: (d: CmsConfig) => CmsConfig) => {
    setDraft((prev) => {
      const next = updater(prev);
      return { ...next };
    });
    setSaved(false);
  }, []);

  const handleSave = () => {
    setConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetConfig();
    setDraft({ ...defaultCmsConfig, _updatedAt: new Date().toISOString() });
    setShowResetConfirm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // --- Pricing helpers ---
  const updateModel = (idx: number, patch: Partial<CmsPricingModel>) => {
    updateDraft((d) => {
      const models = [...d.pricing.models];
      models[idx] = { ...models[idx], ...patch };
      d.pricing.models = models;
      return d;
    });
  };

  const removeModel = (idx: number) => {
    updateDraft((d) => {
      d.pricing.models = d.pricing.models.filter((_, i) => i !== idx);
      return d;
    });
  };

  const addModel = () => {
    updateDraft((d) => {
      d.pricing.models.push({
        id: `model-${Date.now()}`,
        model: '新模型',
        provider: 'OpenAI',
        category: 'text',
        inputPrice: 0,
        outputPrice: null,
        imagePrice: null,
        videoPrice: null,
        note: '',
      });
      return d;
    });
  };

  // --- FAQ helpers ---
  const updateFaq = (idx: number, patch: Partial<CmsPricingFaq>) => {
    updateDraft((d) => {
      const faq = [...d.pricing.faq];
      faq[idx] = { ...faq[idx], ...patch };
      d.pricing.faq = faq;
      return d;
    });
  };

  const removeFaq = (idx: number) => {
    updateDraft((d) => {
      d.pricing.faq = d.pricing.faq.filter((_, i) => i !== idx);
      return d;
    });
  };

  const addFaq = () => {
    updateDraft((d) => {
      d.pricing.faq.push({ question: '新问题', answer: '回答内容...' });
      return d;
    });
  };

  // --- Feature helpers ---
  const updateFeature = (idx: number, patch: Partial<CmsFeatureConfig>) => {
    updateDraft((d) => {
      const features = [...d.home.features];
      features[idx] = { ...features[idx], ...patch };
      d.home.features = features;
      return d;
    });
  };

  const removeFeature = (idx: number) => {
    updateDraft((d) => {
      d.home.features = d.home.features.filter((_, i) => i !== idx);
      return d;
    });
  };

  const addFeature = () => {
    updateDraft((d) => {
      d.home.features.push({ title: '新功能', description: '功能描述...', icon: 'Zap' });
      return d;
    });
  };

  // --- Stats helpers ---
  const updateStat = (idx: number, patch: { label?: string; value?: string; suffix?: string }) => {
    updateDraft((d) => {
      const stats = [...d.home.hero.stats];
      stats[idx] = { ...stats[idx], ...patch };
      d.home.hero.stats = stats;
      return d;
    });
  };

  const tabs = [
    { key: 'site' as const, label: '网站基础', icon: Globe },
    { key: 'home' as const, label: '首页管理', icon: Home },
    { key: 'pricing' as const, label: '价格管理', icon: Tag },
    { key: 'docs' as const, label: '帮助文档', icon: FileText },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-semibold text-white tracking-tight">内容管理 (CMS)</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">管理官网首页、价格页、帮助文档等内容，修改后即时生效</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="h-10 px-4 border border-[var(--dark-border)] text-[var(--slate-300)] text-sm rounded-lg hover:bg-[var(--dark-hover)] transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> 恢复默认
          </button>
          <button
            onClick={handleSave}
            className="h-10 px-4 bg-[#3366FF] text-white text-sm font-medium rounded-lg hover:bg-[#2244CC] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? <><Check className="w-4 h-4" /> 已保存</> : '保存配置'}
          </button>
        </div>
      </div>

      {/* Preview link */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--slate-400)]">预览效果：</span>
        <a href="/#/home" target="_blank" rel="noreferrer" className="text-[#3366FF] hover:underline flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> 首页
        </a>
        <a href="/#/pricing" target="_blank" rel="noreferrer" className="text-[#3366FF] hover:underline flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> 价格页
        </a>
        <a href="/#/docs" target="_blank" rel="noreferrer" className="text-[#3366FF] hover:underline flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> 帮助文档
        </a>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === t.key ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Site Settings ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'site' && (
          <motion.div key="site" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <SectionCard title="网站基础信息" icon={Globe} defaultOpen>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="网站名称" value={draft.site.name} onChange={(v) => updateDraft((d) => { d.site.name = v; return d; })} placeholder="AI Nexus" />
                <TextInput label="Logo 路径" value={draft.site.logo} onChange={(v) => updateDraft((d) => { d.site.logo = v; return d; })} placeholder="/logo.svg" />
                <TextInput label="Slogan / 标语" value={draft.site.tagline} onChange={(v) => updateDraft((d) => { d.site.tagline = v; return d; })} placeholder="一站式大模型聚合平台" />
                <TextInput label="联系邮箱" value={draft.site.contactEmail} onChange={(v) => updateDraft((d) => { d.site.contactEmail = v; return d; })} placeholder="support@ainexus.com" />
                <TextInput label="联系电话" value={draft.site.contactPhone} onChange={(v) => updateDraft((d) => { d.site.contactPhone = v; return d; })} placeholder="400-888-0000" />
                <TextInput label="ICP 备案号" value={draft.site.icp} onChange={(v) => updateDraft((d) => { d.site.icp = v; return d; })} placeholder="" />
              </div>
              <div className="mt-4">
                <TextArea label="Footer 版权文字" value={draft.site.footerText} onChange={(v) => updateDraft((d) => { d.site.footerText = v; return d; })} placeholder=" 2024 AI Nexus. All rights reserved." rows={2} />
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Home Settings ── */}
        {activeTab === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Hero */}
            <SectionCard title="首页 Hero 区域" icon={Home} defaultOpen>
              <div className="space-y-4">
                <TextArea label="主标题" value={draft.home.hero.title} onChange={(v) => updateDraft((d) => { d.home.hero.title = v; return d; })} placeholder="输入主标题..." rows={2} />
                <TextArea label="副标题" value={draft.home.hero.subtitle} onChange={(v) => updateDraft((d) => { d.home.hero.subtitle = v; return d; })} placeholder="输入副标题..." rows={3} />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="主按钮文字" value={draft.home.hero.ctaPrimary} onChange={(v) => updateDraft((d) => { d.home.hero.ctaPrimary = v; return d; })} placeholder="免费开始" />
                  <TextInput label="次按钮文字" value={draft.home.hero.ctaSecondary} onChange={(v) => updateDraft((d) => { d.home.hero.ctaSecondary = v; return d; })} placeholder="查看价格" />
                </div>
                <div className="mt-2">
                  <label className="block text-[12px] text-[var(--slate-400)] mb-2">数据统计</label>
                  <div className="grid grid-cols-4 gap-3">
                    {draft.home.hero.stats.map((s, i) => (
                      <div key={i} className="space-y-2 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-3">
                        <TextInput label="标签" value={s.label} onChange={(v) => updateStat(i, { label: v })} placeholder="标签" />
                        <TextInput label="数值" value={s.value} onChange={(v) => updateStat(i, { value: v })} placeholder="数值" />
                        <TextInput label="后缀" value={s.suffix || ''} onChange={(v) => updateStat(i, { suffix: v })} placeholder="+ / %" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Features */}
            <SectionCard title="功能特性" icon={Home}>
              <div className="space-y-3">
                {draft.home.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-3">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <TextInput label="标题" value={f.title} onChange={(v) => updateFeature(i, { title: v })} placeholder="功能标题" />
                      <TextInput label="描述" value={f.description} onChange={(v) => updateFeature(i, { description: v })} placeholder="功能描述" />
                      <div>
                        <label className="block text-[12px] text-[var(--slate-400)] mb-1.5">图标</label>
                        <select
                          value={f.icon}
                          onChange={(e) => updateFeature(i, { icon: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                        >
                          {iconOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => removeFeature(i)} className="mt-6 p-1.5 rounded-lg text-[var(--slate-500)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addFeature} className="w-full h-10 rounded-lg border border-dashed border-[var(--dark-border)] text-[var(--slate-400)] hover:text-white hover:border-[#3366FF] transition-colors flex items-center justify-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> 添加功能
                </button>
              </div>
            </SectionCard>

            {/* Section Toggles */}
            <SectionCard title="区块显示控制" icon={Home}>
              <div className="space-y-3">
                <Toggle label="显示合作伙伴 Logo" checked={draft.home.showPartners} onChange={(v) => updateDraft((d) => { d.home.showPartners = v; return d; })} />
                <Toggle label="显示三步接入" checked={draft.home.showSteps} onChange={(v) => updateDraft((d) => { d.home.showSteps = v; return d; })} />
                <Toggle label="显示控制台预览" checked={draft.home.showPreview} onChange={(v) => updateDraft((d) => { d.home.showPreview = v; return d; })} />
                <Toggle label="显示用户评价" checked={draft.home.showTestimonials} onChange={(v) => updateDraft((d) => { d.home.showTestimonials = v; return d; })} />
                <Toggle label="显示 FAQ" checked={draft.home.showFaq} onChange={(v) => updateDraft((d) => { d.home.showFaq = v; return d; })} />
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Pricing Settings ── */}
        {activeTab === 'pricing' && (
          <motion.div key="pricing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Page Info */}
            <SectionCard title="价格页基础信息" icon={Tag} defaultOpen>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="页面标题" value={draft.pricing.pageTitle} onChange={(v) => updateDraft((d) => { d.pricing.pageTitle = v; return d; })} />
                <TextInput label="兑换比例" value={String(draft.pricing.exchangeRate)} onChange={(v) => updateDraft((d) => { d.pricing.exchangeRate = parseFloat(v) || 0.1; return d; })} placeholder="1元=X积分" />
              </div>
              <div className="mt-4">
                <TextArea label="页面副标题" value={draft.pricing.pageSubtitle} onChange={(v) => updateDraft((d) => { d.pricing.pageSubtitle = v; return d; })} rows={2} />
              </div>
              <div className="mt-4">
                <TextArea label="底部通知文字" value={draft.pricing.notice} onChange={(v) => updateDraft((d) => { d.pricing.notice = v; return d; })} rows={2} />
              </div>
            </SectionCard>

            {/* Model Pricing Table */}
            <SectionCard title="模型价格表" icon={Tag}>
              <div className="space-y-3">
                {draft.pricing.models.map((m, i) => (
                  <div key={m.id} className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--slate-500)] font-jetbrains">{m.id}</span>
                      <button onClick={() => removeModel(i)} className="p-1.5 rounded-lg text-[var(--slate-500)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <TextInput label="模型名称" value={m.model} onChange={(v) => updateModel(i, { model: v })} />
                      <TextInput label="供应商" value={m.provider} onChange={(v) => updateModel(i, { provider: v })} />
                      <div>
                        <label className="block text-[12px] text-[var(--slate-400)] mb-1.5">类型</label>
                        <select
                          value={m.category}
                          onChange={(e) => updateModel(i, { category: e.target.value as CmsPricingModel['category'] })}
                          className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                        >
                          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <TextInput label="备注" value={m.note} onChange={(v) => updateModel(i, { note: v })} />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <TextInput label="输入价格" value={m.inputPrice !== null ? String(m.inputPrice) : ''} onChange={(v) => updateModel(i, { inputPrice: v ? parseFloat(v) : null })} placeholder="留空表示不适用" />
                      <TextInput label="输出价格" value={m.outputPrice !== null ? String(m.outputPrice) : ''} onChange={(v) => updateModel(i, { outputPrice: v ? parseFloat(v) : null })} placeholder="留空表示不适用" />
                      <TextInput label="图片价格" value={m.imagePrice !== null ? String(m.imagePrice) : ''} onChange={(v) => updateModel(i, { imagePrice: v ? parseFloat(v) : null })} placeholder="留空表示不适用" />
                      <TextInput label="视频价格" value={m.videoPrice !== null ? String(m.videoPrice) : ''} onChange={(v) => updateModel(i, { videoPrice: v ? parseFloat(v) : null })} placeholder="留空表示不适用" />
                    </div>
                  </div>
                ))}
                <button onClick={addModel} className="w-full h-10 rounded-lg border border-dashed border-[var(--dark-border)] text-[var(--slate-400)] hover:text-white hover:border-[#3366FF] transition-colors flex items-center justify-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> 添加模型
                </button>
              </div>
            </SectionCard>

            {/* FAQ */}
            <SectionCard title="常见问题 (FAQ)" icon={Tag}>
              <div className="space-y-3">
                {draft.pricing.faq.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg p-3">
                    <div className="flex-1 space-y-2">
                      <TextInput label={`问题 ${i + 1}`} value={f.question} onChange={(v) => updateFaq(i, { question: v })} />
                      <TextArea label="回答" value={f.answer} onChange={(v) => updateFaq(i, { answer: v })} rows={2} />
                    </div>
                    <button onClick={() => removeFaq(i)} className="mt-6 p-1.5 rounded-lg text-[var(--slate-500)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addFaq} className="w-full h-10 rounded-lg border border-dashed border-[var(--dark-border)] text-[var(--slate-400)] hover:text-white hover:border-[#3366FF] transition-colors flex items-center justify-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> 添加 FAQ
                </button>
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Docs Settings ── */}
        {activeTab === 'docs' && (
          <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <SectionCard title="帮助文档配置" icon={FileText} defaultOpen>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-[var(--slate-400)] mb-1.5">文档模式</label>
                    <select
                      value={draft.docs.type}
                      onChange={(e) => updateDraft((d) => { d.docs.type = e.target.value as 'internal' | 'feishu'; return d; })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-sm text-white focus:outline-none focus:border-[#3366FF]"
                    >
                      <option value="internal">内置文档（本系统）</option>
                      <option value="feishu">飞书文档（外部链接）</option>
                    </select>
                  </div>
                  <TextInput label="页面标题" value={draft.docs.pageTitle} onChange={(v) => updateDraft((d) => { d.docs.pageTitle = v; return d; })} />
                </div>
                <TextArea label="页面副标题" value={draft.docs.pageSubtitle} onChange={(v) => updateDraft((d) => { d.docs.pageSubtitle = v; return d; })} rows={2} />

                {draft.docs.type === 'feishu' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 p-4 rounded-lg bg-[#3366FF]/5 border border-[#3366FF]/20">
                    <TextInput label="飞书文档链接" value={draft.docs.feishuUrl} onChange={(v) => updateDraft((d) => { d.docs.feishuUrl = v; return d; })} placeholder="https://xxxxx.feishu.cn/docx/xxxxx" />
                    <div className="flex items-center gap-2 text-[12px] text-[var(--slate-500)]">
                      <Link className="w-3.5 h-3.5" />
                      <span>配置后，用户访问「API 文档」页将自动跳转到此飞书链接</span>
                    </div>
                    {draft.docs.feishuUrl && (
                      <a href={draft.docs.feishuUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[#3366FF] hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> 测试跳转
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setShowResetConfirm(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl shadow-2xl z-[110] p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#F43F5E] mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">确认恢复默认？</h3>
                  <p className="text-[12px] text-[var(--slate-400)] mt-1">此操作将清除所有自定义配置，恢复到系统默认状态，不可撤销。</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 h-10 rounded-lg text-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] transition-colors border border-[var(--dark-border)]">取消</button>
                <button onClick={handleReset} className="flex-1 h-10 rounded-lg bg-[#F43F5E] text-white text-sm font-medium hover:bg-[#DC2626] transition-colors">确认恢复</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
