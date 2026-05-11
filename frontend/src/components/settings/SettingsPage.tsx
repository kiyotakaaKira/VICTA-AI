'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, Settings as SettingsIcon, LogOut, 
  Key, Bell, Eye, Volume2, Monitor, Cpu 
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface SettingSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
}

function SettingSwitch({ label, enabled, onChange }: SettingSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-400 font-medium">{label}</span>
      <button 
        onClick={() => onChange(!enabled)}
        className={`w-10 h-5 rounded-full transition-colors relative ${enabled ? 'bg-primary' : 'bg-slate-700'}`}
      >
        <motion.div 
          animate={{ x: enabled ? 22 : 2 }}
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [settings, setSettings] = useState({
    hardwareKey: true,
    biometric: true,
    autoLock: true,
    remoteWorkspace: false,
    auditLogging: true,
    highDensity: true,
    atmosphericEffects: true,
    livePulse: true,
    reducedMotion: false,
    tacticalSound: true,
  });

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
            <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">Operational Configuration & Security</p>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl transition-all text-sm font-bold"
        >
          <LogOut className="w-4 h-4" />
          SIGN OUT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Operator Identity</h3>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-[#0a0f1c]">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white">{user?.fullName || 'Operator'}</h2>
              <p className="text-xs text-primary font-mono mt-1">UID · 008-441-IX04</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 border-t border-white/5 pt-6">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Email</span>
              <span className="text-white font-mono">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Department</span>
              <span className="text-white">Forensic Cyber</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Region</span>
              <span className="text-white">EU · Sector 09</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Joined</span>
              <span className="text-white font-mono">2019-03-12</span>
            </div>
          </div>
        </motion.div>

        {/* Security Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-4 h-4 text-secondary" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access & Cryptography</h3>
          </div>

          <div className="space-y-2">
            <SettingSwitch 
              label="Hardware key (YubiKey)" 
              enabled={settings.hardwareKey} 
              onChange={(v) => setSettings({...settings, hardwareKey: v})} 
            />
            <SettingSwitch 
              label="Biometric unlock" 
              enabled={settings.biometric} 
              onChange={(v) => setSettings({...settings, biometric: v})} 
            />
            <SettingSwitch 
              label="Auto-lock on idle (5 min)" 
              enabled={settings.autoLock} 
              onChange={(v) => setSettings({...settings, autoLock: v})} 
            />
            <SettingSwitch 
              label="Allow remote workspace" 
              enabled={settings.remoteWorkspace} 
              onChange={(v) => setSettings({...settings, remoteWorkspace: v})} 
            />
            <SettingSwitch 
              label="Forensic audit logging" 
              enabled={settings.auditLogging} 
              onChange={(v) => setSettings({...settings, auditLogging: v})} 
            />
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security Posture</span>
              <span className="text-[10px] font-bold text-secondary">94%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                className="h-full bg-secondary"
              />
            </div>
          </div>
        </motion.div>

        {/* Preferences Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="w-4 h-4 text-warning" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Operational Defaults</h3>
          </div>

          <div className="space-y-2">
            <SettingSwitch 
              label="High-density widgets" 
              enabled={settings.highDensity} 
              onChange={(v) => setSettings({...settings, highDensity: v})} 
            />
            <SettingSwitch 
              label="Atmospheric effects" 
              enabled={settings.atmosphericEffects} 
              onChange={(v) => setSettings({...settings, atmosphericEffects: v})} 
            />
            <SettingSwitch 
              label="Live AI pulse" 
              enabled={settings.livePulse} 
              onChange={(v) => setSettings({...settings, livePulse: v})} 
            />
            <SettingSwitch 
              label="Reduced motion" 
              enabled={settings.reducedMotion} 
              onChange={(v) => setSettings({...settings, reducedMotion: v})} 
            />
            <SettingSwitch 
              label="Tactical sound feedback" 
              enabled={settings.tacticalSound} 
              onChange={(v) => setSettings({...settings, tacticalSound: v})} 
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 transition-all">
              <Key className="w-3 h-3" />
              ROTATE KEYS
            </button>
            <button 
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[10px] font-bold text-red-500 transition-all"
            >
              <LogOut className="w-3 h-3" />
              SIGN OUT
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
