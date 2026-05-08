import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Search,
  X,
  Check,
  Sparkles,
  Image,
  Video,
  LayoutGrid,
  List,
  Star,
  ChevronRight,
  Server,
  Zap,
  Clock,
  Eye,
  MessageSquare,
  Hash,
  AlertTriangle,
  Globe,
  Layers,
} from 'lucide-react';

// --- Extended mock data with richer fields ---
interface RichModel {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'image' | 'video' | 'embedding' | 'audio';
  typeLabel: string;
  capabilities: string[];
  status: 'available' | 'unavailable' | 'deprecated';
  asyncSupport: boolean;
  description: string;
  platformPrice: number;
  contextWindow: string;
  languages: string[];
  apiParams: { name: string; type: string; default: string; description: string }[];
}

const allModels: RichModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: 'text',
    typeLabel: '文本对话',
    capabilities: ['函数调用', '流式响应', '视觉输入'],
    status: 'available',
    asyncSupport: false,
    description: 'OpenAI 最新的旗舰模型，具备强大的文本理解、生成和视觉处理能力，支持多模态输入。',
    platformPrice: 150,
    contextWindow: '128K tokens',
    languages: ['中文', '英文', '日文', '韩文', '法文', '德文'],
    apiParams: [
      { name: 'temperature', type: 'float', default: '1.0', description: '采样温度，0-2之间' },
      { name: 'max_tokens', type: 'integer', default: '4096', description: '最大生成token数' },
      { name: 'top_p', type: 'float', default: '1.0', description: '核采样概率阈值' },
      { name: 'frequency_penalty', type: 'float', default: '0', description: '频率惩罚系数' },
    ],
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    type: 'text',
    typeLabel: '文本对话',
    capabilities: ['函数调用', '流式响应'],
    status: 'available',
    asyncSupport: false,
    description: 'OpenAI 高性价比的小型模型，适合大规模部署和对延迟敏感的场景。',
    platformPrice: 15,
    contextWindow: '128K tokens',
    languages: ['中文', '英文', '日文', '韩文'],
    apiParams: [
      { name: 'temperature', type: 'float', default: '1.0', description: '采样温度' },
      { name: 'max_tokens', type: 'integer', default: '4096', description: '最大生成token数' },
      { name: 'top_p', type: 'float', default: '1.0', description: '核采样概率阈值' },
    ],
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    type: 'text',
    typeLabel: '文本对话',
    capabilities: ['函数调用', '流式响应', '长上下文', '视觉输入'],
    status: 'available',
    asyncSupport: false,
    description: 'Anthropic 最顶级的模型，在复杂推理、代码生成和长文本理解方面表现卓越。',
    platformPrice: 750,
    contextWindow: '200K tokens',
    languages: ['中文', '英文', '日文', '韩文', '法文', '德文', '西班牙文'],
    apiParams: [
      { name: 'temperature', type: 'float', default: '1.0', description: '采样温度' },
      { name: 'max_tokens', type: 'integer', default: '4096', description: '最大生成token数' },
      { name: 'top_p', type: 'float', default: '0.9', description: '核采样' },
      { name: 'top_k', type: 'integer', default: '40', description: 'Top-k采样' },
    ],
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    type: 'text',
    typeLabel: '文本对话',
    capabilities: ['函数调用', '流式响应', '长上下文'],
    status: 'available',
    asyncSupport: false,
    description: 'Anthropic 先进模型，在推理能力和效率之间取得了很好的平衡。',
    platformPrice: 150,
    contextWindow: '200K tokens',
    languages: ['中文', '英文', '日文', '韩文', '法文', '德文'],
    apiParams: [
      { name: 'temperature', type: 'float', default: '1.0', description: '采样温度' },
      { name: 'max_tokens', type: 'integer', default: '4096', description: '最大生成token数' },
    ],
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    type: 'text',
    typeLabel: '文本对话',
    capabilities: ['函数调用', '流式响应'],
    status: 'deprecated',
    asyncSupport: false,
    description: 'GPT-4 基础版本，已被 GPT-4o 全面超越，建议迁移到新模型。',
    platformPrice: 600,
    contextWindow: '8K tokens',
    languages: ['中文', '英文'],
    apiParams: [
      { name: 'temperature', type: 'float', default: '1.0', description: '采样温度' },
      { name: 'max_tokens', type: 'integer', default: '2048', description: '最大生成token数' },
    ],
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    type: 'text',
    typeLabel: '文本对话',
    capabilities: ['函数调用', '流式响应'],
    status: 'available',
    asyncSupport: false,
    description: 'OpenAI 高性价比文本模型，适合日常对话和简单任务处理。',
    platformPrice: 6,
    contextWindow: '16K tokens',
    languages: ['中文', '英文', '日文', '韩文'],
    apiParams: [
      { name: 'temperature', type: 'float', default: '1.0', description: '采样温度' },
      { name: 'max_tokens', type: 'integer', default: '2048', description: '最大生成token数' },
    ],
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    type: 'image',
    typeLabel: '图片生成',
    capabilities: ['异步任务', '高清输出'],
    status: 'available',
    asyncSupport: true,
    description: 'OpenAI 最新的图片生成模型，能够根据详细文本描述生成高质量、高分辨率的图像。',
    platformPrice: 500,
    contextWindow: '-',
    languages: ['中文', '英文'],
    apiParams: [
      { name: 'prompt', type: 'string', default: '', description: '图片生成提示词' },
      { name: 'size', type: 'string', default: '1024x1024', description: '图片尺寸' },
      { name: 'quality', type: 'string', default: 'standard', description: '图片质量' },
      { name: 'style', type: 'string', default: 'vivid', description: '图片风格' },
    ],
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion 3',
    provider: 'Stability AI',
    type: 'image',
    typeLabel: '图片生成',
    capabilities: ['异步任务', '风格迁移'],
    status: 'available',
    asyncSupport: true,
    description: 'Stability AI 的开源图片生成模型，支持多种艺术风格和高质量的图像合成。',
    platformPrice: 200,
    contextWindow: '-',
    languages: ['英文'],
    apiParams: [
      { name: 'prompt', type: 'string', default: '', description: '正向提示词' },
      { name: 'negative_prompt', type: 'string', default: '', description: '负向提示词' },
      { name: 'cfg_scale', type: 'float', default: '7.0', description: 'CFG缩放' },
      { name: 'steps', type: 'integer', default: '30', description: '采样步数' },
    ],
  },
  {
    id: 'midjourney-v6',
    name: 'Midjourney V6',
    provider: 'Midjourney',
    type: 'image',
    typeLabel: '图片生成',
    capabilities: ['异步任务', '艺术风格'],
    status: 'unavailable',
    asyncSupport: true,
    description: 'Midjourney V6 以卓越的艺术品质和美学表现著称，适合创意设计和艺术项目。',
    platformPrice: 600,
    contextWindow: '-',
    languages: ['英文'],
    apiParams: [
      { name: 'prompt', type: 'string', default: '', description: '图片生成提示词' },
      { name: 'ar', type: 'string', default: '1:1', description: '宽高比' },
      { name: 'style', type: 'string', default: 'raw', description: '风格参数' },
    ],
  },
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3',
    provider: 'Runway',
    type: 'video',
    typeLabel: '视频生成',
    capabilities: ['异步任务', '高清视频'],
    status: 'available',
    asyncSupport: true,
    description: 'Runway 第三代视频生成模型，支持文本/图片生成高质量短视频，效果流畅自然。',
    platformPrice: 1000,
    contextWindow: '-',
    languages: ['英文'],
    apiParams: [
      { name: 'prompt', type: 'string', default: '', description: '视频生成提示词' },
      { name: 'duration', type: 'integer', default: '4', description: '视频时长(秒)' },
      { name: 'resolution', type: 'string', default: '1080p', description: '视频分辨率' },
    ],
  },
  {
    id: 'pika-1.5',
    name: 'Pika 1.5',
    provider: 'Pika',
    type: 'video',
    typeLabel: '视频生成',
    capabilities: ['异步任务', '动画效果'],
    status: 'available',
    asyncSupport: true,
    description: 'Pika 1.5 专注于创意视频生成，支持丰富的动画风格和特效控制。',
    platformPrice: 800,
    contextWindow: '-',
    languages: ['英文'],
    apiParams: [
      { name: 'prompt', type: 'string', default: '', description: '视频生成提示词' },
      { name: 'motion', type: 'string', default: 'medium', description: '运动强度' },
    ],
  },
  {
    id: 'text-embedding-3',
    name: 'Text Embedding 3',
    provider: 'OpenAI',
    type: 'embedding',
    typeLabel: 'Embedding',
    capabilities: ['向量化'],
    status: 'available',
    asyncSupport: false,
    description: 'OpenAI 文本向量化模型，将文本转换为高维向量，适用于语义搜索和推荐系统。',
    platformPrice: 0,
    contextWindow: '8K tokens',
    languages: ['中文', '英文', '日文', '韩文'],
    apiParams: [
      { name: 'input', type: 'string', default: '', description: '输入文本' },
      { name: 'dimensions', type: 'integer', default: '1536', description: '向量维度' },
    ],
  },
];

