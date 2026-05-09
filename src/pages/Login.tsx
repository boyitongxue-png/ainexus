import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  Check,
  Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Feature item for left panel                                        */
/* ------------------------------------------------------------------ */
function FeatureItem({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <div className="w-5 h-5 rounded-full bg-[#34D399]/20 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-[#34D399]" />
      </div>
      <span className="text-body-sm text-[var(--slate-300)]">{text}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Login Component                                               */
/* ------------------------------------------------------------------ */
export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱格式';
    }
    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少 6 位';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Save mock auth to localStorage
      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('ainexus_auth_token', token);
      localStorage.setItem('ainexus_user', JSON.stringify({
        id: 'u_1',
        email,
        name: email.split('@')[0],
        role: 'owner',
        avatar: email.charAt(0).toUpperCase(),
      }));
      localStorage.setItem('ainexus_remember_me', String(rememberMe));
      setIsLoading(false);
      navigate('/console/overview');
    }, 1200);
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* ====== LEFT: Brand Panel (desktop) ====== */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center relative overflow-hidden"
        style={{
          background: 'var(--dark-bg)',
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/hero-bg-mesh.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(51,102,255,0.15) 0%, var(--dark-bg) 60%)' }}
        />

        <div className="relative z-10 px-16 max-w-[520px]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link to="/home" className="inline-flex items-center gap-2">
              <span className="font-space text-3xl font-bold text-[#3366FF]">AI Nexus</span>
            </Link>
            <div className="w-[60px] h-px bg-[#3366FF]/30 mt-6 mb-6" />
          </motion.div>

          {/* Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-space text-h3 text-white font-semibold"
          >
            统一大模型 API 平台
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 text-body text-[var(--slate-400)] max-w-[400px]"
          >
            一个 API Key 调用全球顶级 AI 模型，简化开发，降低成本。
          </motion.p>

          {/* Feature list */}
          <div className="mt-12 space-y-4">
            <FeatureItem text="50+ AI 模型集成" />
            <FeatureItem text="OpenAI 兼容 API" />
            <FeatureItem text="99.9% 服务可用性" />
            <FeatureItem text="实时调用监控" />
          </div>

          {/* Bottom link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-auto pt-16"
          >
            <Link
              to="/register"
              className="text-body-sm text-[#3366FF] hover:text-[var(--brand-300)] transition-colors font-medium"
            >
              还没有账户？立即注册 →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ====== RIGHT: Form Panel ====== */}
      <div className="w-full lg:w-1/2 min-h-[100dvh] bg-[var(--dark-card)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: shake ? 0.8 : 1, x: shake ? [-8, 8, -4, 4, 0] : 0 }}
          transition={{
            opacity: { duration: 0.6, delay: 0.2 },
            x: shake ? { duration: 0.3 } : { duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
          }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/home" className="inline-flex items-center gap-2">
              <span className="font-space text-2xl font-bold text-[#3366FF]">AI Nexus</span>
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-space text-h2 text-white">欢迎回来</h1>
            <p className="mt-2 text-body text-[var(--slate-400)]">登录您的 AI Nexus 账户</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label className="block text-body-sm font-medium text-[var(--slate-300)] mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="you@company.com"
                  className={`w-full h-10 pl-10 pr-3 rounded-lg bg-[var(--dark-bg)] border text-body-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] focus:ring-1 focus:ring-[#3366FF] transition-all ${
                    errors.email ? 'border-[#EF4444]' : 'border-[var(--dark-border)]'
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-caption text-[#EF4444]"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.48 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-body-sm font-medium text-[var(--slate-300)]">
                  密码
                </label>
                <Link
                  to="#"
                  className="text-body-sm text-[#3366FF] hover:text-[var(--brand-300)] transition-colors"
                >
                  忘记密码？
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="输入密码"
                  className={`w-full h-10 pl-10 pr-10 rounded-lg bg-[var(--dark-bg)] border text-body-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] focus:ring-1 focus:ring-[#3366FF] transition-all ${
                    errors.password ? 'border-[#EF4444]' : 'border-[var(--dark-border)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)] hover:text-[var(--slate-300)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-caption text-[#EF4444]"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Remember me */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.56 }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  rememberMe
                    ? 'bg-[#3366FF] border-[#3366FF]'
                    : 'border-[var(--dark-border)] bg-[var(--dark-bg)]'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-body-sm text-[var(--slate-300)]">记住我</span>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.64 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#3366FF] text-white font-semibold rounded-full hover:bg-[#2244CC] transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    登录
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* OAuth Notice */}
          <div className="mt-6 py-4 text-center border-t border-[var(--dark-border)]">
            <p className="text-xs text-[var(--slate-500)]">
              本平台采用 OAuth 2.0 安全认证
            </p>
          </div>

          {/* Bottom register link */}
          <p className="mt-8 text-center text-body-sm text-[var(--slate-400)]">
            还没有账户？{' '}
            <Link to="/register" className="text-[#3366FF] hover:underline font-medium">
              立即注册
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
