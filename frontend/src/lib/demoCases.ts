/**
 * src/lib/demoCases.ts
 * 
 * High-fidelity unique case definitions for the Sentinel/9 Registry.
 */

export const DEMO_CASES: Record<string, any> = {
  'crimson-fox': {
    id: 'crimson-fox',
    title: 'Operation Crimson Fox',
    description: 'Cross-border human trafficking investigation linked to Project Chimera operating out of Kyiv. Primary suspect: Amara Petrov.',
    status: 'pending',
    priority: 'medium',
    risk_score: 42,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Trafficking', 'Project Chimera', 'Kyiv'],
    assigned_to: 'Agent Sterling',
    intelligence_hash: 'SHA-256: F8A2...9B1C',
    signal_bursts: '24 Bursts/h',
    neural_score: '91.2%',
    custody_verified: true,
    evidence: [
      { id: 'ev-1', name: 'Leaked Ledger.pdf', type: 'document', risk_score: 85, authenticity_score: 92, analysis: { summary: 'Financial records showing illegal transactions across 3 shell companies.' } },
      { id: 'ev-2', name: 'Border Surveillance.mp4', type: 'video', risk_score: 64, authenticity_score: 88, analysis: { summary: 'Primary suspect identified at Kyiv-Poland border crossing at 03:00.' } },
      { id: 'ev-3', name: 'Intercept-09.wav', type: 'audio', risk_score: 92, authenticity_score: 95, analysis: { summary: 'Voice print match confirmed for the Chimera hierarchy courier.' } }
    ],
    insights: [
      { id: 'in-1', title: 'Network Link Identified', severity: 'critical', description: 'Subject has 3 direct links to the Chimera hierarchy via encrypted comms.', source: 'AI Engine', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'in-2', title: 'Financial Anomaly', severity: 'medium', description: 'Sudden crypto transfer of 40 ETH detected to a known wash wallet.', source: 'Signals Intel', created_at: new Date(Date.now() - 7200000).toISOString() }
    ],
    timeline_events: [
      { id: 't-1', title: 'Case Opened', description: 'Initial intel from Kyiv field office regarding courier activity.', type: 'digital', timestamp: new Date(Date.now() - 86400000).toISOString(), confidence: 100 }
    ]
  },
  'phantom-hawk': {
    id: 'phantom-hawk',
    title: 'Operation Phantom Hawk',
    description: 'Cross-border cyber espionage investigation linked to Vantage Cartel operating out of Lagos. Primary suspect: Rafael Mendes.',
    status: 'active',
    priority: 'medium',
    risk_score: 58,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Espionage', 'Vantage Cartel', 'Lagos'],
    assigned_to: 'Agent Vance',
    intelligence_hash: 'SHA-256: C9E1...4A2B',
    signal_bursts: '156 Bursts/h',
    neural_score: '88.4%',
    custody_verified: true,
    evidence: [
      { id: 'ev-ph1', name: 'Encrypted Drive.iso', type: 'binary', risk_score: 95, authenticity_score: 98, analysis: { summary: 'Drive containing zero-day exploit payloads targeting government networks.' } },
      { id: 'ev-ph2', name: 'Server Logs.csv', type: 'document', risk_score: 30, authenticity_score: 100, analysis: { summary: 'Access logs from Lagos central exchange showing unauthorized SSH tunnels.' } }
    ],
    insights: [
      { id: 'in-ph1', title: 'Protocol Breach', severity: 'high', description: 'Unusual SSH tunnel detected targeting Gov-Net from a compromised relay.', source: 'Network Sentry', created_at: new Date(Date.now() - 1800000).toISOString() }
    ],
    timeline_events: [
      { id: 't-ph1', title: 'Intrusion Alert', description: 'Unauthorized access attempt detected in sector 4 of the neural exchange.', type: 'cyber', timestamp: new Date(Date.now() - 172800000).toISOString(), confidence: 92 }
    ]
  },
  'dark-eagle': {
    id: 'dark-eagle',
    title: 'Operation Dark Eagle',
    description: 'Cross-border financial fraud investigation linked to Iron Wolf Group operating out of Lagos. Primary suspect: Maria Müller.',
    status: 'active',
    priority: 'high',
    risk_score: 76,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Fraud', 'Iron Wolf', 'Financial'],
    assigned_to: 'Agent Miller',
    intelligence_hash: 'SHA-256: B2D4...9E1F',
    signal_bursts: '42 Bursts/h',
    neural_score: '96.1%',
    custody_verified: true,
    evidence: [
      { id: 'ev-de1', name: 'Swift Transaction Report', type: 'document', risk_score: 90, authenticity_score: 95, analysis: { summary: 'Layered transactions across 4 tax havens detected via neural sweep.' } },
      { id: 'ev-de2', name: 'Shell Ledger', type: 'document', risk_score: 75, authenticity_score: 89, analysis: { summary: 'Physical ledger recovered from a safehouse in Frankfurt.' } }
    ],
    insights: [
      { id: 'in-de1', title: 'Shell Company Link', severity: 'critical', description: 'Maria Müller linked to 12 dummy corporations using stolen biometric IDs.', source: 'Financial AI', created_at: new Date(Date.now() - 3600000).toISOString() }
    ],
    timeline_events: [
      { id: 't-de1', title: 'Bank Alert', description: 'Large SWIFT transfer flagged for review by the centralized fraud engine.', type: 'financial', timestamp: new Date(Date.now() - 259200000).toISOString(), confidence: 100 }
    ]
  },
  'neon-falcon': {
    id: 'neon-falcon',
    title: 'Operation Neon Falcon',
    description: 'Cross-border dark web node intercept linked to Dark Meridian operating out of Mumbai. Primary suspect: James K.',
    status: 'active',
    priority: 'medium',
    risk_score: 52,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Fraud', 'Dark Meridian', 'Mumbai'],
    assigned_to: 'Agent Kapoor',
    intelligence_hash: 'SHA-256: D7C9...2B5A',
    signal_bursts: '89 Bursts/h',
    neural_score: '92.5%',
    custody_verified: false,
    evidence: [
      { id: 'ev-nf1', name: 'Phone Recording.wav', type: 'audio', risk_score: 45, authenticity_score: 82, analysis: { summary: 'Discussion of coordinated market manipulation via encrypted VOIP.' } },
      { id: 'ev-nf2', name: 'PGP Keys.txt', type: 'binary', risk_score: 98, authenticity_score: 96, analysis: { summary: 'Encryption keys matching the Dark Meridian syndicate signature.' } }
    ],
    insights: [
      { id: 'in-nf1', title: 'Market Manipulation Detected', severity: 'high', description: 'Coordinated buying patterns linked to this case identified on global exchanges.', source: 'AI Analytics', created_at: new Date(Date.now() - 5400000).toISOString() }
    ],
    timeline_events: [
      { id: 't-nf1', title: 'Signal Intercept', description: 'Encrypted VOIP stream successfully captured and decrypted.', type: 'digital', timestamp: new Date(Date.now() - 345600000).toISOString(), confidence: 85 }
    ]
  },
  'shadow-dragon': {
    id: 'shadow-dragon',
    title: 'Operation Shadow Dragon',
    description: 'Cross-border financial fraud investigation linked to Shadow Nexus operating out of Caracas. Primary suspect: Omar Garcia.',
    status: 'active',
    priority: 'medium',
    risk_score: 61,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Fraud', 'Shadow Nexus', 'Caracas'],
    assigned_to: 'Agent Blanco',
    intelligence_hash: 'SHA-256: E5F8...2C9B',
    signal_bursts: '64 Bursts/h',
    neural_score: '89.7%',
    custody_verified: true,
    evidence: [
      { id: 'ev-sd1', name: 'Crypto Tumbler Logs', type: 'binary', risk_score: 92, authenticity_score: 94, analysis: { summary: 'Logs from a localized mixing service used to obfuscate 500 BTC.' } },
      { id: 'ev-sd2', name: 'Passport Scan', type: 'image', risk_score: 40, authenticity_score: 99, analysis: { summary: 'Authentic passport of Omar Garcia recovered at Caracas International.' } }
    ],
    insights: [
      { id: 'in-sd1', title: 'Tumbler Node Identified', severity: 'high', description: 'Major mixing node linked to the Shadow Nexus hierarchy identified.', source: 'Chain Intelligence', created_at: new Date(Date.now() - 10800000).toISOString() }
    ],
    timeline_events: [
      { id: 't-sd1', title: 'Passport Recovery', description: 'Subject identity confirmed via border control metadata.', type: 'physical', timestamp: new Date(Date.now() - 432000000).toISOString(), confidence: 100 }
    ]
  },
  'ghost-fox': {
    id: 'ghost-fox',
    title: 'Operation Ghost Fox',
    description: 'Cross-border money laundering investigation linked to Cobalt Syndicate operating out of New York. Primary suspect: Victor Rossi.',
    status: 'pending',
    priority: 'high',
    risk_score: 57,
    created_at: new Date(Date.now() - 518400000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Laundering', 'Cobalt Syndicate', 'New York'],
    assigned_to: 'Agent Rossi',
    intelligence_hash: 'SHA-256: F1A2...4B5C',
    signal_bursts: '32 Bursts/h',
    neural_score: '93.1%',
    custody_verified: true,
    evidence: [
      { id: 'ev-gf1', name: 'Wire Transfer Records', type: 'document', risk_score: 88, authenticity_score: 97, analysis: { summary: 'Records of 12 sequential wire transfers to offshore accounts.' } },
      { id: 'ev-gf2', name: 'Motel Receipt', type: 'image', risk_score: 15, authenticity_score: 100, analysis: { summary: 'Physical location of suspect Victor Rossi established.' } }
    ],
    insights: [
      { id: 'in-gf1', title: 'Laundering Pattern Confirmed', severity: 'critical', description: 'Layering phase of the Cobalt Syndicate operation identified via transaction mesh.', source: 'Neural Engine', created_at: new Date(Date.now() - 14400000).toISOString() }
    ],
    timeline_events: [
      { id: 't-gf1', title: 'Location Established', description: 'Suspect spotted at a New York safehouse via facial recognition.', type: 'physical', timestamp: new Date(Date.now() - 518400000).toISOString(), confidence: 98 }
    ]
  }
};
