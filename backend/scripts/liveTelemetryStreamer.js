'use strict';

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TELEMETRY_KINDS = [
  'anomaly',
  'geo_breach',
  'evidence_upload',
  'toxicology_hit',
  'deepfake_detection',
  'SIGINT_spike',
  'behavioral_drift',
  'AI_prediction',
  'forensic_verification',
];

const INTEL_EVENTS = [
  { type: 'alert', title: 'Pattern Anomaly', message: 'Cluster divergence exceeds adaptive envelope.', level: 'critical' },
  { type: 'warning', title: 'Threat Detection', message: 'Watchlist correlation spike across jurisdictions.', level: 'high' },
  { type: 'info', title: 'Scan Update', message: 'Forensic queue draining normally.', level: 'low' },
];

function randomTelemetry() {
  const signals = Math.floor(Math.random() * 35) + 58;
  const anomalies = Math.floor(Math.random() * 18) + 4;
  return { signals, anomalies, baseline: 50, sector: `SEC-${Math.floor(Math.random() * 9) + 1}` };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loop() {
  console.log('--- LIVE TELEMETRY STREAMER (DB writer) ---');

  let caseIds = [];
  const { data: cases } = await supabase.from('cases').select('id').limit(500);
  if (cases?.length) caseIds = cases.map((c) => c.id);

  for (;;) {
    const delay = 1000 + Math.floor(Math.random() * 2000);
    await sleep(delay);

    try {
      const { signals, anomalies, baseline, sector } = randomTelemetry();
      await supabase.from('telemetry_snapshots').insert({ signals, anomalies, baseline, sector });

      const kind = TELEMETRY_KINDS[Math.floor(Math.random() * TELEMETRY_KINDS.length)];
      const caseId = caseIds.length && Math.random() > 0.2 ? caseIds[Math.floor(Math.random() * caseIds.length)] : null;

      const ts = new Date().toISOString();
      const asc = anomalies + Math.random() * 3;
      await supabase.from('telemetry_events').insert({
        case_id: caseId,
        event_type: kind,
        signal_type: kind,
        severity: anomalies > 14 ? 'high' : anomalies > 9 ? 'medium' : 'low',
        source: 'stream-cli',
        anomaly_score: Math.round(asc * 10) / 10,
        ai_confidence: Math.round((0.6 + Math.random() * 0.39) * 1000) / 1000,
        payload_json: { signals, anomalies, baseline, sector },
        metadata: { stream: 'cli', sector },
        timestamp: ts,
        event_time: ts,
      });
      process.stdout.write('.');
    } catch (e) {
      console.error('\nstream error:', e.message);
    }

    if (Math.random() > 0.65) {
      try {
        const ev = INTEL_EVENTS[Math.floor(Math.random() * INTEL_EVENTS.length)];
        await supabase.from('intelligence_events').insert({
          event_type: 'LIVE_INTEL',
          title: ev.title,
          message: ev.message,
          severity: ev.level,
          payload: { type: ev.type },
          source: 'stream-cli',
        });
      } catch (e) {
        console.error('intel insert:', e.message);
      }
    }
  }
}

loop().catch(console.error);
