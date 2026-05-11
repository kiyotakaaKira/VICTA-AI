import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Case } from '@/types/case';

interface CaseStore {
  activeCase: Case | null;
  selectedTab: string;
  setActiveCase: (c: Case | null) => void;
  setSelectedTab: (tab: string) => void;
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set) => ({
      activeCase: null,
      selectedTab: 'overview',
      setActiveCase: (c) => set({ activeCase: c }),
      setSelectedTab: (tab) => set({ selectedTab: tab }),
    }),
    {
      name: 'forensic-case-store',
      partialize: (state) => ({ selectedTab: state.selectedTab }),
      skipHydration: true,
    }
  )
);
