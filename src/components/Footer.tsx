import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, Github, Twitter, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCmsConfigReadonly } from '@/hooks/useCmsConfig';

const productLinks = [
  { label: '功能特性', href: '/home#features' },
  { label: '价格方案', href: '/pricing' },
  { label: 'API 文档', href: '/docs' },
  { label: '模型目录', href: '/home#models' },
];

const resourceLinks = [
  { label: '快速入门', href: '/docs' },
  { label: 'SDK 下载', href: '/docs#sdk' },
  { label: '状态页面', href: '#' },
  { label: '更新日志', href: '#' },
];

function useContactLinks() {
  const cms = useCmsConfigReadonly();
  return [
    { label: cms.site.contactEmail, href: `mailto:${cms.site.contactEmail}` },
    { label: '技术支持', href: '#' },
    { label: '商务合作', href: '#' },
  ];
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between md:cursor-default md:pointer-events-none py-3 md:py-0"
      >
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h4>
        <ChevronDown className="w-4 h-4 text-[var(--slate-500)] md:hidden transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      <motion.ul
        initial={false}
        className="space-y-3 mt-4 overflow-hidden md:max-h-none"
      >
        <AnimatePresence initial={false}>
          {(isOpen || true) && links.map((link) => (
            <li key={link.label} className="hidden md:block">
              <Link
                to={link.href}
                className="text-sm text-[var(--slate-400)] hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </AnimatePresence>
        {/* Mobile accordion items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              {links.map((link) => (
                <li key={link.label} className="py-2">
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--slate-400)] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

export default function Footer() {
  const cms = useCmsConfigReadonly();
  const contactLinks = useContactLinks();
  return (
    <footer className="bg-[var(--slate-900)]">
      <div className="max-w-container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div>
            <Link to="/home" className="font-space text-2xl font-bold text-[#3366FF]">
              {cms.site.name}
            </Link>
            <p className="mt-4 text-sm text-[var(--slate-400)] leading-relaxed">
              {cms.site.tagline}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-[var(--slate-500)] hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-[var(--slate-500)] hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[var(--slate-500)] hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <FooterColumn title="产品" links={productLinks} />

          {/* Resource Links */}
          <FooterColumn title="资源" links={resourceLinks} />

          {/* Contact Links */}
          <FooterColumn title="联系我们" links={contactLinks} />
        </div>

        {/* Copyright Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--slate-800)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--slate-500)]">
            {cms.site.footerText}
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-sm text-[var(--slate-500)] hover:text-[var(--slate-300)] transition-colors">
              隐私政策
            </Link>
            <Link to="#" className="text-sm text-[var(--slate-500)] hover:text-[var(--slate-300)] transition-colors">
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
