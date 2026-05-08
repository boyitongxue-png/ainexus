import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Search,
  Menu,
  X,
  ArrowLeft,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useCmsConfigReadonly } from '@/hooks/useCmsConfig';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/* ================================================================== */
/*  Navigation data                                                    */
/* ================================================================== */
const navGroups: NavGroup[] = [
  {
    title: '快速入门',
    items: [
      { label: '简介', href: '#intro' },
      { label: '环境准备', href: '#setup' },
      { label: '第一个 API 调用', href: '#first-call' },
      { label: 'SDK 安装', href: '#sdk-install' },
    ],
  },
  {
    title: '认证',
    items: [
      { label: 'API Key 获取', href: '#auth-key' },
      { label: '请求头格式', href: '#auth-header' },
      { label: '错误码说明', href: '#auth-errors' },
    ],
  },
  {
    title: '文本对话',
    items: [
      { label: '发起对话 /chat/completions', href: '#chat-completions' },
      { label: '流式响应', href: '#streaming' },
      { label: '函数调用', href: '#function-calling' },
      { label: '多轮对话', href: '#multi-turn' },
      { label: '错误处理', href: '#chat-errors' },
    ],
  },
  {
    title: '图片生成',
    items: [
      { label: '生成图片 /images/generations', href: '#image-generations' },
      { label: '查询任务 /images/{task_id}', href: '#image-task' },
    ],
  },
  {
    title: '视频生成',
    items: [
      { label: '生成视频 /videos/generations', href: '#video-generations' },
      { label: '查询任务 /videos/{task_id}', href: '#video-task' },
    ],
  },
  {
    title: 'Embedding',
    items: [
      { label: '文本嵌入 /embeddings', href: '#embeddings' },
    ],
  },
  {
    title: '语音',
    items: [
      { label: '语音转文字 /audio/transcriptions', href: '#audio-transcriptions' },
    ],
  },
  {
    title: '模型列表',
    items: [
      { label: '获取模型列表 /models', href: '#models-list' },
    ],
  },
  {
    title: 'Webhook',
    items: [
      { label: '配置回调 /webhooks', href: '#webhooks-config' },
      { label: '回调签名验证', href: '#webhooks-verify' },
    ],
  },
  {
    title: '错误处理',
    items: [
      { label: '状态码', href: '#error-status' },
      { label: '错误格式', href: '#error-format' },
      { label: '重试策略', href: '#error-retry' },
    ],
  },
  {
    title: 'SDK',
    items: [
      { label: 'Python SDK', href: '#sdk-python' },
      { label: 'Node.js SDK', href: '#sdk-nodejs' },
      { label: 'Java SDK', href: '#sdk-java' },
      { label: 'Go SDK', href: '#sdk-go' },
    ],
  },
];

/* ================================================================== */
/*  Section IDs for TOC                                                */
/* ================================================================== */
const tocSections = [
  { id: 'intro', label: 'API 简介' },
  { id: 'first-call', label: '第一个 API 调用' },
  { id: 'auth-header', label: 'API 认证' },
  { id: 'chat-completions', label: '发起对话' },
  { id: 'image-generations', label: '生成图片' },
  { id: 'video-generations', label: '生成视频' },
  { id: 'streaming', label: '流式响应' },
  { id: 'webhooks-config', label: 'Webhook 回调' },
  { id: 'error-status', label: '错误处理' },
  { id: 'sdk-python', label: 'Python SDK' },
];

