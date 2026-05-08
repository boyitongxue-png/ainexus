/**
 * CMS Config System
 * ---------------
 * Manages all website content via localStorage (can be swapped to API later).
 * - Admin: read/write full config
 * - Website pages: read-only reactive access
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ainexus_cms_config';

/* ================================================================== */
/*  Type Definitions                                                  */
/* ================================================================== */

export interface CmsSiteConfig {
  name: string;
  logo: string;
  favicon: string;
  tagline: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  icp: string;
}

export interface CmsHeroConfig {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: { label: string; value: string; suffix?: string }[];
}

export interface CmsFeatureConfig {
  title: string;
  description: string;
  icon: string;
}

export interface CmsHomeConfig {
  hero: CmsHeroConfig;
  features: CmsFeatureConfig[];
  showPartners: boolean;
  showSteps: boolean;
  showPreview: boolean;
  showTestimonials: boolean;
  showFaq: boolean;
}

export interface CmsPricingModel {
  id: string;
  model: string;
  provider: string;
  category: 'text' | 'image' | 'video' | 'embedding' | 'audio';
  inputPrice: number | null;
  outputPrice: number | null;
  imagePrice: number | null;
  videoPrice: number | null;
  note: string;
}

export interface CmsPricingFaq {
  question: string;
  answer: string;
}

export interface CmsPricingConfig {
  pageTitle: string;
  pageSubtitle: string;
  exchangeRate: number;
  models: CmsPricingModel[];
  faq: CmsPricingFaq[];
  notice: string;
}

export interface CmsDocsConfig {
  type: 'internal' | 'feishu';
  feishuUrl: string;
  pageTitle: string;
  pageSubtitle: string;
}

export interface CmsConfig {
  site: CmsSiteConfig;
  home: CmsHomeConfig;
  pricing: CmsPricingConfig;
  docs: CmsDocsConfig;
  _version: number;
  _updatedAt: string;
}

/* ================================================================== */
/*  Default Config                                                    */
/* ================================================================== */

export const defaultCmsConfig: CmsConfig = {
  _version: 1,
  _updatedAt: new Date().toISOString(),
  site: {
    name: 'AI Nexus',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    tagline: '一站式大模型聚合平台',
    footerText: ' 2024 AI Nexus. All rights reserved.',
    contactEmail: 'support@ainexus.com',
    contactPhone: '400-888-0000',
    icp: '',
  },
  home: {
    hero: {
      title: '聚合全球顶尖 AI 模型，\n一个接口，无限可能',
      subtitle: 'AI Nexus 统一接入 GPT-4o、Claude、DALL-E、Runway 等 50+ 大模型。一套 API Key，一个接口规范，轻松调用文本、图像、视频、语音等全部 AI 能力。',
      ctaPrimary: '免费开始',
      ctaSecondary: '查看价格',
      stats: [
        { label: '可用模型', value: '50', suffix: '+' },
        { label: '日均调用量', value: '2', suffix: '亿+' },
        { label: '服务客户', value: '1000', suffix: '+' },
        { label: 'SLA 可用性', value: '99.9', suffix: '%' },
      ],
    },
    features: [
      { title: '统一 API 接口', description: 'OpenAI-compatible 接口，一套代码切换任意模型', icon: 'Zap' },
      { title: '智能路由', description: '自动选择最优模型和供应商，失败自动降级', icon: 'Route' },
      { title: '完整异步支持', description: '图片、视频生成自动转异步，实时查询进度', icon: 'Clock' },
      { title: '企业级安全', description: 'IP 白名单、用量配额、密钥分级管理', icon: 'Shield' },
      { title: '透明计费', description: '按实际调用量计费，失败自动退款', icon: 'Coins' },
      { title: '实时观测', description: 'QPS、延迟、成功率实时大盘', icon: 'Activity' },
    ],
    showPartners: true,
    showSteps: true,
    showPreview: true,
    showTestimonials: true,
    showFaq: true,
  },
  pricing: {
    pageTitle: '透明定价，按需付费',
    pageSubtitle: '所有模型按实际调用量计费，无最低消费。1 元 = 10 积分，积分永不过期。',
    exchangeRate: 0.1,
    models: [
      { id: 'gpt-4o', model: 'GPT-4o', provider: 'OpenAI', category: 'text', inputPrice: 50, outputPrice: 150, imagePrice: null, videoPrice: null, note: '支持函数调用' },
      { id: 'gpt-4o-mini', model: 'GPT-4o-mini', provider: 'OpenAI', category: 'text', inputPrice: 5, outputPrice: 15, imagePrice: null, videoPrice: null, note: '高性价比' },
      { id: 'claude-sonnet', model: 'Claude 3.5 Sonnet', provider: 'Anthropic', category: 'text', inputPrice: 30, outputPrice: 150, imagePrice: null, videoPrice: null, note: '长上下文' },
      { id: 'claude-haiku', model: 'Claude 3 Haiku', provider: 'Anthropic', category: 'text', inputPrice: 5, outputPrice: 25, imagePrice: null, videoPrice: null, note: '快速响应' },
      { id: 'dall-e-3', model: 'DALL\u00b7E 3', provider: 'OpenAI', category: 'image', inputPrice: null, outputPrice: null, imagePrice: 500, videoPrice: null, note: '高质量图片' },
      { id: 'sd3', model: 'Stable Diffusion 3', provider: 'Stability AI', category: 'image', inputPrice: null, outputPrice: null, imagePrice: 200, videoPrice: null, note: '高性价比' },
      { id: 'runway-gen3', model: 'Runway Gen-3', provider: 'Runway', category: 'video', inputPrice: null, outputPrice: null, imagePrice: null, videoPrice: 1000, note: '视频生成' },
      { id: 'pika-15', model: 'Pika 1.5', provider: 'Pika', category: 'video', inputPrice: null, outputPrice: null, imagePrice: null, videoPrice: 800, note: '视频生成' },
      { id: 'embedding-3', model: 'Text Embedding 3', provider: 'OpenAI', category: 'embedding', inputPrice: 2, outputPrice: null, imagePrice: null, videoPrice: null, note: 'Embedding' },
      { id: 'whisper-v3', model: 'Whisper v3', provider: 'OpenAI', category: 'audio', inputPrice: 15, outputPrice: null, imagePrice: null, videoPrice: null, note: '语音转文字' },
    ],
    faq: [
      { question: '积分如何计算？', answer: '1 元人民币 = 10 积分。积分永久有效，不会过期。充值后积分即时到账。' },
      { question: '模型价格会变动吗？', answer: '当上游供应商调整价格时，我们会同步更新，并提前 7 天通过邮件通知所有客户。' },
      { question: '调用失败会扣费吗？', answer: '不会。系统会自动识别失败的调用，并在 24 小时内将积分退还到您的账户。' },
      { question: '可以开发票吗？', answer: '可以。充值后可在控制台申请开具增值税专用发票，我们将在 3 个工作日内处理。' },
      { question: '有免费额度吗？', answer: '新注册用户赠送 1000 积分免费试用额度，无需绑定支付方式即可开始使用。' },
    ],
    notice: '以上价格为参考价，实际以控制台实时价格为准。大规模使用可联系商务获取阶梯折扣。',
  },
  docs: {
    type: 'internal',
    feishuUrl: '',
    pageTitle: 'API 文档',
    pageSubtitle: '完整的 API 参考文档，帮助你快速接入 AI Nexus 平台。',
  },
};

