'use strict';

require('dotenv').config();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const FIRST_NAMES = ['James', 'Maria', 'Alexander', 'Yuki', 'Marcus', 'Sofia', 'Dimitri', 'Amara', 'Rafael', 'Elena', 'Victor', 'Nadia', 'Chloe', 'Liam', 'Santiago', 'Aisha', 'Oliver', 'Wei', 'Zara', 'Omar'];
const LAST_NAMES = ['Volkov', 'Chen', 'Mendez', 'Petrov', 'Santos', 'Nakamura', 'Kiriakis', 'Obi', 'Castillo', 'Ivanova', 'Romero', 'Lindqvist', 'Smith', 'Müller', 'Kim', 'Patel', 'Garcia', 'Singh', 'Rossi', 'Silva'];
const CITIES = [
  { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { name: 'Bogotá', lat: 4.711, lon: -74.0721 },
  { name: 'Kyiv', lat: 50.4501, lon: 30.5234 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
];
const ORGANIZATIONS = ['Syndicate Alpha', 'Shadow Nexus', 'Iron Wolf Group', 'Project Chimera', 'Dark Meridian', 'Oberon Network', 'Vantage Cartel', 'Cobalt Syndicate', 'Crimson Dawn', 'Blackwood Group'];
const EVIDENCE_TYPES = ['document', 'image', 'video', 'audio', 'financial_record', 'network_log', 'biometric', 'device_dump'];
const CASE_TYPES = ['cyber_espionage', 'financial_fraud', 'narcotics', 'human_trafficking', 'terrorism', 'money_laundering', 'arms_trafficking'];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES = ['active', 'pending', 'closed'];
const TELEMETRY_TYPES = [
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

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function sha256hex(seed) {
  return crypto.createHash('sha256').update(seed).digest('hex');
}
function randomTimestamp(daysBack = 365) {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysBack));
  d.setHours(rand(0, 23), rand(0, 59), rand(0, 59));
  return d.toISOString();
}

async function bulkInsert(table, data, chunkSize = 400) {
  let inserted = 0;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      console.error(`Error inserting to ${table}:`, error.message);
    } else {
      inserted += chunk.length;
      console.log(`Inserted ${inserted} / ${data.length} into ${table}`);
    }
  }
}