/* ================================================================== */
/*  Code examples                                                       */
/* ================================================================== */
const curlExample = `curl https://api.ainexus.com/v1/chat/completions \\\\n  -H "Content-Type: application/json" \\\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\\n  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

const chatResponseExample = JSON.stringify({
  id: "chatcmpl-abc123",
  object: "chat.completion",
  created: 1677652288,
  model: "gpt-4o",
  choices: [{
    index: 0,
    message: {
      role: "assistant",
      content: "Hello! How can I assist you today?"
    },
    finish_reason: "stop"
  }],
  usage: {
    prompt_tokens: 9,
    completion_tokens: 12,
    total_tokens: 21
  }
}, null, 2);

const chatRequestExample = JSON.stringify({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the weather like?" }
  ],
  temperature: 0.7,
  max_tokens: 500
}, null, 2);

const imageRequestExample = JSON.stringify({
  model: "dall-e-3",
  prompt: "A futuristic cityscape at sunset",
  size: "1024x1024",
  quality: "standard",
  n: 1
}, null, 2);

const imageResponseExample = JSON.stringify({
  task_id: "img-task-abc123",
  status: "pending",
  created_at: "2024-01-15T10:30:00Z"
}, null, 2);

const videoRequestExample = JSON.stringify({
  model: "runway-gen3",
  prompt: "A cat playing piano in a jazz club",
  duration: 5,
  ratio: "16:9"
}, null, 2);

const videoResponseExample = JSON.stringify({
  task_id: "vid-task-abc123",
  status: "pending",
  created_at: "2024-01-15T10:30:00Z"
}, null, 2);

const taskResponseExample = JSON.stringify({
  task_id: "img-task-abc123",
  status: "completed",
  result: {
    url: "https://cdn.ainexus.com/results/img-abc123.png",
    width: 1024,
    height: 1024
  },
  credits_used: 500,
  created_at: "2024-01-15T10:30:00Z",
  completed_at: "2024-01-15T10:30:25Z"
}, null, 2);

const streamingExample = `const response = await fetch('https://api.ainexus.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{role: 'user', content: 'Hello'}],
    stream: true
  })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // 处理 SSE 数据块
}`;

const webhookVerifyExample = `import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)`;

const errorResponseExample = JSON.stringify({
  error: {
    code: "invalid_api_key",
    message: "The provided API key is invalid or has expired.",
    type: "authentication_error"
  }
}, null, 2);

const sdkPythonExample = `from ainexus import AI Nexus

client = AI Nexus(api_key="YOUR_API_KEY")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`;

const sdkNodeExample = `import { AI Nexus } from 'ainexus';

