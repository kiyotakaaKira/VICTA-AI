import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise Forensic palette
        'forensic-bg':             '#0A0F1C',
        'forensic-surface':        '#121826',
        'forensic-surface-2':      '#1A2235',
        'forensic-surface-3':      '#2A3548',
        'forensic-cyan':           '#14B8A6',
        'forensic-cyan-dark':      '#0F766E',
        'forensic-purple':         '#4F46E5',
        'forensic-purple-dark':    '#4338CA',
        'forensic-border':         'rgba(79, 70, 229, 0.12)',
        'forensic-border-hover':   'rgba(79, 70, 229, 0.3)',
        'forensic-border-active':  'rgba(79, 70, 229, 0.5)',
        'risk-critical':           '#EF4444',
        'risk-high':               '#F59E0B',
        'risk-medium':             '#EAB308',
        'risk-low':                '#10B981',

        // V0 mappings
        background: '#0A0F1C',
        foreground: '#F3F4F6',
        card: '#1A2235',
        'card-foreground': '#F3F4F6',
        popover: '#1A2235',
        'popover-foreground': '#F3F4F6',
        primary: '#4F46E5',
        'primary-foreground': '#F3F4F6',
        secondary: '#14B8A6',
        'secondary-foreground': '#F3F4F6',
        muted: '#1A2235',
        'muted-foreground': '#94A3B8',
        accent: '#14B8A6',
        'accent-foreground': '#F3F4F6',
        destructive: '#EF4444',
        'destructive-foreground': '#F3F4F6',
        warning: '#F59E0B',
        'warning-foreground': '#0A0F1C',
        border: '#2A3548',
        input: '#2A3548',
        ring: '#4F46E5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1)',
        'glow-purple': '0 0 30px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
        'glow-red':    '0 0 30px rgba(239,68,68,0.3)',
        'card':        '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover':  '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.05)',
      },
      backgroundImage: {
        'gradient-forensic': 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
        'gradient-danger':   'linear-gradient(135deg, #ef4444, #f97316)',
        'gradient-surface':  'linear-gradient(180deg, #0f1629, #020817)',
        'grid-cyan': `linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'float':         'float 5s ease-in-out infinite',
        'scan':          'scan-line 6s linear infinite',
        'counter':       'counter-up 0.5s ease-out forwards',
        'fade-in':       'fade-in 0.3s ease-out',
        'fade-in-up':    'fade-in-up 0.4s ease-out',
        'flicker':       'flicker 8s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'forensic': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};

export default config;
