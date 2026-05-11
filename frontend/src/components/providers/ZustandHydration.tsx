'use client';

import { useEffect } from 'react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useCaseStore } from '@/store/useCaseStore';

/** Rehydrate persisted Zustand stores after mount (required when skipHydration: true). */
export function ZustandHydration() {
  useEffect(() => {
    void useSidebarStore.persist.rehydrate();
    void useCaseStore.persist.rehydrate();
  }, []);
  return null;
}
