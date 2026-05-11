'use client';

export function AITypingIndicator() {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-6 h-6 rounded-full bg-forensic-cyan/20 border border-forensic-border flex items-center justify-center flex-shrink-0">
        <span className="text-forensic-cyan text-xs font-bold">AI</span>
      </div>
      <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-forensic-cyan"
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