const providers = ['全部供应商', 'OpenAI', 'Anthropic', 'Stability AI', 'Midjourney', 'Runway', 'Pika'];
const categoryTabs = [
  { key: 'all', label: '全部', count: allModels.length, icon: LayoutGrid },
  { key: 'text', label: '文本', count: allModels.filter((m) => m.type === 'text').length, icon: MessageSquare },
  { key: 'image', label: '图片', count: allModels.filter((m) => m.type === 'image').length, icon: Image },
  { key: 'video', label: '视频', count: allModels.filter((m) => m.type === 'video').length, icon: Video },
];

const typeBadgeColors: Record<string, string> = {
  text: 'bg-[#3366FF]/15 text-[#3366FF]',
  image: 'bg-[#A855F7]/15 text-[#A855F7]',
  video: 'bg-[#22D3EE]/15 text-[#22D3EE]',
  embedding: 'bg-[#34D399]/15 text-[#34D399]',
  audio: 'bg-[#F59E0B]/15 text-[#F59E0B]',
};

const statusConfig = {
  available: { label: '可用', className: 'bg-[#10B981]/15 text-[#10B981]', dot: '#10B981' },
  unavailable: { label: '不可用', className: 'bg-[#EF4444]/15 text-[#EF4444]', dot: '#EF4444' },
  deprecated: { label: '已弃用', className: 'bg-[#F59E0B]/15 text-[#F59E0B]', dot: '#F59E0B' },
};

