import { create } from 'zustand';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  response: string; // Changed from content to response as per USER request
  timestamp: string;
  metadata?: {
    confidence?: number;
    isFallback?: boolean;
    tokens?: number;
    latency?: number;
  };
}

interface AIStore {
  isOpen: boolean;
  messages: AIMessage[];
  isTyping: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (msg: any) => void;
  setTyping: (v: boolean) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  isOpen: false,
  messages: [],
  isTyping: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          timestamp: msg.timestamp || new Date().toISOString(),
          response: msg.response || msg.content || '', // Handle migration
        },
      ],
    })),

  setTyping: (v) => set({ isTyping: v }),

  clearMessages: () => set({ messages: [] }),
}));
