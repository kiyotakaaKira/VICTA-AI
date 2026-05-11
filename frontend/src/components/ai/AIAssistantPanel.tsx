'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Trash2, Cpu } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAIStore } from '@/store/useAIStore';

export function AIAssistantPanel() {
  const { isOpen, close, messages, addMessage, isTyping, setTyping, clearMessages } = useAIStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    
    setInput('');
    addMessage({ 
      id: Date.now().toString(),
      role: 'user', 
      response: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    setTyping(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      console.log('AI RESPONSE DATA:', data);
      
      addMessage({ 
        role: 'assistant', 
        response: data.response || 'No AI response generated.',
        metadata: { 
          confidence: data.confidence || 94,
          isFallback: !data.success 
        }
      });

    } catch (err: any) {
      console.error('AI CHAT ERROR:', err);
      addMessage({ 
        role: 'assistant', 
        response: 'AI connection failed: System overloaded.',
        metadata: { confidence: 72, isFallback: true }
      });
    } finally {
      setTyping(false);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="fixed bottom-24 right-6 z-[100] w-96"
        >
          <GlassCard className="flex flex-col h-[600px] shadow-2xl border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Bot size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white tracking-tight">VICTA AI</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">VICTA-Core-3B (Neural)</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={clearMessages} className="text-slate-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                <button onClick={close} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar scroll-smooth bg-[#05080A]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-6">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Cpu size={32} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">SENTINEL/AI Ready</p>
                    <p className="text-xs text-slate-500 leading-relaxed">Awaiting mission briefing. I can analyze evidence hashes, summarize metabolic telemetry, and project threat pathways.</p>
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.response}
                  </div>
                  <div className="mt-2 flex items-center gap-3 px-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.metadata?.confidence && (
                      <span className={`text-[9px] font-black uppercase tracking-widest ${msg.metadata.isFallback ? 'text-amber-500' : 'text-cyan-500'}`}>
                        {msg.metadata.isFallback ? 'SIMULATION' : `CONFIDENCE ${msg.metadata.confidence}%`}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    </div>
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">VICTA Core analyzing tactical vectors...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Submit briefing query..."
                disabled={isTyping}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