/* ================================================================== */
/*  Storage Helpers                                                   */
/* ================================================================== */

function loadFromStorage(): CmsConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge with defaults to ensure all fields exist
    return mergeDeep(defaultCmsConfig, parsed);
  } catch {
    return null;
  }
}

function saveToStorage(config: CmsConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Deep merge helper
function mergeDeep(target: any, source: any): any {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = mergeDeep(
        (target[key] as any) || {},
        source[key] as any
      );
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/* ================================================================== */
/*  React Hook                                                        */
/* ================================================================== */

let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function useCmsConfig() {
  const [config, setConfigState] = useState<CmsConfig>(() => {
    return loadFromStorage() || defaultCmsConfig;
  });

  // Subscribe to external changes (e.g., from admin page)
  useEffect(() => {
    const update = () => {
      const fresh = loadFromStorage();
      if (fresh) setConfigState(fresh);
    };
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  // Full config update
  const setConfig = useCallback((newConfig: CmsConfig) => {
    const merged: CmsConfig = mergeDeep(defaultCmsConfig, newConfig);
    merged._updatedAt = new Date().toISOString();
    saveToStorage(merged);
    setConfigState(merged);
    notifyListeners();
  }, []);

  // Partial update (merge)
  const updateConfig = useCallback((partial: Partial<CmsConfig>) => {
    setConfigState((prev) => {
      const next: CmsConfig = mergeDeep(prev, partial);
      next._updatedAt = new Date().toISOString();
      saveToStorage(next);
      notifyListeners();
      return next;
    });
  }, []);

  // Reset to defaults
  const resetConfig = useCallback(() => {
    const fresh = { ...defaultCmsConfig, _updatedAt: new Date().toISOString() };
    saveToStorage(fresh);
    setConfigState(fresh);
    notifyListeners();
  }, []);

  return { config, setConfig, updateConfig, resetConfig };
}

// Read-only hook for website pages (lighter, no setter)
export function useCmsConfigReadonly(): CmsConfig {
  const [config, setConfig] = useState<CmsConfig>(() => {
    return loadFromStorage() || defaultCmsConfig;
  });

  useEffect(() => {
    const update = () => {
      const fresh = loadFromStorage();
      if (fresh) setConfig(fresh);
    };
    listeners.push(update);
    // Also listen for storage events (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) update();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners = listeners.filter((l) => l !== update);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return config;
}

// Export direct access for non-React contexts
export function getCmsConfig(): CmsConfig {
  return loadFromStorage() || defaultCmsConfig;
}
