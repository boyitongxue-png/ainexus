import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Key, Loader2, AlertTriangle } from 'lucide-react';
import { platformKeys } from '@/lib/mockData';

export default function PortalLogin() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim() || apiKey.length < 10) {
      setError('请输入有效的 API Key');
      return;
    }

    setIsLoading(true);

    // Simulate validation delay
    setTimeout(() => {
      // Check if key exists in mock data (prefix match)
      const keyPreview = apiKey.startsWith('nxsk_') ? apiKey.slice(0, 12) + '...' + apiKey.slice(-6) : apiKey;
      const matched = platformKeys.find((k) =>
        apiKey.startsWith('nxsk_')
          ? k.keyPreview === keyPreview || k.keyPreview === apiKey
          : k.keyPreview.includes(apiKey.slice(0, 8))
      );

      if (matched || apiKey.startsWith('nxsk_') || apiKey.startsWith('pk_')) {
        // Store portal key
        localStorage.setItem('ainexus_portal_key', apiKey);
        // Also store a mock user for this key
        localStorage.setItem('ainexus_portal_user', JSON.stringify({
          keyName: matched?.name || 'API Key',
          keyPreview: keyPreview,
          permissions: matched?.permissions || ['chat'],
        }));
        setIsLoading(false);
        navigate('/portal/overview');
      } else {
        setIsLoading(false);
        setError('API Key 无效或已被撤销');
      }
    }, 800);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--dark-bg)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/home" className="inline-flex items-center gap-2 mb-4">
            <span className="font-space text-3xl font-bold text-[#3366FF]">AI Nexus</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#3366FF]/15 flex items-center justify-center">
              <Key className="w-4 h-4 text-[#3366FF]" />
            </div>
            <h1 className="font-space text-xl font-semibold text-white">开发者门户</h1>
          </div>
          <p className="text-body-sm text-[var(--slate-500)]">
            输入您的平台 API Key 查看调用记录和消耗统计
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[var(--dark-text)] mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="nxsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`w-full h-11 px-4 rounded-lg bg-[var(--dark-bg)] border text-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] transition-all font-jetbrains ${
                  error ? 'border-[#EF4444]' : 'border-[var(--dark-border)]'
                }`}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-[12px] text-[#EF4444] flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-[#3366FF] text-white font-semibold rounded-full hover:bg-[#2244CC] transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  验证中...
                </>
              ) : (
                <>
                  进入开发者门户
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick access hint */}
          <div className="mt-5 p-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)]">
            <p className="text-[11px] text-[var(--slate-500)] mb-1.5">测试用 Key（点击复制）:</p>
            {platformKeys.slice(0, 2).map((k) => (
              <button
                key={k.id}
                onClick={() => {
                  setApiKey(k.keyPreview || 'nxsk_testdemokey1234567890abcdef');
                  setError('');
                }}
                className="block w-full text-left text-[11px] font-jetbrains text-[#3366FF] hover:text-[#7A9FFF] transition-colors mb-1 truncate"
              >
                {k.keyPreview}
              </button>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-[12px] text-[var(--slate-500)]">
            还没有 API Key？{' '}
            <Link to="/register" className="text-[#3366FF] hover:underline">
              注册平台账号
            </Link>
          </p>
          <p className="text-[12px] text-[var(--slate-500)]">
            <Link to="/login" className="text-[var(--slate-400)] hover:text-white transition-colors">
              前往控制台登录
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
