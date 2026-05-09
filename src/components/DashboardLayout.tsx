import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import Sidebar, { consoleNav, adminNav } from './Sidebar';

function getUser() {
  try {
    const raw = localStorage.getItem('ainexus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface DashboardLayoutProps {
  type: 'console' | 'admin';
}

export default function DashboardLayout({ type }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useMemo(() => getUser(), []);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const userName = user?.name || 'User';
  const userAvatar = user?.avatar || userName.charAt(0).toUpperCase();

  const navItems = type === 'console' ? consoleNav : adminNav;

  const handleSwitchPortal = () => {
    if (type === 'console') {
      navigate('/admin/overview');
    } else {
      navigate('/console/overview');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainexus_auth_token');
    localStorage.removeItem('ainexus_user');
    navigate('/login');
  };

  // Build breadcrumb from current path
  const currentItem = navItems.find((item) => item.path === location.pathname);
  const breadcrumbItems = [
    { label: type === 'console' ? '控制台' : '管理后台', href: `/${type}/overview` },
    ...(currentItem ? [{ label: currentItem.label, href: currentItem.path }] : []),
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--dark-bg)] text-[var(--dark-text)]">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[var(--dark-bg)] border-b border-[var(--dark-border)]">
        <div className="h-full flex items-center px-4 gap-4">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/home" className="font-space text-xl font-bold text-[#3366FF] hidden lg:block">
            AI Nexus
          </Link>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center gap-2 text-sm text-[var(--slate-500)] ml-4">
            {breadcrumbItems.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                <Link
                  to={item.href}
                  className={`hover:text-white transition-colors ${
                    index === breadcrumbItems.length - 1 ? 'text-[var(--slate-300)]' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Search */}
            <div className="hidden md:flex items-center bg-[var(--dark-card)] rounded-lg px-3 py-1.5 border border-[var(--dark-border)] focus-within:border-[#3366FF] transition-colors">
              <Search className="w-4 h-4 text-[var(--slate-500)]" />
              <input
                type="text"
                placeholder="搜索..."
                className="bg-transparent border-none outline-none text-sm text-[var(--dark-text)] placeholder-[var(--slate-500)] ml-2 w-40"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F43F5E] rounded-full" />
            </button>

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--dark-hover)] transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  isAdmin
                    ? 'bg-gradient-to-br from-[#F59E0B] to-[#EF4444]'
                    : 'bg-gradient-to-br from-[#3366FF] to-[#A855F7]'
                }`}>
                  {userAvatar}
                </div>
                <div className="hidden lg:flex items-center gap-1.5">
                  <span className="text-sm text-[var(--slate-300)]">{userName}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F59E0B]/20 text-[#F59E0B]">
                      超管
                    </span>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[var(--dark-card)] rounded-xl border border-[var(--dark-border)] shadow-xl z-20 py-1"
                    >
                      <div className="px-4 py-2 border-b border-[var(--dark-border)]">
                        <p className="text-sm text-white font-medium truncate">{userName}</p>
                        <p className="text-xs text-[var(--slate-500)] truncate">{user?.email || ''}</p>
                      </div>

                      {/* Portal switcher */}
                      {isAdmin && (
                        <button
                          onClick={handleSwitchPortal}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] hover:text-white transition-colors"
                        >
                          {type === 'console' ? (
                            <>
                              <Shield className="w-4 h-4 text-[#F59E0B]" />
                              <span>进入管理后台</span>
                            </>
                          ) : (
                            <>
                              <LayoutDashboard className="w-4 h-4 text-[#3366FF]" />
                              <span>返回用户控制台</span>
                            </>
                          )}
                        </button>
                      )}

                      <Link
                        to={type === 'console' ? '/console/security' : '/admin/system-settings'}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--slate-300)] hover:bg-[var(--dark-hover)] hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        设置
                      </Link>

                      <div className="border-t border-[var(--dark-border)] my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          navItems={navItems}
          type={type}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="fixed left-0 top-16 bottom-0 w-64 bg-[var(--dark-sidebar)] border-r border-[var(--dark-border)] z-40 lg:hidden overflow-y-auto"
            >
              <nav className="py-4 px-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-[var(--dark-sidebar-active)] text-[#3366FF]'
                          : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
                        }
                      `}
                      style={isActive ? { borderLeft: '3px solid #3366FF' } : { borderLeft: '3px solid transparent' }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className="pt-16 min-h-[100dvh] transition-all duration-300"
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
            ? (isSidebarCollapsed ? '64px' : '256px')
            : '0',
        }}
      >
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  );
}
