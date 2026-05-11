'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useAIStore } from '@/store/useAIStore';

export function AIAssistantButton() {
  const { isOpen, toggle } = useAIStore();

  return (
    <motion.button
      id="ai-assistant-fab"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-2xl bg-forensic-cyan flex items-center justify-center shadow-glow-cyan text-forensic-bg"
      aria-label="Open AI Assistant"
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Bot size={22} />
      </motion.div>
    </motion.button>
  );
}
