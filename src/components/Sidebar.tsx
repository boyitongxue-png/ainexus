import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  Brain,
  Route,
  ScrollText,
  Clock,
  Coins,
  CreditCard,
  Users,
  Webhook,
  Lock,
  BarChart3,
  ClipboardCheck,
  BookOpen,
  Settings,
  Tag,
  Activity,
  Image,
  FileText,
  Cog,
  Palette,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ShieldAlert,
  LogOut,
  Building2,
  type LucideIcon,
} from 'lucide-react';

function getUserRole() {
  try {
    const raw = localStorage.getItem('ainexus_user');
    return raw ? JSON.parse(raw).role : null;
  } catch {
    return null;
  }
}

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  subItems?: { label: string; path: string }[];
}

export const consoleNav: NavItem[] = [
  { icon: LayoutDashboard, label: '总览', path: '/console/overview' },
  { icon: Brain, label: '模型目录', path: '/console/models' },
  { icon: Shield, label: '平台API Key', path: '/console/platform-keys' },
  { icon: Route, label: '路由策略', path: '/console/routing' },
  { icon: ScrollText, label: '调用日志', path: '/console/logs' },
  { icon: Clock, label: '异步任务', path: '/console/tasks' },
  { icon: Coins, label: '积分中心', path: '/console/credits' },
  { icon: CreditCard, label: '充值申请', path: '/console/recharge' },
  { icon: Users, label: '团队成员', path: '/console/team' },
  { icon: Webhook, label: 'Webhook', path: '/console/webhooks' },
  { icon: Lock, label: '安全设置', path: '/console/security' },
  { icon: Key, label: '上游密钥', path: '/console/upstream-keys' },
];

export const adminNav: NavItem[] = [
  { icon: BarChart3, label: '运营总览', path: '/admin/overview' },
  { icon: Users, label: '客户管理', path: '/admin/customers' },
  { icon: ClipboardCheck, label: '充值审核', path: '/admin/recharge-review' },
  { icon: BookOpen, label: '积分台账', path: '/admin/credit-ledger' },
  { icon: Settings, label: '模型配置', path: '/admin/model-config' },
  { icon: Building2, label: '供应商管理', path: '/admin/providers' },
  { icon: Tag, label: '价格规则', path: '/admin/pricing-rules' },
  { icon: Activity, label: '请求监控', path: '/admin/request-monitor' },
  { icon: Image, label: '任务监控', path: '/admin/task-monitor' },
  { icon: FileText, label: '管理员日志', path: '/admin/admin-logs' },
  // Keep billing discoverable as a first-level admin module.
  { icon: CreditCard, label: '计费与支付', path: '/admin/billing' },
  { icon: Cog, label: '系统设置', path: '/admin/system-settings' },
  { icon: Palette, label: '内容管理', path: '/admin/cms' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  navItems: NavItem[];
  type: 'console' | 'admin';
}

function NavItemComponent({
  item,
  isCollapsed,
  isActive,
}: {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const Icon = item.icon;

  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div>
      <Link
        to={item.path}
        onClick={(e) => {
          if (hasSubItems) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 relative group
          ${isActive
            ? 'bg-[var(--dark-sidebar-active)] text-[#3366FF]'
            : 'text-[var(--slate-400)] hover:text-white hover:bg-[var(--dark-hover)]'
          }
        `}
        style={isActive ? { borderLeft: '3px solid #3366FF' } : { borderLeft: '3px solid transparent' }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {hasSubItems && (
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            )}
          </>
        )}
      </Link>

      {/* Sub items */}
      {hasSubItems && !isCollapsed && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden ml-4"
            >
              {item.subItems?.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === sub.path
                      ? 'text-[#3366FF] bg-[var(--dark-sidebar-active)]'
                      : 'text-[var(--slate-500)] hover:text-[var(--slate-300)] hover:bg-[var(--dark-hover)]'
                  }`}
                >
                  {sub.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default function Sidebar({ isCollapsed, onToggleCollapse, navItems, type }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0 z-30 bg-[var(--dark-sidebar)] border-r border-[var(--dark-border)]
        transition-all duration-300 flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo area for sidebar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--dark-border)]">
        {!isCollapsed && (
          <Link to={`/${type}/overview`} className="font-space text-lg font-bold text-[#3366FF]">
            {type === 'console' ? '控制台' : '管理后台'}
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[var(--slate-500)] hover:text-white hover:bg-[var(--dark-hover)] transition-colors ml-auto"
          aria-label={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavItemComponent
            key={item.path}
            item={item}
            isCollapsed={isCollapsed}
            isActive={location.pathname === item.path}
          />
        ))}
      </nav>

      {/* Admin / Console switch: only show "enter admin" from console */}
      {(getUserRole() === 'admin' || getUserRole() === 'superadmin') && type === 'console' && (
        <div className="p-2 border-t border-[var(--dark-border)]">
          <Link
            to="/admin/overview"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-[#F59E0B] hover:bg-[var(--dark-hover)] hover:text-[#FBBF24]"
          >
            <ShieldAlert className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">进入管理后台</span>
            )}
          </Link>
        </div>
      )}

      {/* Bottom help & logout */}
      <div className="p-2 border-t border-[var(--dark-border)] space-y-1">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem('ainexus_auth_token');
            localStorage.removeItem('ainexus_user');
            window.location.href = '/#/login';
          }}
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--slate-500)]
            hover:text-[#F43F5E] hover:bg-[var(--dark-hover)] transition-colors
          `}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">退出登录</span>}
        </a>
        <Link
          to="#"
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--slate-500)]
            hover:text-white hover:bg-[var(--dark-hover)] transition-colors
          `}
        >
          <HelpCircle className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">帮助中心</span>}
        </Link>
      </div>
    </aside>
  );
}