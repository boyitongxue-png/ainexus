import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ScrollText,
  BarChart3,
  Brain,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Key,
} from 'lucide-react';

interface PortalNavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const portalNav: PortalNavItem[] = [
  { icon: LayoutDashboard, label: '总览', path: '/portal/overview' },
  { icon: ScrollText, label: '调用记录', path: '/portal/logs' },
  { icon: BarChart3, label: '消耗统计', path: '/portal/stats' },
  { icon: Brain, label: '模型定价', path: '/portal/models' },
];

function getPortalKey() {
  try {
    return localStorage.getItem('ainexus_portal_key') || '';
  } catch {
    return '';
  }
}

export default function PortalLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const portalKey = useMemo(() => getPortalKey(), []);
  const keyPrefix = portalKey ? `${portalKey.slice(0, 8)}...${portalKey.slice(-4)}` : '未登录';

  const handleLogout = () => {
    localStorage.removeItem('ainexus_portal_key');
    navigate('/portal/login');
  };

  return (
    <div className="min-h-[100dvh] flex bg-[var(--dark-bg)]">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[60] flex flex-col bg-[var(--dark-card)] border-r border-[var(--dark-border)] transition-all duration-300 ${
          isCollapsed ? 'w-0 lg:w-16' : 'w-64'
        }`}
        style={{ overflow: isCollapsed ? 'hidden' : 'visible' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--dark-border)] flex-shrink-0">
          <Link to="/portal/overview" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#3366FF] flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-space text-[15px] font-semibold text-white">开发者门户</span>
                <p className="text-[10px] text-[var(--slate-500)] -mt-0.5">Developer Portal</p>
              </div>
            )}
          </Link>
        </div>

        {/* Key info card */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 p-3 rounded-lg bg-[var(--dark-bg)] border border-[var(--dark-border)]">
            <p className="text-[10px] text-[var(--slate-500)] mb-1">当前 Key</p>
            <p className="text-[12px] font-jetbrains text-[#3366FF] truncate">{keyPrefix}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto mt-2">
          {portalNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-[#3366FF]/15 text-[#3366FF]'
                    : 'text-[var(--slate-400)] hover:bg-[var(--dark-hover)] hover:text-[var(--dark-text)]'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isActive && !isCollapsed && <div className="ml-auto w-1 h-1 rounded-full bg-[#3366FF]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-[var(--dark-border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--slate-500)] hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">退出</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--dark-border)] bg-[var(--dark-card)]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-[var(--slate-500)] hover:bg-[var(--dark-hover)] hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className="text-[13px] text-[var(--slate-500)]">开发者门户</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[var(--slate-500)] hidden sm:inline">
              Key: <span className="text-[#3366FF] font-jetbrains">{keyPrefix}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
