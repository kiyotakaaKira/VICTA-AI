'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Package, GitBranch,
  Network, BarChart3, Settings, ChevronLeft,
  ChevronRight, Shield, FlaskConical,
  Activity, Radio, Scan, Brain, TrendingUp,
} from 'lucide-react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';
import { PulseDot } from '@/components/ui/PulseDot';

const NAV_SECTIONS = [
  {
    label: 'INVESTIGATION',
    items: [
      { href: '/dashboard',    label: 'Command Center',     Icon: LayoutDashboard, alert: true },
      { href: '/cases',        label: 'Active Cases',       Icon: Briefcase, badge: '5' },
      { href: '/evidence',     label: 'Evidence Analysis',  Icon: Package },
      { href: '/timeline',     label: 'Timeline Intel',     Icon: GitBranch },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { href: '/graph',        label: 'Knowledge Graph',    Icon: Network },
      { href: '/intelligence', label: 'AI Intel Feed',      Icon: Radio, alert: true },
      { href: '/analytics',   label: 'Threat Analytics',   Icon: BarChart3 },
    ],
  },
  {
    label: 'FORENSICS',
    items: [
      { href: '/toxicology',   label: 'Toxicology Engine',  Icon: FlaskConical },
      { href: '/deepfake',     label: 'Deepfake Detection', Icon: Scan },
      { href: '/behavioral',   label: 'Behavioral Patterns',Icon: Brain },
    ],
  },
  {
    label: 'AI SYSTEMS',
    items: [
      { href: '/predictive',   label: 'Predictive Engine',  Icon: TrendingUp },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/settings',     label: 'Settings',           Icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 h-full z-50 overflow-hidden flex flex-col"
      style={{
        background: 'rgba(9, 14, 28, 0.96)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(6,182,212,0.08)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[60px] flex-shrink-0" style={{ borderBottom: '1px solid rgba(6,182,212,0.06)' }}>
        <div className="w-8 h-8 rounded-xl bg-forensic-cyan/15 border border-forensic-cyan/25 flex items-center justify-center flex-shrink-0 relative">
          <Shield size={16} className="text-forensic-cyan" />
          <PulseDot color="#06b6d4" size={6} className="absolute -top-0.5 -right-0.5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-black text-white text-sm tracking-wide whitespace-nowrap">VICTA AI</p>
              <p className="text-forensic-cyan/50 text-xs font-mono whitespace-nowrap">INTEL·OPS·v2.4</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} className="mb-1">
            {/* Section label */}
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-1.5 text-xs font-bold tracking-widest text-slate-700"
                  style={{ fontSize: 9 }}
                >
                  {label}
                </motion.p>
              )}
            </AnimatePresence>

            {items.map(({ href, label: itemLabel, Icon, alert: hasAlert, badge }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 mx-2 my-0.5 px-2.5 py-2 rounded-lg transition-all duration-150 group relative',
                    isActive
                      ? 'bg-forensic-cyan/10 text-forensic-cyan'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/4'
                  )}
                  style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(6,182,212,0.15)' } : {}}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-forensic-cyan"
                      style={{ boxShadow: '0 0 8px rgba(6,182,212,0.8)' }}
                    />
                  )}

                  <Icon size={17} className={cn('flex-shrink-0', isActive ? 'text-forensic-cyan' : 'text-slate-600 group-hover:text-slate-300')} />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2 flex-1 min-w-0"
                      >
                        <span className="text-sm font-medium whitespace-nowrap">{itemLabel}</span>
                        {badge && (
                          <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-forensic-cyan/15 text-forensic-cyan border border-forensic-cyan/20">
                            {badge}
                          </span>
                        )}
                        {hasAlert && (
                          <PulseDot color="#ef4444" size={6} className="ml-auto" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom — System status */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-xl"
            style={{
              background: 'rgba(6,182,212,0.05)',
              border: '1px solid rgba(6,182,212,0.1)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Activity size={11} className="text-forensic-cyan" />
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider" style={{ fontSize: 9 }}>
                System Status
              </span>
            </div>
            {[
              { label: 'Gemini AI', ok: true },
              { label: 'Supabase DB', ok: true },
              { label: 'WebSocket', ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between py-0.5">
                <span className="text-xs text-slate-600">{label}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs" style={{ color: ok ? '#4ade80' : '#f87171', fontSize: 10 }}>
                    {ok ? 'ONLINE' : 'ERROR'}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center w-full h-10 text-slate-600 hover:text-slate-300 hover:bg-white/4 transition-colors"
        style={{ borderTop: '1px solid rgba(6,182,212,0.06)' }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
    </motion.aside>
  );
}