const client = new AI Nexus({
  apiKey: 'YOUR_API_KEY'
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);`;

const sdkJavaExample = `import com.ainexus.AI Nexus;
import com.ainexus.models.*;

public class Example {
    public static void main(String[] args) {
        AI Nexus client = new AI Nexus("YOUR_API_KEY");
        
        ChatCompletion response = client.chat().completions().create(
            "gpt-4o",
            List.of(new Message("user", "Hello!"))
        );
        
        System.out.println(response.getChoices().get(0).getMessage().getContent());
    }
}`;

const sdkGoExample = `package main

import (
    "context"
    "fmt"
    "github.com/ainexus/ainexus-go"
)

func main() {
    client := ainexus.NewClient("YOUR_API_KEY")
    
    resp, err := client.Chat.Completions.Create(context.Background(), &ainexus.ChatRequest{
        Model: "gpt-4o",
        Messages: []ainexus.Message{
            {Role: "user", Content: "Hello!"},
        },
    })
    
    if err != nil {
        panic(err)
    }
    
    fmt.Println(resp.Choices[0].Message.Content)
}`;

/* ================================================================== */
/*  Code Block Component                                               */
/* ================================================================== */
function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[var(--slate-950)] rounded-xl overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--slate-900)] border-b border-[var(--dark-border)]">
        <span className="text-xs text-[var(--slate-500)]">{language}</span>
        <button
          onClick={copy}
          className="p-1.5 rounded-md hover:bg-[var(--dark-hover)] transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-[#34D399]" /> : <Copy className="w-4 h-4 text-[var(--slate-500)]" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-[var(--slate-200)] font-jetbrains leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ================================================================== */
/*  Inline Code                                                        */
/* ================================================================== */
function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-jetbrains text-code bg-[var(--brand-100)]/10 text-[var(--brand-300)] px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

/* ================================================================== */
/*  Alert Box                                                          */
/* ================================================================== */
function AlertBox({ type = 'info', children }: { type?: 'info' | 'warning' | 'success' | 'error'; children: React.ReactNode }) {
  const styles = {
    info: { border: '#3B82F6', bg: 'rgba(59,130,246,0.08)', icon: Info, iconColor: '#3B82F6' },
    warning: { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle, iconColor: '#F59E0B' },
    success: { border: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle, iconColor: '#10B981' },
    error: { border: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle, iconColor: '#EF4444' },
  };
  const s = styles[type];
  const IconComp = s.icon;
  return (
    <div className="flex gap-3 p-4 rounded-xl my-4" style={{ borderLeft: `3px solid ${s.border}`, backgroundColor: s.bg }}>
      <IconComp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: s.iconColor }} />
      <div className="text-body-sm text-[var(--slate-300)]">{children}</div>
    </div>
  );
}

/* ================================================================== */
/*  Endpoint Card                                                      */
/* ================================================================== */
function EndpointCard({ method, path, auth }: { method: string; path: string; auth: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 my-4 p-4 bg-[var(--dark-bg)] rounded-xl border border-[var(--dark-border)]">
      <span className="px-3 py-1 rounded-full bg-[#3366FF] text-white text-caption font-semibold">{method}</span>
      <code className="font-jetbrains text-body-sm text-[#7A9FFF]">{path}</code>
      <span className="px-3 py-1 rounded-full bg-[var(--dark-card)] text-[var(--slate-400)] text-caption border border-[var(--dark-border)]">{auth}</span>
    </div>
  );
}

/* ================================================================== */
/*  Parameter Table                                                    */
/* ================================================================== */
function ParamTable({ rows }: { rows: { name: string; type: string; required: string; desc: string }[] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[var(--dark-sidebar)]">
            <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase rounded-tl-lg">参数</th>
            <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">类型</th>
            <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase">必需</th>
            <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase rounded-tr-lg">说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--dark-border)]">
          {rows.map((r) => (
            <tr key={r.name} className="bg-[var(--dark-bg)] hover:bg-[var(--dark-hover)] transition-colors">
              <td className="py-3 px-4 font-jetbrains text-body-sm text-[#7A9FFF]">{r.name}</td>
              <td className="py-3 px-4 text-body-sm text-[var(--slate-400)]">{r.type}</td>
              <td className="py-3 px-4">
                <span className={`text-caption font-semibold ${r.required === '是' ? 'text-[#34D399]' : 'text-[var(--slate-500)]'}`}>
                  {r.required}
                </span>
              </td>
              <td className="py-3 px-4 text-body-sm text-[var(--slate-300)]">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================== */
/*  Error Code Table                                                   */
/* ================================================================== */
const errorCodes = [
  { code: '200', desc: '请求成功' },
  { code: '400', desc: '请求参数错误' },
  { code: '401', desc: 'API Key 无效或已过期' },
  { code: '403', desc: '权限不足' },
  { code: '404', desc: '资源不存在' },
  { code: '429', desc: '请求过于频繁' },
  { code: '500', desc: '服务器内部错误' },
  { code: '502', desc: '上游供应商服务异常' },
];

/* ================================================================== */
/*  Docs Main Component                                                */
/* ================================================================== */
export default function Docs() {
  const cms = useCmsConfigReadonly();

  // Feishu redirect: if configured, redirect to feishu URL
  if (cms.docs.type === 'feishu' && cms.docs.feishuUrl) {
    window.location.href = cms.docs.feishuUrl;
    return (
      <div className="min-h-[100dvh] bg-[var(--dark-bg)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#3366FF]/15 flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-[#3366FF]" />
          </div>
          <h2 className="font-space text-xl text-white mb-2">正在跳转到帮助文档</h2>
          <p className="text-sm text-[var(--slate-400)] mb-4">即将前往飞书文档...</p>
          <a
            href={cms.docs.feishuUrl}
            className="text-[#3366FF] text-sm hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            如果没有自动跳转，点击这里
          </a>
        </motion.div>
      </div>
    );
  }

  const [activeSection, setActiveSection] = useState('intro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '快速入门': true,
    '文本对话': true,
    '错误处理': false,
    'SDK': false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  /* Intersection Observer for TOC highlighting */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    const ids = tocSections.map((s) => s.id);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  }, []);

  /* Filter nav based on search */
  const filteredNavGroups = searchQuery
    ? navGroups.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter((g) => g.items.length > 0)
    : navGroups;

  return (
    <div className="min-h-[100dvh] bg-[var(--dark-bg)]">
      {/* ====== HEADER BAR ====== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--dark-bg)]/80 backdrop-blur-md border-b border-[var(--dark-border)]">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left: Logo + menu toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--slate-400)] hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-space text-lg font-bold text-[#3366FF]">AI Nexus</span>
              <span className="text-body-sm text-[var(--slate-500)]">API Docs</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-[var(--slate-500)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文档..."
              className="w-[400px] h-9 pl-9 pr-4 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-body-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] focus:ring-1 focus:ring-[#3366FF] transition-all"
            />
          </div>

          {/* Right: Version + back */}
          <div className="flex items-center gap-3">
            <select className="hidden sm:block h-9 px-3 rounded-lg bg-[var(--dark-card)] border border-[var(--dark-border)] text-body-sm text-[var(--slate-300)] focus:outline-none focus:border-[#3366FF]">
              <option>v1 (最新)</option>
            </select>
            <button
              onClick={() => navigate('/console/overview')}
              className="hidden sm:inline-flex items-center gap-1.5 text-body-sm text-[#3366FF] hover:text-[var(--brand-300)] transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              控制台
            </button>
          </div>
        </div>
      </header>

      {/* ====== MOBILE SIDEBAR DRAWER ====== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="absolute left-0 top-14 bottom-0 w-[280px] bg-[var(--dark-sidebar)] border-r border-[var(--dark-border)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent
                groups={filteredNavGroups}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                onNavClick={(href) => {
                  scrollToSection(href.replace('#', ''));
                }}
                activeSection={activeSection}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== DESKTOP SIDEBAR ====== */}
      <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-[280px] bg-[var(--dark-sidebar)] border-r border-[var(--dark-border)] overflow-y-auto z-30">
        <SidebarContent
          groups={filteredNavGroups}
          expandedGroups={expandedGroups}
          toggleGroup={toggleGroup}
          onNavClick={(href) => scrollToSection(href.replace('#', ''))}
          activeSection={activeSection}
        />
      </aside>

      {/* ====== MAIN CONTENT ====== */}
      <main ref={contentRef} className="lg:ml-[280px] xl:mr-[200px] pt-14">
        <div className="max-w-[900px] px-6 lg:px-12 py-10">

          {/* --- Chapter: API Intro --- */}
          <section id="intro" className="mb-16">
            <h1 className="font-space text-h1 text-white mb-4">API 简介</h1>
            <p className="text-body text-[var(--slate-200)] leading-relaxed">
              AI Nexus API 提供统一的大模型调用接口，兼容 OpenAI API 格式。通过简单的 HTTP 请求，即可调用 GPT-4o、Claude、DALL·E 等多种 AI 模型能力。
            </p>
            <AlertBox type="info">
              所有 API 请求都需要在 Header 中携带您的平台 API Key。请在控制台 → 平台 API Key 中创建和管理您的 Key。
            </AlertBox>

            <div id="setup" className="mt-12">
              <h2 className="font-space text-h2 text-white mb-4">环境准备</h2>
              <p className="text-body text-[var(--slate-200)] leading-relaxed">
                在开始之前，您需要注册一个 AI Nexus 账户并创建一个平台 API Key。然后选择您喜欢的 HTTP 客户端或 SDK 即可开始调用。
              </p>
            </div>

            <div id="sdk-install" className="mt-12">
              <h2 className="font-space text-h2 text-white mb-4">SDK 安装</h2>
              <p className="text-body text-[var(--slate-200)] leading-relaxed mb-4">
                我们提供多种官方 SDK，也可以直接使用任意 OpenAI 兼容的客户端：
              </p>
              <CodeBlock code="pip install ainexus" language="bash" />
              <CodeBlock code="npm install ainexus" language="bash" />
            </div>
          </section>

          {/* --- Chapter: First API Call --- */}
          <section id="first-call" className="mb-16">
            <h2 className="font-space text-h2 text-white mb-4">第一个 API 调用</h2>
            <p className="text-body text-[var(--slate-200)] leading-relaxed mb-4">
              使用 curl 发起一个简单的对话请求：
            </p>
            <CodeBlock code={curlExample} language="bash" />
            <p className="text-body text-[var(--slate-200)] leading-relaxed mt-6 mb-4">
              响应示例：
            </p>
            <CodeBlock code={chatResponseExample} language="json" />
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: Auth --- */}
          <section id="auth-key" className="mb-16">
            <h2 className="font-space text-h2 text-white mb-4">API 认证</h2>
            <p className="text-body text-[var(--slate-200)] leading-relaxed">
              所有 API 请求必须在 HTTP Header 中包含 <InlineCode>Authorization</InlineCode> 字段：
            </p>
            <CodeBlock code="Authorization: Bearer YOUR_PLATFORM_API_KEY" language="http" />
            <AlertBox type="warning">
              请勿在前端代码或公开仓库中暴露您的 API Key。建议将 Key 存储在服务器环境变量中，通过后端代理发起 API 调用。
            </AlertBox>
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: Chat Completions --- */}
          <section id="chat-completions" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">发起对话</h2>
            <EndpointCard method="POST" path="/v1/chat/completions" auth="Bearer Token" />

            <h3 className="font-space text-h4 text-white mt-8 mb-4">请求参数</h3>
            <ParamTable rows={[
              { name: 'model', type: 'string', required: '是', desc: '模型 ID，如 "gpt-4o"' },
              { name: 'messages', type: 'array', required: '是', desc: '消息数组' },
              { name: 'temperature', type: 'float', required: '否', desc: '0-2，默认 1' },
              { name: 'max_tokens', type: 'integer', required: '否', desc: '最大生成 token 数' },
              { name: 'stream', type: 'boolean', required: '否', desc: '是否流式返回' },
              { name: 'tools', type: 'array', required: '否', desc: '函数调用工具定义' },
            ]} />

            <h3 className="font-space text-h4 text-white mt-8 mb-4">请求示例</h3>
            <CodeBlock code={chatRequestExample} language="json" />

            <h3 className="font-space text-h4 text-white mt-8 mb-4">响应字段</h3>
            <ParamTable rows={[
              { name: 'id', type: 'string', required: '-', desc: '唯一标识' },
              { name: 'object', type: 'string', required: '-', desc: '"chat.completion"' },
              { name: 'created', type: 'integer', required: '-', desc: '时间戳' },
              { name: 'model', type: 'string', required: '-', desc: '实际使用的模型' },
              { name: 'choices', type: 'array', required: '-', desc: '生成结果数组' },
              { name: 'usage', type: 'object', required: '-', desc: 'token 使用量' },
            ]} />
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: Image Generations --- */}
          <section id="image-generations" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">生成图片</h2>
            <EndpointCard method="POST" path="/v1/images/generations" auth="Bearer Token" />
            <AlertBox type="info">
              图片生成采用异步模式。提交请求后返回任务 ID，通过轮询或 Webhook 获取结果。
            </AlertBox>
            <h3 className="font-space text-h4 text-white mt-8 mb-4">请求示例</h3>
            <CodeBlock code={imageRequestExample} language="json" />
            <h3 className="font-space text-h4 text-white mt-8 mb-4">响应示例</h3>
            <CodeBlock code={imageResponseExample} language="json" />
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: Video Generations --- */}
          <section id="video-generations" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">生成视频</h2>
            <EndpointCard method="POST" path="/v1/videos/generations" auth="Bearer Token" />
            <AlertBox type="info">
              视频生成采用异步模式。支持文本生成视频和图片生成视频两种模式。
            </AlertBox>
            <h3 className="font-space text-h4 text-white mt-8 mb-4">请求示例</h3>
            <CodeBlock code={videoRequestExample} language="json" />
            <h3 className="font-space text-h4 text-white mt-8 mb-4">响应示例</h3>
            <CodeBlock code={videoResponseExample} language="json" />
          </section>

          {/* --- Chapter: Task Status --- */}
          <section id="image-task" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">查询异步任务</h2>
            <EndpointCard method="GET" path="/v1/tasks/{task_id}" auth="Bearer Token" />
            <p className="text-body text-[var(--slate-200)] leading-relaxed mb-4">
              对于异步任务（图片/视频生成），使用此端点查询任务执行状态和结果。
            </p>
            <CodeBlock code={taskResponseExample} language="json" />
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: Streaming --- */}
          <section id="streaming" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">流式响应 (SSE)</h2>
            <p className="text-body text-[var(--slate-200)] leading-relaxed mb-4">
              设置 <InlineCode>stream: true</InlineCode> 启用 Server-Sent Events 流式返回。适用于需要实时显示生成内容的场景。
            </p>
            <CodeBlock code={streamingExample} language="javascript" />
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: Webhook --- */}
          <section id="webhooks-config" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">Webhook 回调</h2>
            <p className="text-body text-[var(--slate-200)] leading-relaxed mb-4">
              对于异步任务（图片/视频生成），可以配置 Webhook URL 接收任务完成通知。
            </p>
            <h3 className="font-space text-h4 text-white mt-6 mb-4">签名验证</h3>
            <CodeBlock code={webhookVerifyExample} language="python" />
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: Error Handling --- */}
          <section id="error-status" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">错误处理</h2>
            <h3 className="font-space text-h4 text-white mt-6 mb-4">HTTP 状态码</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--dark-sidebar)]">
                    <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase rounded-tl-lg">状态码</th>
                    <th className="py-3 px-4 text-caption text-[var(--slate-400)] uppercase rounded-tr-lg">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dark-border)]">
                  {errorCodes.map((ec) => (
                    <tr key={ec.code} className="bg-[var(--dark-bg)] hover:bg-[var(--dark-hover)] transition-colors">
                      <td className="py-3 px-4 font-jetbrains text-body-sm text-[#7A9FFF]">{ec.code}</td>
                      <td className="py-3 px-4 text-body-sm text-[var(--slate-300)]">{ec.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-space text-h4 text-white mt-8 mb-4">错误响应格式</h3>
            <CodeBlock code={errorResponseExample} language="json" />

            <div id="error-retry" className="mt-8">
              <h3 className="font-space text-h4 text-white mb-4">重试策略</h3>
              <p className="text-body text-[var(--slate-200)] leading-relaxed">
                对于 429（速率限制）和 5xx（服务器错误），建议使用指数退避策略进行重试。首次等待 1 秒，之后每次翻倍，最多重试 3 次。
              </p>
            </div>
          </section>

          <hr className="border-[var(--dark-border)] my-8" />

          {/* --- Chapter: SDK --- */}
          <section id="sdk-python" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">Python SDK</h2>
            <h3 className="font-space text-h4 text-white mt-6 mb-4">安装</h3>
            <CodeBlock code="pip install ainexus" language="bash" />
            <h3 className="font-space text-h4 text-white mt-6 mb-4">使用示例</h3>
            <CodeBlock code={sdkPythonExample} language="python" />
          </section>

          <section id="sdk-nodejs" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">Node.js SDK</h2>
            <h3 className="font-space text-h4 text-white mt-6 mb-4">安装</h3>
            <CodeBlock code="npm install ainexus" language="bash" />
            <h3 className="font-space text-h4 text-white mt-6 mb-4">使用示例</h3>
            <CodeBlock code={sdkNodeExample} language="typescript" />
          </section>

          <section id="sdk-java" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">Java SDK</h2>
            <CodeBlock code={sdkJavaExample} language="java" />
          </section>

          <section id="sdk-go" className="mb-16 scroll-mt-20">
            <h2 className="font-space text-h2 text-white mb-4">Go SDK</h2>
            <CodeBlock code={sdkGoExample} language="go" />
          </section>

        </div>
      </main>

      {/* ====== RIGHT TOC (desktop only) ====== */}
      <aside className="hidden xl:block fixed right-0 top-14 bottom-0 w-[200px] overflow-y-auto py-10 px-4">
        <p className="text-caption text-[var(--slate-500)] uppercase mb-3 tracking-wider">本页内容</p>
        <ul className="space-y-1">
          {tocSections.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => scrollToSection(s.id)}
                className={`w-full text-left text-body-sm px-3 py-1.5 rounded-md transition-all border-l-2 ${
                  activeSection === s.id
                    ? 'text-[#3366FF] border-[#3366FF] bg-[rgba(51,102,255,0.08)]'
                    : 'text-[var(--slate-400)] border-transparent hover:text-white hover:bg-[var(--dark-hover)]'
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

/* ================================================================== */
/*  Sidebar Content Component                                          */
/* ================================================================== */
function SidebarContent({
  groups,
  expandedGroups,
  toggleGroup,
  onNavClick,
  activeSection,
}: {
  groups: NavGroup[];
  expandedGroups: Record<string, boolean>;
  toggleGroup: (title: string) => void;
  onNavClick: (href: string) => void;
  activeSection: string;
}) {
  return (
    <nav className="py-4">
      {groups.map((group) => (
        <div key={group.title} className="mb-2">
          <button
            onClick={() => toggleGroup(group.title)}
            className="w-full flex items-center justify-between px-5 py-2 text-caption text-[var(--slate-500)] uppercase tracking-wider hover:text-[var(--slate-300)] transition-colors"
          >
            <span>{group.title}</span>
            {expandedGroups[group.title] ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <AnimatePresence initial={false}>
            {expandedGroups[group.title] && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                className="overflow-hidden"
              >
                {group.items.map((item) => {
                  const sectionId = item.href.replace('#', '');
                  const isActive = activeSection === sectionId;
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => onNavClick(item.href)}
                        className={`w-full text-left text-body-sm px-5 py-2 transition-all border-l-[3px] ${
                          isActive
                            ? 'text-[#3366FF] border-[#3366FF] bg-[var(--dark-sidebar-active)]'
                            : 'text-[var(--slate-300)] border-transparent hover:text-white hover:bg-[var(--dark-hover)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
}
