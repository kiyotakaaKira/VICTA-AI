/**
 * src/lib/demoPredictiveData.ts
 */

export const PATHWAY_STATS = [
  { label: 'ACTIVE RECOMMENDATIONS', value: '38', change: '+6', color: '#6366F1' },
  { label: 'PATHWAYS SUGGESTED', value: '12', change: '+2', color: '#F59E0B' },
  { label: 'MISSING EVIDENCE', value: '7 gaps', status: 'detected', color: '#EF4444' },
  { label: 'CROSS-CASE PIVOTS', value: '14', status: 'open', color: '#10B981' },
];

export const ENGINE_METRICS = [
  { label: 'Coverage', value: 91, color: '#6366F1' },
  { label: 'Recall', value: 84, color: '#10B981' },
  { label: 'Precision', value: 72, color: '#F59E0B' },
];

export const DETAILED_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    category: 'PATTERN · A-01',
    action: 'Check nearby CCTV between 8:00-8:20 PM',
    context: 'GeoNet · grid 4F',
    probability: 92,
    icon: 'camera',
    color: '#6366F1'
  },
  {
    id: 'rec-2',
    category: 'ANOMALY · E=0.07',
    action: 'Victim device activity missing after 9:12 PM',
    context: 'SIGINT · IMEI 8821',
    probability: 86,
    icon: 'wifi',
    color: '#F59E0B'
  },
  {
    id: 'rec-3',
    category: 'TOXICOLOGY ENGINE',
    action: 'Possible poison correlation detected (S-93 ↔ S-71)',
    context: 'Lab IV · cross-case',
    probability: 78,
    icon: 'layers',
    color: '#EF4444'
  },
  {
    id: 'rec-4',
    category: 'MOBILITY AI',
    action: 'Expand geofence to grid 5F - west corridor',
    context: 'Movement model · 0.81',
    probability: 81,
    icon: 'map',
    color: '#6366F1'
  },
  {
    id: 'rec-5',
    category: 'LINGUISTIC AI',
    action: 'Re-interview witness W-04 - linguistic drift detected',
    context: 'Behavioral · 0.72',
    probability: 72,
    icon: 'waves',
    color: '#F59E0B'
  },
  {
    id: 'rec-6',
    category: 'FINANCIAL AI',
    action: 'Subpoena banking records - 14 transactions > $9k',
    context: 'Financial pattern',
    probability: 68,
    icon: 'scan',
    color: '#10B981'
  }
];