const capIcons: Record<string, typeof Sparkles> = {
  '函数调用': Zap,
  '流式响应': Layers,
  '视觉输入': Eye,
  '长上下文': Hash,
  '异步任务': Clock,
  '高清输出': Image,
  '风格迁移': Sparkles,
  '艺术风格': Star,
  '高清视频': Video,
  '动画效果': Sparkles,
  '向量化': Globe,
};

export default function Models() {
  const [activeTab, setActiveTab] = useState('all');
  const [providerFilter, setProviderFilter] = useState('全部供应商');
  const [asyncOnly, setAsyncOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable' | 'deprecated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedModel, setSelectedModel] = useState<RichModel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredModels = useMemo(() => {
    return allModels.filter((m) => {
      if (activeTab !== 'all' && m.type !== activeTab) return false;
      if (providerFilter !== '全部供应商' && m.provider !== providerFilter) return false;
      if (asyncOnly && !m.asyncSupport) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.capabilities.some((c) => c.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeTab, providerFilter, asyncOnly, statusFilter, searchQuery]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const availableCount = allModels.filter((m) => m.status === 'available').length;

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
          <h1 className="font-space text-h2 text-white">模型目录</h1>
          <p className="mt-1 text-body text-[var(--slate-400)]">
            共 {allModels.length} 个模型，其中 {availableCount} 个可用
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
            <input
              type="text"
              placeholder="搜索模型名称或供应商..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-9 pr-4 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-[var(--slate-500)] hover:text-white" />
              </button>
            )}
          </div>
          <div className="flex items-center bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-500)] hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#3366FF] text-white' : 'text-[var(--slate-500)] hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#3366FF] text-white shadow-glow'
                  : 'bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--slate-400)] hover:text-white hover:border-[#3366FF]/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[var(--slate-500)]'}`}>({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[var(--slate-500)]" />
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="h-9 px-3 bg-[var(--dark-bg)] border border-[var(--dark-border)] rounded-lg text-sm text-[var(--dark-text)] focus:outline-none focus:border-[#3366FF]"
          >
            {providers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setAsyncOnly(!asyncOnly)}
            className={`w-11 h-6 rounded-full transition-colors relative ${asyncOnly ? 'bg-[#3366FF]' : 'bg-[var(--slate-600)]'}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${asyncOnly ? 'translate-x-5' : ''}`}
            />
          </div>
          <span className="text-sm text-[var(--slate-300)]">仅异步</span>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[var(--slate-500)] uppercase tracking-wider">状态</span>
          {(['all', 'available', 'unavailable', 'deprecated'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === s
                  ? s === 'all' ? 'bg-[#3366FF] text-white' : statusConfig[s].className
                  : 'bg-[var(--dark-hover)] text-[var(--slate-500)] hover:text-[var(--slate-300)]'
              }`}
            >
              {s === 'all' ? '全部' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Model Grid / List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredModels.map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                onClick={() => setSelectedModel(model)}
                className="group bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 hover:border-[#3366FF]/30 hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
                    {model.type === 'text' ? (
                      <MessageSquare className="w-5 h-5 text-[#3366FF]" />
                    ) : model.type === 'image' ? (
                      <Image className="w-5 h-5 text-[#A855F7]" />
                    ) : model.type === 'video' ? (
                      <Video className="w-5 h-5 text-[#22D3EE]" />
                    ) : (
                      <Brain className="w-5 h-5 text-[#3366FF]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(model.id);
                      }}
                      className="transition-transform duration-200"
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          favorites.has(model.id) ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-[var(--slate-500)] hover:text-[#FBBF24]'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Model Name & Type */}
                <h3 className="mt-4 text-h4 text-white font-semibold">{model.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${typeBadgeColors[model.type]}`}>
                    {model.typeLabel}
                  </span>
                  <span className="text-body-sm text-[var(--slate-400)]">{model.provider}</span>
                </div>

                {/* Capabilities */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {model.capabilities.slice(0, 3).map((cap) => {
                    const CapIcon = capIcons[cap] || Check;
                    return (
                      <span
                        key={cap}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--dark-hover)] text-xs text-[var(--slate-300)]"
                      >
                        <CapIcon className="w-3 h-3" />
                        {cap}
                      </span>
                    );
                  })}
                </div>

                <p className="mt-3 text-body-sm text-[var(--slate-400)] line-clamp-2">{model.description}</p>

                {/* Card Footer */}
                <div className="mt-4 pt-4 border-t border-[var(--dark-border)] flex items-center justify-between">
                  <div>
                    <span className="text-mono-data text-[#7A9FFF]">
                      {model.type === 'text' || model.type === 'embedding'
                        ? `${model.platformPrice} 积分 / 1K tokens`
                        : model.type === 'image'
                        ? `${model.platformPrice} 积分 / 张`
                        : `${model.platformPrice} 积分 / 秒`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig[model.status].dot }} />
                    <span className={`text-xs font-medium ${statusConfig[model.status].className} px-2 py-0.5 rounded-full`}>
                      {statusConfig[model.status].label}
                    </span>
                  </div>
                </div>

                {model.asyncSupport && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22D3EE]/10 text-[#22D3EE] text-xs">
                    <Clock className="w-3 h-3" />
                    异步支持
                  </div>
                )}

                <div className="mt-3 flex items-center gap-1 text-xs text-[#3366FF] font-medium group-hover:gap-2 transition-all">
                  查看详情 <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--dark-sidebar)] border-b border-[var(--dark-border)]">
                  <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">模型</th>
                  <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">供应商</th>
                  <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">类型</th>
                  <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">能力</th>
                  <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">平台定价</th>
                  <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">状态</th>
                  <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dark-border)]">
                {filteredModels.map((model) => (
                  <tr
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className="hover:bg-[var(--dark-hover)] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-body-sm text-white font-medium">{model.name}</td>
                    <td className="py-3 px-4 text-body-sm text-[var(--slate-400)]">{model.provider}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeColors[model.type]}`}>
                        {model.typeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.slice(0, 2).map((cap) => (
                          <span key={cap} className="text-xs text-[var(--slate-300)] bg-[var(--dark-hover)] px-1.5 py-0.5 rounded">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-body-sm text-[#7A9FFF] font-jetbrains">
                      {model.platformPrice} 积分
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[model.status].className}`}>
                        {statusConfig[model.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-xs text-[#3366FF] hover:underline">详情</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredModels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Brain className="w-16 h-16 text-[var(--slate-600)] mb-4" />
          <h3 className="text-h4 text-[var(--slate-400)]">未找到匹配的模型</h3>
          <p className="mt-2 text-body-sm text-[var(--slate-500)]">尝试调整筛选条件或搜索关键词</p>
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedModel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModel(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[640px] bg-[var(--dark-card)] border-l border-[var(--dark-border)] z-modal overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--dark-card)] border-b border-[var(--dark-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#3366FF]" />
                  </div>
                  <div>
                    <h2 className="text-h4 text-white font-semibold">{selectedModel.name}</h2>
                    <p className="text-xs text-[var(--slate-400)]">{selectedModel.provider}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="p-2 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status & Type */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadgeColors[selectedModel.type]}`}>
                    {selectedModel.typeLabel}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[selectedModel.status].className}`}>
                    {statusConfig[selectedModel.status].label}
                  </span>
                  {selectedModel.asyncSupport && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#22D3EE]/10 text-[#22D3EE]">
                      <Clock className="w-3 h-3" />
                      异步支持
                    </span>
                  )}
                  {selectedModel.status === 'deprecated' && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">
                      <AlertTriangle className="w-3 h-3" />
                      建议迁移
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-body text-[var(--dark-text)]">{selectedModel.description}</p>

                {/* Pricing Details */}
                <div className="bg-[var(--dark-bg)] rounded-xl p-5 border border-[var(--dark-border)]">
                  <h3 className="text-sm font-semibold text-white mb-4">平台积分定价</h3>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--dark-card)]">
                    <div>
                      <p className="text-xs text-[var(--slate-500)] mb-1">每 1K tokens / 次调用</p>
                      <p className="text-mono-data text-[#7A9FFF] text-2xl">{selectedModel.platformPrice} <span className="text-sm">积分</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--slate-500)]">计费单位</p>
                      <p className="text-sm text-[var(--dark-text)] mt-1">
                        {selectedModel.type === 'image' ? '每张图片' : selectedModel.type === 'video' ? '每秒视频' : '每 1K tokens'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--slate-500)] mt-3">
                    此为平台定价。您在创建 API Key 时可设置加价比例，自定义向下游客户的销售价格。
                  </p>
                </div>

                {/* Capability Matrix */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">能力矩阵</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedModel.capabilities.map((cap) => {
                      const CapIcon = capIcons[cap] || Check;
                      return (
                        <div
                          key={cap}
                          className="flex items-center gap-2 p-3 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]"
                        >
                          <div className="w-7 h-7 rounded-md bg-[#3366FF]/15 flex items-center justify-center">
                            <CapIcon className="w-3.5 h-3.5 text-[#3366FF]" />
                          </div>
                          <span className="text-sm text-[var(--dark-text)]">{cap}</span>
                          <Check className="w-4 h-4 text-[#10B981] ml-auto" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Specs */}
                <div className="bg-[var(--dark-bg)] rounded-xl p-5 border border-[var(--dark-border)]">
                  <h3 className="text-sm font-semibold text-white mb-4">模型规格</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">上下文窗口</span>
                      <span className="text-sm text-white font-medium">{selectedModel.contextWindow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">支持语言</span>
                      <span className="text-sm text-white font-medium">{selectedModel.languages.join('、')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">供应商</span>
                      <span className="text-sm text-white font-medium">{selectedModel.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--slate-400)]">异步支持</span>
                      <span className="text-sm text-white font-medium">{selectedModel.asyncSupport ? '是' : '否'}</span>
                    </div>
                  </div>
                </div>

                {/* API Parameters */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">API 参数</h3>
                  <div className="bg-[var(--dark-bg)] rounded-xl border border-[var(--dark-border)] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[var(--dark-border)]">
                          <th className="py-2.5 px-4 text-xs text-[var(--slate-400)]">参数名</th>
                          <th className="py-2.5 px-4 text-xs text-[var(--slate-400)]">类型</th>
                          <th className="py-2.5 px-4 text-xs text-[var(--slate-400)]">默认值</th>
                          <th className="py-2.5 px-4 text-xs text-[var(--slate-400)]">说明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--dark-border)]">
                        {selectedModel.apiParams.map((param) => (
                          <tr key={param.name}>
                            <td className="py-2.5 px-4 text-xs text-[#7A9FFF] font-jetbrains">{param.name}</td>
                            <td className="py-2.5 px-4 text-xs text-[var(--slate-300)]">{param.type}</td>
                            <td className="py-2.5 px-4 text-xs text-[var(--slate-400)] font-jetbrains">{param.default}</td>
                            <td className="py-2.5 px-4 text-xs text-[var(--slate-400)]">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-[var(--dark-border)]">
                  <a
                    href="#/console/routing"
                    onClick={() => setSelectedModel(null)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#3366FF] text-white text-sm font-semibold rounded-full hover:bg-[#2244CC] hover:shadow-glow-hover transition-all active:scale-[0.97]"
                  >
                    <Sparkles className="w-4 h-4" />
                    设为默认模型
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
