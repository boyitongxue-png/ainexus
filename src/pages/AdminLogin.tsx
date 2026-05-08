import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  Shield,
  AlertTriangle,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = '请输入管理员邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '邮箱格式不正确';
    }
    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少 6 位';
    }
    if (!adminKey.trim()) {
      newErrors.adminKey = '请输入管理员密钥';
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
    setTimeout(() => {
      const token = 'mock_admin_jwt_' + Date.now();
      localStorage.setItem('ainexus_auth_token', token);
      localStorage.setItem('ainexus_user', JSON.stringify({
        id: 'admin_1',
        email,
        name: '系统管理员',
        role: 'superadmin',
        avatar: 'A',
      }));
      setIsLoading(false);
      navigate('/admin/overview');
    }, 1200);
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-center relative overflow-hidden"
        style={{ background: 'var(--dark-bg)' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/hero-bg-mesh.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(51,102,255,0.12) 0%, var(--dark-bg) 60%)' }}
        />

        <div className="relative z-10 px-16 max-w-[480px]">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-12 rounded-xl bg-[#3366FF]/15 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#3366FF]" />
            </div>
            <div>
              <h2 className="font-space text-h3 text-white font-semibold">管理后台</h2>
              <p className="text-caption text-[var(--slate-500)]">Super Admin Portal</p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-body text-[var(--slate-400)] max-w-[400px]"
          >
            仅限授权管理员访问。此处可管理客户、审核充值、配置模型、监控系统运行状态。
          </motion.p>

          {/* Admin features */}
          <div className="mt-12 space-y-4">
            {[
              { icon: '📊', text: '运营数据实时监控' },
              { icon: '👥', text: '客户与工作区管理' },
              { icon: '💰', text: '充值审核与积分台账' },
              { icon: '⚙️', text: '模型配置与价格规则' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-[#3366FF]/20 flex items-center justify-center flex-shrink-0 text-[11px]">
                  {item.icon}
                </div>
                <span className="text-body-sm text-[var(--slate-300)]">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-auto pt-16"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-body-sm text-[var(--slate-400)] hover:text-[#3366FF] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              返回普通用户登录
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[55%] min-h-[100dvh] bg-[var(--dark-card)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: shake ? 0.8 : 1, x: shake ? [-8, 8, -4, 4, 0] : 0 }}
          transition={{
            opacity: { duration: 0.6, delay: 0.2 },
            x: shake ? { duration: 0.3 } : { duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
          }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/home" className="inline-flex items-center gap-2">
              <span className="font-space text-2xl font-bold text-[#3366FF]">AI Nexus</span>
            </Link>
            <p className="mt-2 text-caption text-[var(--slate-500)]">管理后台</p>
          </div>

          {/* Alert banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-6 p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <p className="text-body-sm text-[#F59E0B]">
              此入口仅限平台超级管理员使用。普通用户请使用{' '}
              <Link to="/login" className="underline hover:text-white transition-colors">
                普通登录
              </Link>
              。
            </p>
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="font-space text-h2 text-white">管理员登录</h1>
            <p className="mt-2 text-body text-[var(--slate-400)]">验证身份以进入管理后台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label className="block text-body-sm font-medium text-[var(--slate-300)] mb-2">
                管理员邮箱
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
                  placeholder="admin@example.com"
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

            {/* Admin Key */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.56 }}
            >
              <label className="block text-body-sm font-medium text-[var(--slate-300)] mb-2">
                管理员密钥
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--slate-500)]" />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => {
                    setAdminKey(e.target.value);
                    if (errors.adminKey) setErrors((prev) => ({ ...prev, adminKey: '' }));
                  }}
                  placeholder="请输入管理员密钥"
                  className={`w-full h-10 pl-10 pr-3 rounded-lg bg-[var(--dark-bg)] border text-body-sm text-white placeholder-[var(--slate-500)] focus:outline-none focus:border-[#3366FF] focus:ring-1 focus:ring-[#3366FF] transition-all ${
                    errors.adminKey ? 'border-[#EF4444]' : 'border-[var(--dark-border)]'
                  }`}
                />
              </div>
              {errors.adminKey && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-caption text-[#EF4444]"
                >
                  {errors.adminKey}
                </motion.p>
              )}
              <p className="mt-1.5 text-caption text-[var(--slate-500)]">
                这是平台颁发的超级管理员访问密钥，请联系技术负责人获取。
              </p>
            </motion.div>

            {/* Submit */}
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
                    验证中...
                  </>
                ) : (
                  <>
                    进入管理后台
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <p className="mt-8 text-center text-body-sm text-[var(--slate-400)]">
            普通用户？{' '}
            <Link to="/login" className="text-[#3366FF] hover:underline font-medium">
              前往控制台登录
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
