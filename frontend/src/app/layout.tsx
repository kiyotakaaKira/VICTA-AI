import type { Metadata, Viewport } from 'next';

import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#020817',
};

export const metadata: Metadata = {
  title: {
    template: '%s · VICTA AI',
    default: 'VICTA AI — Intelligence Command Center',
  },
  description: 'AI-powered investigative intelligence platform for evidence analysis, case management, and threat detection.',
  keywords: ['VICTA', 'AI', 'forensic', 'investigation', 'intelligence', 'evidence analysis'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: '#020817',
          colorText: '#e2e8f0',
          colorPrimary: '#06b6d4',
          colorInputBackground: '#0f1629',
          colorInputText: '#e2e8f0',
          colorDanger: '#ef4444',
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '0.75rem',
        },
        elements: {
          card: {
            background: '#0f1629',
            border: '1px solid rgba(6,182,212,0.15)',
            boxShadow: '0 0 40px rgba(6,182,212,0.08)',
          },
          headerTitle: { color: '#ffffff' },
          socialButtonsBlockButton: {
            background: '#1a2540',
            border: '1px solid rgba(6,182,212,0.15)',
            color: '#e2e8f0',
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
