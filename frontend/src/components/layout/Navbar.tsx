'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Zap, ChevronDown, Terminal, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PulseDot } from '@/components/ui/PulseDot';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeAgo } from '@/lib/utils';
import { SeverityIcon } from '@/components/ui/SeverityIcon';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useIntelligenceFeed } from '@/hooks/useIntelligenceFeed';
import { useWebSocket } from '@/hooks/useWebSocket';
import { demoEngine } from '@/lib/demoRealtimeEngine';
import type { Severity } from '@/lib/constants';

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { collapsed } = useSidebarStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { isDemoMode, isConnected } = useWebSocket();
  const { data: alerts = [] } = useIntelligenceFeed(12);
  const [uptime, setUptime] = useState('00:00:00');

  useEffect(() => {
    const int = setInterval(() => {
      setUptime(demoEngine.getUptime());
    }, 1000);
    return () => clearInterval(int);
  }, []);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <header
      className="fixed top-0 right-0 h-[60px] flex items-center px-5 gap-4 z-40 transition-all duration-300"
      style={{
        left: collapsed ? 64 : 240,
        background: 'rgba(2,8,23,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(6,182,212,0.07)',
      }}
    >
      {/* Breadcrumb / system info */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-700 flex-shrink-0">
        <Terminal size={12} className={isDemoMode ? 'text-amber-400' : 'text-forensic-cyan/50'} />
        <span className={`font-mono ${isDemoMode ? 'text-amber-400/60' : 'text-forensic-cyan/40'}`}>
          {isDemoMode ? 'SIMULATION·MODE' : 'VICTA·AI'}
        </span>
        <span>/</span>
        <span className="text-slate-500">Active Session</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative group">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-forensic-cyan transition-colors" />
        <input
          id="global-search"
          type="text"
          placeholder="Search cases, suspects, evidence..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full forensic-input pl-9 pr-4"
          style={{ paddingTop: 6, paddingBottom: 6, fontSize: 13 }}
        />
        {searchValue && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
            ↵
          </kbd>
        )}
      </div>

      <div className="flex-1" />

      {/* Operational Status */}
      <div className="hidden xl:flex items-center gap-6 mr-6 border-r border-white/10 pr-6">
        <div className="flex items-center gap-2">
          <motion.div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary' : 'bg-warning'}`} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">AI Core</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 rounded-full bg-secondary" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Telemetry</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 rounded-full bg-secondary" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Signal Bus</span>
        </div>
      </div>

      {/* System time / Uptime */}
      <div className="hidden lg:block text-right flex-shrink-0 min-w-[80px]">
        <p className="text-xs font-mono text-forensic-cyan/50" style={{ fontSize: 10 }}>
          UPTIME: {uptime}
        </p>
        <p className="text-xs text-slate-700" style={{ fontSize: 10 }}>SESSION_STABLE</p>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          id="notifications-button"
          onClick={() => setShowNotifications((v) => !v)}
          className="relative w-9 h-9 rounded-xl bg-white/4 border border-forensic-border flex items-center justify-center text-slate-400 hover:text-white hover:border-forensic-border-hover transition-all"
          aria-label="Notifications"
        >
          <Bell size={15} />
          {criticalCount > 0 && (
            <PulseDot color="#ef4444" size={7} className="absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 w-80 rounded-xl overflow-hidden z-50"
              style={{
                background: '#0f1629',
                border: '1px solid rgba(6,182,212,0.15)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-forensic-border">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Alerts</p>
                <span className="badge badge-critical">{criticalCount} critical</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex gap-2.5 p-3 hover:bg-white/3 transition-colors border-b border-white/4"
                  >
                    <SeverityIcon severity={alert.severity as Severity} size={13} className="mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-200 font-medium leading-snug">{alert.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{formatTimeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <button className="text-xs text-forensic-cyan hover:text-forensic-cyan-dark">
                  View all alerts →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User */}
      <div className="relative">
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2.5 p-1 px-2 rounded-xl hover:bg-white/5 transition-all group"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              className="w-8 h-8 rounded-xl border border-forensic-border object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-forensic-cyan/15 border border-forensic-cyan/25 flex items-center justify-center text-forensic-cyan font-bold text-sm">
              {user?.firstName?.[0] || 'A'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none group-hover:text-white transition-colors">
              {user?.fullName || 'Analyst'}
            </p>
            <p className="text-xs text-forensic-cyan/50 mt-0.5" style={{ fontSize: 10 }}>VICTA OPERATOR</p>
          </div>
          <ChevronDown size={14} className={`text-slate-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* User Dropdown */}
        <AnimatePresence>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50 bg-[#0f1629] border border-white/10 shadow-2xl"
              >
                <div className="p-4 border-b border-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Clearance Level</p>
                  <p className="text-sm text-secondary font-bold font-mono">L4 · RESTRICTED</p>
                </div>
                
                <div className="p-2">
                  <button 
                    onClick={() => { router.push('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Settings size={14} />
                    System Settings
                  </button>
                  <button 
                    onClick={() => { router.push('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <UserIcon size={14} />
                    Operator Profile
                  </button>
                  
                  <div className="h-px bg-white/5 my-2" />
                  
                  <button 
                    onClick={() => signOut(() => router.push('/sign-in'))}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
