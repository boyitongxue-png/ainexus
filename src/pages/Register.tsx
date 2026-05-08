import { useState, useMemo } from 'react';
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
/*  Password Strength Indicator                                        */
/* ------------------------------------------------------------------ */
function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-zA-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
      { level: 0, label: '', color: '' },
      { level: 1, label: '弱', color: '#F43F5E' },
      { level: 2, label: '中', color: '#FBBF24' },
      { level: 3, label: '强', color: '#3366FF' },
      { level: 4, label: '极强', color: '#34D399' },
    ];
    return levels[score];
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= strength.level ? strength.color : 'var(--dark-border)',
            }}
          />
        ))}
      </div>
      <p className="text-caption" style={{ color: strength.color }}>
        密码强度：{strength.label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Register Component                                            */
/* ------------------------------------------------------------------ */
export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (username.length < 2 || username.length > 20) {
      newErrors.username = '用户名长度为 2-20 位';
    }
    if (!email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱格式';
    }
    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 8) {
      newErrors.password = '密码至少 8 位';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    if (!agreed) {
      newErrors.agreed = '请同意服务条款和隐私政策';
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
        id: 'u_' + Date.now(),
        email,
        name: username,
        role: 'owner',
        avatar: (username || email).charAt(0).toUpperCase(),
      }));
      setIsLoading(false);
      navigate('/console/overview');
    }, 1500);
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
              to="/login"
              className="text-body-sm text-[#3366FF] hover:text-[var(--brand-300)] transition-colors font-medium"
            >
              已有账户？立即登录 →
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
            <h1 className="font-space text-h2 text-white">创建账户</h1>
            <p className="mt-2 text-body text-[var(--slate-400)]">开启您的 AI Nexus 之旅，注册即送 1000 积分</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label className="block text-body-sm font-medium text-[var(--slate-300)] mb-2">
                用户名
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                  }}
                  placeholder="您的用户名"
                  className={`w-full h-10 pl-10 pr-3 rounded-lg bg-[var(--dark-bg)] border text-body-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] focus:ring-1 focus:ring-[#3366FF] transition-all ${
                    errors.username ? 'border-[#EF4444]' : 'border-[var(--dark-border)]'
                  }`}
                />
              </div>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-caption text-[#EF4444]"
                >
                  {errors.username}
                </motion.p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.48 }}
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
              transition={{ duration: 0.4, delay: 0.56 }}
            >
              <label className="block text-body-sm font-medium text-[var(--slate-300)] mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="至少 8 位，包含字母和数字"
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
              <PasswordStrength password={password} />
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

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.64 }}
            >
              <label className="block text-body-sm font-medium text-[var(--slate-300)] mb-2">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="再次输入密码"
                  className={`w-full h-10 pl-10 pr-10 rounded-lg bg-[var(--dark-bg)] border text-body-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] focus:ring-1 focus:ring-[#3366FF] transition-all ${
                    errors.confirmPassword ? 'border-[#EF4444]' : 'border-[var(--dark-border)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)] hover:text-[var(--slate-300)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-caption text-[#EF4444]"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            {/* Terms agreement */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.72 }}
            >
              <button
                type="button"
                onClick={() => {
                  setAgreed(!agreed);
                  if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: '' }));
                }}
                className="flex items-start gap-3 w-full"
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    agreed
                      ? 'bg-[#3366FF] border-[#3366FF]'
                      : 'border-[var(--dark-border)] bg-[var(--dark-bg)]'
                  }`}
                >
                  {agreed && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-body-sm text-[var(--slate-400)] text-left">
                  我已阅读并同意{' '}
                  <Link to="#" className="text-[#3366FF] hover:underline">服务条款</Link>
                  {' '}和{' '}
                  <Link to="#" className="text-[#3366FF] hover:underline">隐私政策</Link>
                </span>
              </button>
              {errors.agreed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-caption text-[#EF4444]"
                >
                  {errors.agreed}
                </motion.p>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#3366FF] text-white font-semibold rounded-full hover:bg-[#2244CC] transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    创建账户
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--dark-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--dark-card)] text-[var(--slate-500)] text-caption">
                或使用以下方式注册
              </span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="h-10 flex items-center justify-center gap-2 rounded-lg border border-[var(--dark-border)] bg-transparent text-body-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] hover:text-white transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="h-10 flex items-center justify-center gap-2 rounded-lg border border-[var(--dark-border)] bg-transparent text-body-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] hover:text-white transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Bottom login link */}
          <p className="mt-8 text-center text-body-sm text-[var(--slate-400)]">
            已有账户？{' '}
            <Link to="/login" className="text-[#3366FF] hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
