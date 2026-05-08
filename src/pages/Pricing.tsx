import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Wallet,
  Calculator,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Save,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCmsConfigReadonly } from '@/hooks/useCmsConfig';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, duration = 600, prefix = '', suffix = '' }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <span>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing data - now loaded from CMS config                          */
/* ------------------------------------------------------------------ */

const categoryTabs = [
  { key: 'all', label: '全部' },
  { key: 'text', label: '文本对话' },
  { key: 'image', label: '图片生成' },
  { key: 'video', label: '视频生成' },
  { key: 'embedding', label: 'Embedding' },
  { key: 'audio', label: '语音' },
];

const comparisonData = [
  { scenario: 'GPT-4o 100万 tokens', direct: '¥150', ainexus: '¥120', highlight: '节省 ¥30/月' },
  { scenario: 'Claude + GPT 双供应商', direct: '维护两套代码', ainexus: '一套代码', highlight: '开发效率提升' },
  { scenario: '多模型切换', direct: '手动切换', ainexus: '自动路由', highlight: '智能调度' },
  { scenario: '故障处理', direct: '自行处理', ainexus: '自动降级', highlight: '高可用保障' },
  { scenario: '月度管理时间', direct: '8+ 小时', ainexus: '< 1 小时', highlight: '省时 87%' },
];

const comparisonChartData = [
  { name: '1万 tokens', direct: 1.5, ainexus: 1.2 },
  { name: '10万 tokens', direct: 15, ainexus: 12 },
  { name: '50万 tokens', direct: 75, ainexus: 54 },
  { name: '100万 tokens', direct: 150, ainexus: 102 },
  { name: '500万 tokens', direct: 750, ainexus: 450 },
];

/* FAQ now loaded from CMS config */

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                 */
/* ------------------------------------------------------------------ */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-[var(--dark-border)] rounded-xl bg-[var(--dark-bg)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--dark-hover)] transition-colors"
      >
        <span className="text-body text-white font-medium pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-[var(--slate-400)] flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.3 }, opacity: { duration: 0.2 } }}
          >
            <div className="px-5 pb-5 text-body-sm text-[var(--slate-400)] leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calculator Slider                                                  */
