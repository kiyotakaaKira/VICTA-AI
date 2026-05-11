import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-forensic-bg flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-glow-cyan opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-forensic-purple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Branding */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-forensic-cyan/20 border border-forensic-border flex items-center justify-center">
          <span className="text-forensic-cyan font-bold text-sm">V</span>
        </div>
        <span className="text-white font-semibold tracking-wide">VICTA AI</span>
      </div>

      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'shadow-none',
              card: 'bg-forensic-surface border border-forensic-border shadow-card',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-400',
              formFieldLabel: 'text-slate-300',
              formFieldInput:
                'bg-forensic-bg border-forensic-border text-white placeholder:text-slate-600 focus:border-forensic-cyan',
              formButtonPrimary:
                'bg-forensic-cyan hover:bg-forensic-cyan-dark text-forensic-bg font-semibold',
              footerActionLink: 'text-forensic-cyan hover:text-forensic-cyan-dark',
              identityPreviewText: 'text-slate-300',
              identityPreviewEditButton: 'text-forensic-cyan',
            },
          }}
        />
      </div>
    </div>
  );
}