async function run() {
  console.log('--- OPERATIONAL SYNTHETIC DATA GENERATION ---');

  const suspectsByCase = [];

  console.log('Generating 200 cases...');
  const cases = Array.from({ length: 200 }).map((_, idx) => {
    const primary = randName();
    const associate = randName();
    suspectsByCase[idx] = { primary, associate };
    const city = pick(CITIES);
    const org = pick(ORGANIZATIONS);
    const ctype = pick(CASE_TYPES);
    const sev = pick(SEVERITIES);
    const agent = `AGT-${rand(100, 999)}`;
    return {
      title: `Operation ${pick(['Iron', 'Shadow', 'Ghost', 'Phantom', 'Steel'])} ${pick(['Falcon', 'Viper', 'Fox', 'Wolf', 'Hawk'])}`,
      description: `${ctype.replace(/_/g, ' ')} investigation — ${org} · anchor city ${city.name}. Subjects: ${primary}; associate ${associate}. Chain reference OPS-${202600 + idx}.`,
      status: pick(STATUSES),
      priority: sev,
      risk_score: rand(15, 98),
      threat_score: rand(15, 98),
      ai_confidence: rand(55, 97),
      category: ctype,
      investigation_type: ctype,
      location: city.name,
      geo_location: { label: city.name, lat: city.lat, lon: city.lon },
      assigned_to: agent,
      assigned_agent: agent,
      suspects: [primary, associate],
      anomaly_count: rand(0, 12),
      evidence_count: 0,
      telemetry_count: 0,
      tags: ['interagency', ctype.split('_')[0], city.name.slice(0, 3).toUpperCase()],
      created_at: randomTimestamp(400),
      updated_at: randomTimestamp(120),
    };
  });

  const { data: insertedCases, error: casesError } = await supabase.from('cases').insert(cases).select('id');
  if (casesError || !insertedCases?.length) {
    console.error('Failed to insert cases:', casesError);
    process.exit(1);
  }
  const caseIds = insertedCases.map((c) => c.id);
  console.log(`Cases inserted: ${caseIds.length}`);

  console.log('Generating 500 evidence rows...');
  const evidence = Array.from({ length: 500 }).map((_, i) => {
    const caseId = pick(caseIds);
    const idx = caseIds.indexOf(caseId);
    const suspects = suspectsByCase[idx] || { primary: randName(), associate: randName() };
    const city = pick(CITIES);
    const seed = `${caseId}-${i}-${Math.random()}`;
    const chainStep = ['field_seizure', 'lab_intake', 'digital_mirror', 'court_ready'][rand(0, 3)];
    return {
      case_id: caseId,
      name: `EV-${10000 + i}-${pick(['pdf', 'jpg', 'mp4', 'bin', 'csv', 'json'])}`,
      title: `EV-${10000 + i}-${pick(['pdf', 'jpg', 'mp4', 'bin', 'csv', 'json'])}`,
      type: pick(EVIDENCE_TYPES),
      status: pick(['pending', 'analyzed', 'flagged']),
      scan_status: pick(['pending', 'complete', 'flagged']),
      hash_sha256: sha256hex(seed),
      hash: sha256hex(seed),
      file_name: `EV-${10000 + i}-${pick(['pdf', 'jpg', 'mp4', 'bin', 'csv', 'json'])}`,
      file_type: pick(EVIDENCE_TYPES),
      metadata_json: {
        custodian: `AGT-${rand(100, 999)}`,
        chain_step: chainStep,
        related_subjects: [suspects.primary, suspects.associate],
        geo: { lat: city.lat + (Math.random() - 0.5) * 0.2, lon: city.lon + (Math.random() - 0.5) * 0.2 },
        acquired_at: randomTimestamp(200),
        vault: `VLT-${rand(1, 9)}-${rand(10, 99)}`,
      },
      authenticity_score: rand(40, 99),
      risk_score: rand(12, 96),
      uploaded_at: randomTimestamp(180),
      created_at: randomTimestamp(180),
    };
  });
  await bulkInsert('evidence', evidence);

  console.log('Generating 1000 timeline events...');
  const timeline = Array.from({ length: 1000 }).map(() => {
    const caseId = pick(caseIds);
    const idx = caseIds.indexOf(caseId);
    const suspects = suspectsByCase[idx] || { primary: randName(), associate: randName() };
    const city = pick(CITIES);
    const et = pick(['intercept', 'arrest', 'evidence_found', 'financial', 'movement', 'meeting']);
    const ts = randomTimestamp(350);
    return {
      case_id: caseId,
      event_type: et,
      type: pick(['digital', 'physical', 'financial', 'movement', 'communication']),
      title: `${et.replace('_', ' ')} — ${city.name}`,
      description: `Operational narrative: ${suspects.primary} observed near ${city.name}; corroboration from SIGINT · confidence ladder applied.`,
      severity: pick(SEVERITIES),
      timestamp: ts,
      confidence_score: rand(40, 97),
      source_type: pick(['SIGINT', 'HUMINT', 'OSINT', 'TECHINT', 'GEOINT']),
      metadata_json: {
        analyst: `ANA-${rand(200, 899)}`,
        corroboration: rand(1, 4),
        narrative_phase: pick(['ascending', 'plateau', 'resolution']),
      },
      created_at: ts,
    };
  });
  await bulkInsert('timeline_events', timeline);

  console.log('Generating 2000 telemetry_events...');
  const telemetry = Array.from({ length: 2000 }).map(() => {
    const caseId = Math.random() > 0.25 ? pick(caseIds) : null;
    const city = pick(CITIES);
    const kind = pick(TELEMETRY_TYPES);
    const ts = randomTimestamp(14);
    const ascore = Math.round(Math.random() * 85 * 10) / 10;
    const aiconf = Math.round((0.55 + Math.random() * 0.44) * 1000) / 1000;
    return {
      case_id: caseId,
      event_type: kind,
      signal_type: kind,
      severity: pick(SEVERITIES),
      source: pick(['SIGINT', 'HUMINT', 'OSINT', 'TECHINT', 'GEOINT', 'LAB']),
      anomaly_score: ascore,
      ai_confidence: aiconf,
      timestamp: ts,
      event_time: ts,
      metadata: { sector: `SEC-${rand(1, 9)}`, correlation: sha256hex(`${caseId}-${kind}`).slice(0, 16) },
      payload_json: {
        sector: `SEC-${rand(1, 9)}`,
        geo_fence_km: rand(1, 80),
        lat: city.lat + (Math.random() - 0.5) * 0.5,
        lon: city.lon + (Math.random() - 0.5) * 0.5,
        correlation_id: `COR-${sha256hex(`${caseId}-${kind}-${ts}`).slice(0, 12)}`,
        escalation_step: rand(1, 5),
        anomaly_score: ascore,
        ai_confidence: aiconf,
      },
      created_at: ts,
    };
  });
  await bulkInsert('telemetry_events', telemetry);

  console.log('Generating 300 AI insights...');
  const insights = Array.from({ length: 300 }).map(() => ({
    case_id: pick(caseIds),
    title: pick(['Entropy spike', 'Financial convergence', 'Travel pattern deviation', 'Crypto mixer touchpoint', 'Replica device fingerprint']),
    description: `Linked enrichment suggests coordinated activity window T-${rand(1, 96)}h — analyst confidence ${rand(55, 96)}%.`,
    severity: pick(SEVERITIES),
    source: pick(['GEMINI', 'RULE_ENGINE', 'CORRELATOR']),
    created_at: randomTimestamp(90),
  }));
  await bulkInsert('insights', insights);

  console.log('Generating 150 behavioral_patterns + 150 anomalies...');
  const behaviors = Array.from({ length: 150 }).map(() => ({
    case_id: pick(caseIds),
    pattern_type: pick(['circadian_break', 'route_entropy', 'comm_burst', 'wallet_velocity']),
    description: `Baseline deviation ${rand(18, 82)}% vs cohort · drift sustained across ${rand(3, 14)} days.`,
    similarity_score: Math.round(Math.random() * 1000) / 1000,
    confidence: rand(40, 96),
    data: { vectors: ['geo', 'comm', 'finance'], seed: 'operational' },
    created_at: randomTimestamp(120),
  }));
  await bulkInsert('behavioral_patterns', behaviors);

  const anomalies = Array.from({ length: 150 }).map(() => ({
    case_id: pick(caseIds),
    anomaly_type: pick(['behavioral_deviation', 'financial_spike', 'network_intrusion', 'geolocation_mismatch']),
    score: rand(40, 99),
    details: {
      narrative: 'Automated cluster exceeds adaptive threshold — escalation recommended.',
      confidence: rand(55, 98),
    },
    created_at: randomTimestamp(60),
  }));
  await bulkInsert('anomalies', anomalies);

  console.log('Generating 100 deepfake_scans + 75 toxicology_reports...');
  const deepfakes = Array.from({ length: 100 }).map(() => ({
    case_id: pick(caseIds),
    file_type: pick(['image', 'video', 'audio']),
    authenticity_score: rand(12, 94),
    risk_level: pick(SEVERITIES),
    gan_artifacts_detected: Math.random() > 0.45,
    confidence: rand(50, 99),
    metadata_anomalies: { exif: 'inconsistent_device_clock', compression: 'blocking_grid' },
    manipulation_regions: { heatmap: 'synthetic_grid', frames: rand(3, 240) },
    frame_analysis: { gan_probability: Math.random(), temporal_coherence: Math.random() },
    created_at: randomTimestamp(40),
  }));
  await bulkInsert('deepfake_scans', deepfakes);

  const tox = Array.from({ length: 75 }).map(() => {
    const halfLife = 4 + Math.random() * 18;
    const dose = Math.random() * 8;
    return {
      case_id: pick(caseIds),
      subject_id: `SUB-${rand(1000, 9999)}`,
      raw_report: 'Synthetic LC-MS/MS panel — operational seed.',
      ai_analysis: {
        substance: pick(['fentanyl_analog', 'cocaine', 'methamphetamine', 'benzodiazepine']),
        half_life_h: halfLife,
        model: 'one_compartment',
      },
      lethal_probability: rand(0, 85),
      chart_series: [
        { t_h: 0, conc_ng_ml: dose * 10 },
        { t_h: halfLife, conc_ng_ml: dose * 5 },
        { t_h: halfLife * 3, conc_ng_ml: dose * 1.25 },
      ],
      created_at: randomTimestamp(60),
    };
  });
  await bulkInsert('toxicology_reports', tox);

  console.log('--- GENERATION COMPLETE ---');
}

run().catch(console.error);
