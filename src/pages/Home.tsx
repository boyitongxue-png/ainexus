import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ExternalLink,
  Check,
  Layers,
  Zap,
  Shield,
  Clock,
  UserPlus,
  Key,
  Code,
  Star,
  ChevronDown,
  Brain,
  MessageSquare,
  Eye,
  FunctionSquare,
  Sparkles,
  Mic,
  Image as ImageIcon,
  Play,
} from 'lucide-react';
import { modelCatalog, faqData, testimonials } from '@/lib/mockData';
import { useCmsConfigReadonly } from '@/hooks/useCmsConfig';

/* ─────────────── Animation helpers ─────────────── */

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 1.5 }: {
  target: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function FadeInWhenVisible({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────── Section 1: Hero ─────────────── */

function HeroSection({ cms }: { cms: any }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [3, -3]);
  const rotateY = useTransform(mouseX, [-500, 500], [-5, 5]);

  return (
    <section
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg-mesh.png"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--dark-bg)]/50 via-transparent to-[var(--dark-bg)]" />
      </div>

      {/* Particle grid overlay */}
      <div className="absolute inset-0 z-[1] opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(51,102,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 max-w-container mx-auto px-6 w-full pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3366FF]/15 text-[#3366FF] text-xs font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {cms.site.tagline}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="font-space text-4xl sm:text-5xl lg:text-[64px] font-bold text-white leading-[1.1] tracking-tight"
              style={{ whiteSpace: 'pre-line' }}
            >
              {cms.home.hero.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-6 text-lg text-[var(--slate-400)] max-w-[560px] leading-relaxed"
            >
              {cms.home.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-[#3366FF] rounded-full hover:bg-[#2244CC] transition-all duration-200 hover:shadow-glow active:scale-[0.97]"
              >
                {cms.home.hero.ctaPrimary}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-[#3366FF] border border-[#3366FF] rounded-full hover:bg-[#3366FF]/10 transition-all duration-200 active:scale-[0.97]"
              >
                {cms.home.hero.ctaSecondary}
                <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[var(--slate-400)]"
            >
              {cms.home.hero.stats.map((item: any) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#34D399]" />
                  {item.label}: {item.value}{item.suffix || ''}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: -5 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            className="hidden lg:block relative"
          >
            <motion.div
              style={{ perspective: 1000, rotateX, rotateY }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src="/hero-dashboard-preview.png"
                alt="AI Nexus Dashboard Preview"
                className="w-full rounded-2xl border border-[#3366FF]/20 shadow-glow"
                style={{ maxWidth: 'none' }}
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-[#3366FF]/10 pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Section 2: Stats Bar ─────────────── */

function StatsBar() {
  const stats = [
    { icon: Layers, value: 50, suffix: '+', label: '集成 AI 模型' },
    { icon: Zap, value: 10, suffix: 'M+', label: '日均 API 调用', prefix: '' },
    { icon: Shield, value: 99.9, suffix: '%', label: '服务可用性', isDecimal: true },
    { icon: Clock, value: 100, suffix: 'ms', label: '平均响应延迟', prefix: '<' },
  ];

  return (
    <section className="relative z-10 -mt-10">
      <FadeInWhenVisible>
        <div className="max-w-container mx-auto px-6">
          <div className="bg-[var(--dark-card)] rounded-2xl border border-[var(--dark-border)] grid grid-cols-2 lg:grid-cols-4 divide-x divide-[var(--dark-border)]">
            {stats.map((stat, index) => (
              <FadeInWhenVisible key={stat.label} delay={index * 0.15}>
                <div className="px-6 lg:px-10 py-8 text-center">
                  <stat.icon className="w-5 h-5 text-[#3366FF] mx-auto mb-3" />
                  <div className="font-jetbrains text-2xl lg:text-4xl font-bold text-white">
                    {stat.prefix}
                    {stat.isDecimal ? (
                      <AnimatedCounter target={999} suffix="" duration={1.5} />
                    ) : (
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    )}
                    {!stat.isDecimal && stat.suffix}
                    {stat.isDecimal && '.9%'}
                  </div>
                  <p className="mt-2 text-sm text-[var(--slate-400)]">{stat.label}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </FadeInWhenVisible>
    </section>
  );
}

/* ─────────────── Section 3: Trusted By ─────────────── */

function TrustedBySection() {
  const providers = ['OpenAI', 'Anthropic', 'Midjourney', 'Stability AI', 'Runway', 'Pika', 'Cohere', 'Google DeepMind'];

  return (
    <section className="py-20">
      <div className="max-w-container mx-auto px-6 text-center">
        <FadeInWhenVisible>
          <h3 className="font-space text-h3 text-white">集成全球顶级 AI 供应商</h3>
          <p className="mt-2 text-body text-[var(--slate-400)]">一个平台，连接所有主流大模型</p>
        </FadeInWhenVisible>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {providers.map((name, index) => (
            <FadeInWhenVisible key={name} delay={index * 0.08}>
              <div className="group cursor-default">
                <span className="text-lg lg:text-xl font-semibold text-[var(--slate-600)] group-hover:text-[var(--slate-400)] transition-all duration-200 grayscale group-hover:grayscale-0">
                  {name}
                </span>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Section 4: Features Grid ─────────────── */

function FeaturesSection() {
  const cms = useCmsConfigReadonly();
  const features = [
    {
      image: '/feature-unified-api.png',
      icon: Sparkles,
      title: '统一 API 接口',
      description: '无论底层调用哪个 AI 供应商，上层接口完全一致。一次开发，处处运行，大幅降低多供应商对接成本。',
    },
    {
      image: '/feature-model-routing.png',
      icon: Brain,
      title: '智能路由策略',
      description: '根据模型可用性、响应速度、成本自动选择最优供应商。支持自定义路由规则，满足不同业务场景需求。',
    },
    {
      image: '/feature-cost-control.png',
      icon: Shield,
      title: '精细化成本控制',
      description: '透明的积分体系，精确的调用计费。实时监控每个模型的消耗，帮助团队优化 AI 使用成本。',
    },
    {
      image: '/feature-async-tasks.png',
      icon: Zap,
      title: '异步任务管理',
      description: '图片生成、视频生成等耗时任务异步处理，通过 Webhook 实时回调结果。任务状态全程可追踪。',
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-container mx-auto px-6">
        <FadeInWhenVisible className="text-center mb-16">
          <h2 className="font-space text-h2 text-white">为什么选择 {cms.site.name}</h2>
          <p className="mt-3 text-body-lg text-[var(--slate-400)]">专为开发者和团队打造的一站式 AI 能力聚合平台</p>
        </FadeInWhenVisible>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FadeInWhenVisible key={feature.title} delay={index * 0.12}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden hover:border-[#3366FF]/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-[#3366FF]/15 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#3366FF]" />
                  </div>
                  <h4 className="font-space text-h4 text-white">{feature.title}</h4>
                  <p className="mt-2 text-body-sm text-[var(--slate-400)] leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Section 5: How It Works ─────────────── */

function HowItWorksSection() {
  const cms = useCmsConfigReadonly();
  const steps = [
    { number: '01', icon: UserPlus, title: '注册账户', description: '填写基本信息，即刻开通开发者账户。无需信用卡，免费额度即刻到账。' },
    { number: '02', icon: Key, title: '创建 API Key', description: '在控制台生成专属的平台 API Key，选择需要调用的模型范围。' },
    { number: '03', icon: Code, title: '发起 API 调用', description: '使用熟悉的 HTTP 接口调用 AI 能力，与 OpenAI SDK 完全兼容，无缝迁移现有项目。' },
  ];

  return (
    <section className="py-24 bg-[var(--dark-card)]">
      <div className="max-w-container mx-auto px-6">
        <FadeInWhenVisible className="text-center mb-16">
          <h2 className="font-space text-h2 text-white">三步接入 {cms.site.name}</h2>
          <p className="mt-3 text-body-lg text-[var(--slate-400)]">从注册到发起第一个 API 调用，最快只需 5 分钟</p>
        </FadeInWhenVisible>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting lines - desktop only */}
          <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px border-t-2 border-dashed border-[#3366FF]/20" />

          {steps.map((step, index) => (
            <FadeInWhenVisible key={step.number} delay={index * 0.15}>
              <div className="relative text-center">
                <span className="font-jetbrains text-5xl font-bold text-[#3366FF]/30">{step.number}</span>
                <div className="mt-6 w-16 h-16 rounded-xl bg-[#3366FF]/15 flex items-center justify-center mx-auto">
                  <step.icon className="w-8 h-8 text-[#3366FF]" />
                </div>
                <h4 className="mt-6 font-space text-h4 text-white">{step.title}</h4>
                <p className="mt-2 text-body-sm text-[var(--slate-400)] leading-relaxed">{step.description}</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Section 6: Dashboard Preview ─────────────── */

function DashboardPreviewSection() {
  const features = [
    '实时 API 调用监控与统计',
    '多维度调用日志查询与分析',
    '灵活的 API Key 权限管理',
    '团队协作者访问控制',
    '异步任务状态追踪',
    '积分消耗明细与趋势',
  ];

  return (
    <section className="py-24">
      <div className="max-w-container mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left: Text */}
          <div className="lg:col-span-2">
            <FadeInWhenVisible>
              <h2 className="font-space text-h2 text-white">功能强大的开发者控制台</h2>
              <p className="mt-4 text-body-lg text-[var(--slate-400)]">实时查看调用数据、管理 API Key、监控模型状态，一切尽在掌控</p>
            </FadeInWhenVisible>

            <div className="mt-8 space-y-4">
              {features.map((feature, index) => (
                <FadeInWhenVisible key={feature} delay={0.1 + index * 0.1}>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#34D399] flex-shrink-0" />
                    <span className="text-body text-[var(--slate-300)]">{feature}</span>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>

            <FadeInWhenVisible delay={0.5}>
              <Link
                to="/console/overview"
                className="inline-flex items-center gap-2 mt-8 text-[#3366FF] font-medium hover:underline"
              >
                查看功能详情
                <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeInWhenVisible>
          </div>

          {/* Right: Screenshot */}
          <div className="lg:col-span-3">
            <FadeInWhenVisible delay={0.2}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0, rotateY: -3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ perspective: 1000 }}
              >
                <div className="bg-[var(--dark-card)] rounded-2xl border border-[var(--dark-border)] shadow-xl overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--dark-border)] bg-[var(--dark-sidebar)]">
                    <div className="w-3 h-3 rounded-full bg-[#F43F5E]" />
                    <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                    <div className="w-3 h-3 rounded-full bg-[#34D399]" />
                    <div className="flex-1 ml-4 bg-[var(--dark-bg)] rounded-md px-3 py-1 text-xs text-[var(--slate-500)] text-center">
                      console.ainexus.com
                    </div>
                  </div>
                  <img
                    src="/hero-dashboard-preview.png"
                    alt="控制台预览"
                    className="w-full"
                  />
                </div>
              </motion.div>
            </FadeInWhenVisible>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Section 7: Model Support ─────────────── */

function ModelSupportSection() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const categories = ['全部', '文本对话', '图片生成', '视频生成', 'Embedding', '语音'];

  const typeMap: Record<string, string> = {
    '文本对话': 'text',
    '图片生成': 'image',
    '视频生成': 'video',
    'Embedding': 'embedding',
    '语音': 'audio',
  };

  const filteredModels = activeCategory === '全部'
    ? modelCatalog.slice(0, 9)
    : modelCatalog.filter((m) => m.type === typeMap[activeCategory]).slice(0, 9);

  const capabilityIcons: Record<string, React.ReactNode> = {
    '聊天': <MessageSquare className="w-3 h-3" />,
    '函数调用': <FunctionSquare className="w-3 h-3" />,
    '视觉': <Eye className="w-3 h-3" />,
    '长上下文': <Brain className="w-3 h-3" />,
    '图片生成': <ImageIcon className="w-3 h-3" />,
    '视频生成': <Play className="w-3 h-3" />,
    'Embedding': <Sparkles className="w-3 h-3" />,
    '语音转文字': <Mic className="w-3 h-3" />,
  };

  return (
    <section id="models" className="py-24 bg-[var(--dark-card)]">
      <div className="max-w-container mx-auto px-6">
        <FadeInWhenVisible className="text-center mb-12">
          <h2 className="font-space text-h2 text-white">覆盖全品类 AI 模型</h2>
          <p className="mt-3 text-body-lg text-[var(--slate-400)]">从文本对话到图片生成，从视频合成到语音转文字</p>
        </FadeInWhenVisible>

        {/* Category tabs */}
        <FadeInWhenVisible delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#3366FF] text-white'
                    : 'bg-[var(--dark-hover)] text-[var(--slate-300)] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeInWhenVisible>

        {/* Model cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredModels.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[#3366FF]/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-space text-h4 text-white">{model.name}</h4>
                    <p className="mt-1 text-body-sm text-[var(--slate-400)]">{model.provider}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    model.status === 'active'
                      ? 'bg-[#10B981]/15 text-[#10B981]'
                      : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                  }`}>
                    {model.status === 'active' ? '运行中' : 'Beta'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {model.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--dark-hover)] text-xs text-[var(--slate-300)]"
                    >
                      {capabilityIcons[cap]}
                      {cap}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--dark-border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--slate-500)]">{model.description}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─────────────── Section 8: Pricing CTA ─────────────── */

function PricingCTASection() {
  const highlights = [
    { model: '文本模型', price: '¥0.001', unit: '/ 1M tokens' },
    { model: '图片生成', price: '¥0.05', unit: '/ 张' },
    { model: '视频生成', price: '¥0.50', unit: '/ 秒' },
  ];

  return (
    <section className="py-20 bg-gradient-brand">
      <div className="max-w-container mx-auto px-6 text-center">
        <FadeInWhenVisible>
          <h2 className="font-space text-h2 text-white">灵活的定价，按需付费</h2>
          <p className="mt-3 text-body-lg text-white/80">无需预充值大额资金，按实际调用量计费。新用户注册即送 1000 积分免费额度。</p>
        </FadeInWhenVisible>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <FadeInWhenVisible key={item.model} delay={index * 0.15}>
              <div className="text-center">
                <p className="text-body-sm text-white/70">{item.model}</p>
                <p className="mt-2 font-jetbrains text-3xl font-bold text-white">
                  {item.price}
                </p>
                <p className="mt-1 text-sm text-white/60">{item.unit}</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>

        <FadeInWhenVisible delay={0.5}>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 mt-10 px-8 py-3.5 bg-white text-[#3366FF] font-semibold rounded-full hover:bg-white/90 transition-all duration-200 active:scale-[0.97]"
          >
            查看完整定价
            <ArrowRight className="w-5 h-5" />
          </Link>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}

/* ─────────────── Section 9: Testimonials ─────────────── */

function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="max-w-container mx-auto px-6">
        <FadeInWhenVisible className="text-center mb-16">
          <h2 className="font-space text-h2 text-white">开发者的信赖之选</h2>
          <p className="mt-3 text-body-lg text-[var(--slate-400)]">来自各行各业的技术团队都在使用 AI Nexus</p>
        </FadeInWhenVisible>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <FadeInWhenVisible key={t.name} delay={index * 0.15}>
              <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 h-full flex flex-col">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}
                    >
                      <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <p className="mt-4 text-body text-[var(--slate-200)] italic flex-1 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 pt-4 border-t border-[var(--dark-border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3366FF] to-[#A855F7] flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-[var(--slate-400)]">{t.title}</p>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Section 10: FAQ ─────────────── */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-[var(--dark-card)]">
      <div className="max-w-[800px] mx-auto px-6">
        <FadeInWhenVisible className="text-center mb-12">
          <h2 className="font-space text-h2 text-white">常见问题</h2>
        </FadeInWhenVisible>

        <div className="space-y-0">
          {faqData.map((faq, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.08}>
              <div className="border-b border-[var(--dark-border)]">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="text-body font-medium text-white group-hover:text-[#3366FF] transition-colors pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-[var(--slate-400)] flex-shrink-0" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-body text-[var(--slate-300)] leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Section 11: Final CTA ─────────────── */

function FinalCTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(51,102,255,0.4) 1px, transparent 0)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 max-w-container mx-auto px-6 text-center">
        <FadeInWhenVisible>
          <h2 className="font-space text-h1 text-white">准备好开始了吗？</h2>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.15}>
          <p className="mt-4 text-body-lg text-[var(--slate-400)]">
            注册账户，即刻获得 1000 积分免费额度，5 分钟完成首个 API 调用。
          </p>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-[#3366FF] rounded-full hover:bg-[#2244CC] transition-all duration-200 hover:shadow-glow active:scale-[0.97]"
            >
              免费注册
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="#"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-[#3366FF] border border-[#3366FF] rounded-full hover:bg-[#3366FF]/10 transition-all duration-200 active:scale-[0.97]"
            >
              联系销售
            </Link>
          </div>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.5}>
          <p className="mt-8 text-caption text-[var(--slate-500)]">
            无需信用卡 · 免费额度永久有效 · 随时可升级
          </p>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}

/* ─────────────── Main Home Page ─────────────── */

export default function Home() {
  const cms = useCmsConfigReadonly();
  return (
    <div className="bg-[var(--dark-bg)]">
      <HeroSection cms={cms} />
      <StatsBar />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <ModelSupportSection />
      <PricingCTASection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}
