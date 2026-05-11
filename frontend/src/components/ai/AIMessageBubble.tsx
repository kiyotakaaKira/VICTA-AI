'use client';

import { cn } from '@/lib/utils';

interface AIMessageBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

export function AIMessageBubble({ message }: AIMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2', isUser && 'flex-row-reverse')}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-forensic-cyan/20 border border-forensic-border flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-forensic-cyan text-xs font-bold">AI</span>
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-forensic-cyan/15 text-slate-200 border border-forensic-cyan/20'
            : 'bg-white/5 text-slate-300 border border-white/5'
        )}
      >
        {/* Simple markdown-like rendering */}
        {message.content.split('\n\n').map((para, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {para.split('**').map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