/* ------------------------------------------------------------------ */
function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  step?: number;
  unit: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-body-sm font-medium text-[var(--slate-300)]">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
            className="w-28 h-9 px-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] text-body-sm text-white text-right focus:outline-none focus:border-[#3366FF] transition-colors"
          />
          <span className="text-caption text-[var(--slate-500)] w-16">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #3366FF ${((value - min) / (max - min)) * 100}%, var(--dark-border) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function Pricing() {
  const cms = useCmsConfigReadonly();
  const modelPricingData = cms.pricing.models;
  const faqItems = cms.pricing.faq;
  const pageTitle = cms.pricing.pageTitle;
  const pageSubtitle = cms.pricing.pageSubtitle;

  const [activeCategory, setActiveCategory] = useState('all');
  const [billingMode, setBillingMode] = useState<'payg' | 'package'>('payg');

  /* Calculator state */
  const [textCalls, setTextCalls] = useState(50000);
  const [avgTokens, setAvgTokens] = useState(2000);
  const [imageCount, setImageCount] = useState(500);
  const [videoSeconds, setVideoSeconds] = useState(60);

  /* Debounced calculator values */
  const [calcValues, setCalcValues] = useState({ textCalls: 50000, avgTokens: 2000, imageCount: 500, videoSeconds: 60 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updateCalc = useCallback((updates: Partial<typeof calcValues>) => {
    const next = { ...calcValues, ...updates };
    setTextCalls(next.textCalls);
    setAvgTokens(next.avgTokens);
    setImageCount(next.imageCount);
    setVideoSeconds(next.videoSeconds);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCalcValues(next);
    }, 300);
  }, [calcValues]);

  const filteredModels = activeCategory === 'all'
    ? modelPricingData
    : modelPricingData.filter((m) => m.category === activeCategory);

  /* Calculator math */
  const totalTokens = calcValues.textCalls * calcValues.avgTokens;
  const textCredits = Math.floor((totalTokens / 1000) * 80); // avg 80 credits per 1K tokens
  const imageCredits = calcValues.imageCount * 350; // avg 350 credits per image
  const videoCredits = calcValues.videoSeconds * 900; // avg 900 credits per second
  const totalCredits = textCredits + imageCredits + videoCredits;
  const estimatedCost = totalCredits * 0.001; // 1 credit ≈ ¥0.001
  const savingsPercent = 20;

  return (
    <div className="min-h-[100dvh] bg-[var(--dark-bg)] pt-32 pb-20">
      {/* ====== HERO ====== */}
      <section className="relative px-6 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(51,102,255,0.05) 0%, transparent 60%)' }}
        />
        <div className="max-w-container mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3366FF] text-white text-caption font-medium mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            定价方案
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-space text-h1 text-white"
          >
            {pageTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 text-body-lg text-[var(--slate-400)] max-w-[600px] mx-auto"
          >
            {pageSubtitle}
          </motion.p>
        </div>
      </section>

      {/* ====== PRICING MODEL TOGGLE ====== */}
      <section className="bg-[var(--dark-card)]">
        <div className="max-w-container mx-auto px-6 py-20">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-space text-h2 text-white">积分制计费，一目了然</h2>
              {/* Billing mode toggle */}
              <div className="inline-flex items-center gap-1 p-1 bg-[var(--dark-bg)] rounded-full mt-8">
                <button
                  onClick={() => setBillingMode('payg')}
                  className={`px-6 py-2.5 rounded-full text-body-sm font-medium transition-all ${
                    billingMode === 'payg' ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white'
                  }`}
                >
                  按量计费
                </button>
                <button
                  onClick={() => setBillingMode('package')}
                  className={`px-6 py-2.5 rounded-full text-body-sm font-medium transition-all ${
                    billingMode === 'package' ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-400)] hover:text-white'
                  }`}
                >
                  套餐计费
                </button>
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Coins,
                color: '#3366FF',
                title: '积分是什么',
                desc: '积分是 AI Nexus 平台的虚拟货币。不同类型的 API 调用消耗不同数量的积分。1 积分的价值约等于 ¥0.001-0.01，根据模型类型有所不同。',
              },
              {
                icon: Wallet,
                color: '#34D399',
                title: '如何获得积分',
                desc: '新用户注册自动获得 1000 积分免费额度。之后可通过在线充值（支付宝/微信）或线下对公转账购买积分。大额充值享受阶梯折扣。',
              },
              {
                icon: Calculator,
                color: '#A855F7',
                title: '积分消耗规则',
                desc: '文本模型按 token 数量计费，图片模型按生成张数计费，视频模型按生成时长计费。每次调用的积分消耗在响应头中返回，完全透明。',
              },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.15}>
                <div
                  className="bg-[var(--dark-bg)] rounded-xl p-8 h-full"
                  style={{ borderTop: `3px solid ${card.color}` }}
                >
                  <card.icon className="w-8 h-8 mb-4" style={{ color: card.color }} />
                  <h4 className="font-space text-h4 text-white mb-3">{card.title}</h4>
                  <p className="text-body-sm text-[var(--slate-400)] leading-relaxed">{card.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ====== MODEL PRICING TABLE ====== */}
      <section className="bg-[var(--dark-bg)]">
        <div className="max-w-container mx-auto px-6 py-24">
          <FadeIn>
            <h2 className="font-space text-h2 text-white text-center">模型价格一览</h2>
          </FadeIn>

          {/* Category tabs */}
          <FadeIn delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-5 py-2 rounded-full text-body-sm font-medium transition-all ${
                    activeCategory === tab.key
                      ? 'bg-[#3366FF] text-white'
                      : 'bg-[var(--dark-card)] text-[var(--slate-400)] hover:text-white border border-[var(--dark-border)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Pricing table */}
          <FadeIn delay={0.2}>
            <div className="mt-10 overflow-x-auto">
              <AnimatePresence mode="wait">
                <motion.table
                  key={activeCategory}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-left"
                >
                  <thead>
                    <tr className="bg-[var(--dark-sidebar)]">
                      <th className="py-3 px-5 text-caption text-[var(--slate-400)] uppercase rounded-tl-lg">模型名称</th>
                      <th className="py-3 px-5 text-caption text-[var(--slate-400)] uppercase">供应商</th>
                      <th className="py-3 px-5 text-caption text-[var(--slate-400)] uppercase">输入积分/1K tokens</th>
                      <th className="py-3 px-5 text-caption text-[var(--slate-400)] uppercase">输出积分/1K tokens</th>
                      <th className="py-3 px-5 text-caption text-[var(--slate-400)] uppercase rounded-tr-lg">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--dark-border)]">
                    {filteredModels.map((m, idx) => (
                      <motion.tr
                        key={m.model}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-[var(--dark-bg)] hover:bg-[var(--dark-hover)] transition-colors"
                      >
                        <td className="py-3 px-5 text-body-sm text-white font-medium">{m.model}</td>
                        <td className="py-3 px-5 text-body-sm text-[var(--slate-400)]">{m.provider}</td>
                        <td className="py-3 px-5 font-jetbrains text-mono-data text-[#7A9FFF]">
                          {m.inputPrice ?? '-'}
                        </td>
                        <td className="py-3 px-5 font-jetbrains text-mono-data text-[#7A9FFF]">
                          {m.outputPrice ?? (m.imagePrice ? `${m.imagePrice}/张` : m.videoPrice ? `${m.videoPrice}/秒` : '-')}
                        </td>
                        <td className="py-3 px-5">
                          <span className="inline-block px-3 py-1 rounded-full bg-[var(--dark-card)] text-caption text-[var(--slate-400)] border border-[var(--dark-border)]">
                            {m.note}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>
              </AnimatePresence>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ====== COST CALCULATOR ====== */}
      <section className="bg-[var(--dark-card)]">
        <div className="max-w-[800px] mx-auto px-6 py-20">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-space text-h2 text-white">成本估算</h2>
              <p className="mt-2 text-body text-[var(--slate-400)]">根据您的使用场景，估算每月所需积分</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-8">
              <SliderInput
                label="每月文本 API 调用次数"
                value={textCalls}
                onChange={(v) => updateCalc({ textCalls: v })}
                max={1000000}
                step={1000}
                unit="次/月"
              />
              <SliderInput
                label="平均每次调用 token 数"
                value={avgTokens}
                onChange={(v) => updateCalc({ avgTokens: v })}
                max={8000}
                step={100}
                unit="tokens"
              />
              <SliderInput
                label="每月图片生成张数"
                value={imageCount}
                onChange={(v) => updateCalc({ imageCount: v })}
                max={100000}
                step={100}
                unit="张/月"
              />
              <SliderInput
                label="每月视频生成秒数"
                value={videoSeconds}
                onChange={(v) => updateCalc({ videoSeconds: v })}
                max={10000}
                step={10}
                unit="秒/月"
              />
            </div>
          </FadeIn>

          {/* Result card */}
          <FadeIn delay={0.3}>
            <div className="mt-10 bg-[var(--dark-bg)] rounded-2xl p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-caption text-[var(--slate-500)] uppercase mb-2">每月积分消耗</p>
                  <p className="font-jetbrains text-[36px] font-semibold text-[#7A9FFF]">
                    <CountUp target={totalCredits} />
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-caption text-[var(--slate-500)] uppercase mb-2">预估费用</p>
                  <p className="font-jetbrains text-[36px] font-semibold text-[#34D399]">
                    <CountUp target={Math.floor(estimatedCost)} prefix="¥" />
                  </p>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3366FF]/10">
                    <Save className="w-4 h-4 text-[#3366FF]" />
                    <span className="text-body-sm text-[#3366FF] font-medium">
                      相比直接使用供应商节省约 {savingsPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Package recommendation */}
              <div className="mt-6 pt-6 border-t border-[var(--dark-border)]">
                <p className="text-body-sm text-[var(--slate-400)] text-center">
                  {totalCredits < 1000 ? '您的使用量较小，免费额度即可满足需求。' :
                   totalCredits < 50000 ? '推荐选择专业版套餐，包含 50000 积分/月。' :
                   totalCredits < 200000 ? '推荐选择企业版套餐，包含 200000 积分/月。' :
                   '您的使用量较大，建议联系销售定制专属方案。'}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ====== COMPARISON ====== */}
      <section className="bg-[var(--dark-bg)]">
        <div className="max-w-container mx-auto px-6 py-24">
          <FadeIn>
            <h2 className="font-space text-h2 text-white text-center mb-12">更优的成本效率</h2>
          </FadeIn>

          {/* Comparison table */}
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--dark-sidebar)]">
                    <th className="py-4 px-6 text-caption text-[var(--slate-400)] uppercase rounded-tl-lg">场景</th>
                    <th className="py-4 px-6 text-caption text-[var(--slate-400)] uppercase">直接使用供应商</th>
                    <th className="py-4 px-6 text-caption text-[#3366FF] uppercase rounded-tr-lg">使用 AI Nexus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dark-border)]">
                  {comparisonData.map((row, idx) => (
                    <motion.tr
                      key={row.scenario}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      className="bg-[var(--dark-bg)]"
                    >
                      <td className="py-4 px-6 text-body-sm text-white font-medium">{row.scenario}</td>
                      <td className="py-4 px-6 text-body-sm text-[var(--slate-400)]">{row.direct}</td>
                      <td className="py-4 px-6 text-body-sm text-[#34D399] font-medium bg-[rgba(51,102,255,0.05)]">
                        {row.ainexus}
                        <span className="ml-2 text-caption text-[#3366FF]">{row.highlight}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Chart */}
          <FadeIn delay={0.2}>
            <div className="mt-12 bg-[var(--dark-card)] rounded-xl p-6 border border-[var(--dark-border)]">
              <h3 className="font-space text-h4 text-white text-center mb-6">文本调用成本对比（元）</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151D2E', border: '1px solid #1E293B', borderRadius: '8px', color: '#E2E8F0' }}
                    />
                    <Bar dataKey="direct" name="直接使用供应商" radius={[4, 4, 0, 0]}>
                      {comparisonChartData.map((_, i) => (
                        <Cell key={`cell-d-${i}`} fill="#64748B" />
                      ))}
                    </Bar>
                    <Bar dataKey="ainexus" name="使用 AI Nexus" radius={[4, 4, 0, 0]}>
                      {comparisonChartData.map((_, i) => (
                        <Cell key={`cell-a-${i}`} fill="#3366FF" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="bg-[var(--dark-card)]">
        <div className="max-w-[800px] mx-auto px-6 py-20">
          <FadeIn>
            <h2 className="font-space text-h2 text-white text-center mb-10">计费常见问题</h2>
          </FadeIn>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <FaqItem question={item.question} answer={item.answer} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3366FF, #7A9FFF)' }}
      >
        <div className="max-w-container mx-auto px-6 py-20 text-center">
          <FadeIn>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-space text-h2 text-white">立即开始，免费体验</h2>
              <p className="mt-4 text-body-lg text-white/80 max-w-xl mx-auto">
                注册即送 1000 积分，足够完成数百次 API 调用测试
              </p>
            </motion.div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#3366FF] font-semibold rounded-full hover:bg-[var(--slate-50)] transition-all duration-200 active:scale-[0.97] shadow-lg"
              >
                免费注册
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
