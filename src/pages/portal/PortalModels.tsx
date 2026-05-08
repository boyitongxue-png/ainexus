import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Coins, Tag, Info } from 'lucide-react';
import { modelCatalog } from '@/lib/mockData';

function getPortalUser() {
  try {
    const raw = localStorage.getItem('ainexus_portal_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function PortalModels() {
  const [activeTab, setActiveTab] = useState<'all' | 'text' | 'image' | 'video' | 'audio' | 'embedding'>('all');
  const portalUser = useMemo(() => getPortalUser(), []);

  const filtered = useMemo(() => {
    const perms = portalUser?.permissions || ['chat'];
    return modelCatalog.filter((m) => {
      // Filter by tab
      if (activeTab !== 'all' && m.type !== activeTab) return false;
      // Filter by permissions
      return perms.some((p: string) => {
        if (p === 'chat' && m.type === 'text') return true;
        if (p === 'image' && m.type === 'image') return true;
        if (p === 'video' && m.type === 'video') return true;
        if (p === 'audio' && m.type === 'audio') return true;
        if (p === 'embedding' && m.type === 'embedding') return true;
        return false;
      });
    });
  }, [activeTab, portalUser]);

  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'text' as const, label: '文本' },
    { key: 'image' as const, label: '图片' },
    { key: 'video' as const, label: '视频' },
    { key: 'audio' as const, label: '音频' },
    { key: 'embedding' as const, label: '嵌入' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space text-h3 text-white font-semibold">模型定价</h1>
        <p className="text-body-sm text-[var(--slate-500)] mt-1">
          当前 API Key 可用的模型及其积分定价
        </p>
      </div>

      {/* Info banner */}
      <div className="p-3 rounded-lg bg-[#3366FF]/10 border border-[#3366FF]/20 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#3366FF] flex-shrink-0 mt-0.5" />
        <p className="text-body-sm text-[#7A9FFF]">
          以下价格为平台积分定价。实际计费以您的 API Key 配置为准（如设置了自定义售价）。
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-[#3366FF]/15 text-[#3366FF]'
                : 'bg-[var(--dark-card)] text-[var(--slate-500)] hover:text-white border border-[var(--dark-border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Model cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((model, i) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 hover:border-[#3366FF]/30 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-[#3366FF]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-white">{model.name}</h3>
                  <p className="text-[11px] text-[var(--slate-500)]">{model.provider}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                model.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981]' :
                model.status === 'beta' ? 'bg-[#3B82F6]/15 text-[#3B82F6]' :
                'bg-[#EF4444]/15 text-[#EF4444]'
              }`}>
                {model.status === 'active' ? '可用' : model.status === 'beta' ? 'Beta' : '停用'}
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)] mb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#A855F7]" />
                <span className="text-[12px] text-[var(--slate-400)]">积分定价</span>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-semibold text-white font-jetbrains">
                  {model.platformPrice || model.costPer1KTokens}
                </span>
                <span className="text-[11px] text-[var(--slate-500)] ml-1">
                  积分 / {model.type === 'text' || model.type === 'embedding' ? '1K tokens' : model.type === 'image' ? '张' : '秒'}
                </span>
              </div>
            </div>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1.5">
              {model.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-[10px] px-2 py-0.5 rounded bg-[var(--dark-bg)] text-[var(--slate-400)] border border-[var(--dark-border)]"
                >
                  {cap}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="mt-3 text-[11px] text-[var(--slate-500)]">{model.description}</p>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-8 h-8 text-[var(--slate-600)] mx-auto mb-2" />
          <p className="text-body-sm text-[var(--slate-500)]">当前分类下暂无可用模型</p>
        </div>
      )}
    </div>
  );
}
