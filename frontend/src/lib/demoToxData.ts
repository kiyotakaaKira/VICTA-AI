/**
 * src/lib/demoToxData.ts
 * 
 * High-fidelity synthetic toxicology data for pharmacokinetic modeling.
 */

export const TOX_CHART_DATA = Array.from({ length: 30 }).map((_, i) => ({
  time: i,
  c1: 40 + Math.sin(i / 3) * 15 + Math.random() * 5,
  c2: 30 + Math.cos(i / 4) * 20 + Math.random() * 5,
  c3: 45 + Math.sin(i / 5) * 10 + Math.random() * 3,
}));

export const DETECTED_COMPOUNDS = [
  { name: 'Ethylene Glycol', value: 78, color: '#EF4444' },
  { name: 'Methanol', value: 42, color: '#F59E0B' },
  { name: 'Diazepam', value: 28, color: '#6366F1' },
  { name: 'Caffeine', value: 14, color: '#10B981' },
  { name: 'Acetaminophen', value: 8, color: '#14B8A6' },
];
