import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useCmsConfigReadonly } from '@/hooks/useCmsConfig';

const navLinks = [
  { label: '首页', href: '/home' },
  { label: '价格', href: '/pricing' },
  { label: 'API文档', href: '/docs' },
];

const rightLinks = [
  { label: '开发者', href: '/portal/login' },
  { label: '登录', href: '/login' },
  { label: '注册', href: '/register', primary: true },
];

export default function Navbar() {
  const cms = useCmsConfigReadonly();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      if (currentScrollY > 100) {
        setIsHidden(currentScrollY > lastScrollY && currentScrollY > 100);
      } else {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isHidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{
          backgroundColor: isScrolled ? 'rgba(11, 17, 32, 0.8)' : 'rgba(11, 17, 32, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isScrolled ? '1px solid var(--dark-border)' : '1px solid transparent',
        }}
      >
        <div className="max-w-container mx-auto h-full flex items-center justify-between px-6">
          {/* Logo */}
          <Link to="/home" className="font-space text-2xl font-bold text-[#3366FF] tracking-tight">
            {cms.site.name}
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-[var(--slate-400)] hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3366FF] transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {rightLinks.map((link) =>
              link.primary ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#3366FF] rounded-full hover:bg-[#2244CC] transition-all duration-200 hover:shadow-glow active:scale-[0.97]"
                >
                  免费开始
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-[var(--slate-300)] hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              )
            )}
            <Link
              to="/admin-login"
              className="text-sm font-medium text-[#F59E0B] hover:text-[#FBBF24] transition-colors duration-200 ml-2 border-l border-[var(--dark-border)] pl-4"
            >
              管理后台
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[var(--slate-300)] hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--dark-bg)] md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className="text-2xl font-semibold text-white hover:text-[#3366FF] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="w-16 h-px bg-[var(--dark-border)]" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link
                  to="/login"
                  className="text-xl text-[var(--slate-300)] hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  登录
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: (navLinks.length + 1) * 0.1 }}
              >
                <Link
                  to="/admin-login"
                  className="text-xl text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  管理后台
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
