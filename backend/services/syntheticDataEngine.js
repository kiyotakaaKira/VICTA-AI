/**
 * backend/services/syntheticDataEngine.js
 *
 * Generates realistic forensic datasets and seeds the database when empty.
 * All data is dynamic, relationship-mapped, and severity-scaled.
 * Called once at startup to ensure the database always has investigation data.
 */

'use strict';

const logger = require('../utils/logger');
const db = require('./supabaseService');

// ─────────────────────────────────────────
// SEED DATA POOLS
// ─────────────────────────────────────────

const FIRST_NAMES = ['James', 'Maria', 'Alexander', 'Yuki', 'Marcus', 'Sofia', 'Dimitri', 'Amara', 'Rafael', 'Elena', 'Victor', 'Nadia'];
const LAST_NAMES = ['Volkov', 'Chen', 'Mendez', 'Petrov', 'Santos', 'Nakamura', 'Kiriakis', 'Obi', 'Castillo', 'Ivanova', 'Romero', 'Lindqvist'];
const CITIES = ['Moscow', 'Shanghai', 'Bogotá', 'Kyiv', 'São Paulo', 'Tokyo', 'Athens', 'Lagos', 'Caracas', 'Prague', 'Havana', 'Minsk'];
const ORGANIZATIONS = ['Syndicate Alpha', 'Shadow Nexus', 'Iron Wolf Group', 'Project Chimera', 'Dark Meridian', 'Oberon Network', 'Vantage Cartel'];
const EVIDENCE_TYPES = ['document', 'image', 'video', 'audio', 'financial_record', 'network_log', 'biometric', 'device_dump'];
const CASE_TYPES = ['cyber_espionage', 'financial_fraud', 'narcotics', 'human_trafficking', 'terrorism', 'money_laundering', 'arms_trafficking'];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES = ['active', 'active', 'active', 'pending', 'closed'];

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { return [...arr].sort(() => 0.5 - Math.random()).slice(0, n); }

function randName() { return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`; }

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function randomTimestamp(daysBack = 90) {
  const offset = rand(0, daysBack);
  const d = new Date();
  d.setDate(d.getDate() - offset);
  d.setHours(rand(0, 23), rand(0, 59), rand(0, 59));
  return d.toISOString();
}

function riskFromSeverity(sev) {
  return { critical: rand(80, 99), high: rand(60, 79), medium: rand(35, 59), low: rand(10, 34) }[sev] ?? rand(20, 60);
}

// ─────────────────────────────────────────
// CASE SEEDER
// ─────────────────────────────────────────

async function seedCases(count = 8) {
  const cases = [];
  for (let i = 0; i < count; i++) {
    const severity = pick(SEVERITIES);
    const caseType = pick(CASE_TYPES);
    const suspect = randName();
    const city = pick(CITIES);
    const agent = `AGT-${rand(100, 999)}`;
    const rs = riskFromSeverity(severity);
    cases.push({
      title: `Operation ${pick(['Iron', 'Shadow', 'Ghost', 'Phantom', 'Steel', 'Dark', 'Crimson'])} ${pick(['Falcon', 'Viper', 'Fox', 'Wolf', 'Hawk', 'Bear', 'Eagle'])}`,
      description: `Cross-border ${caseType.replace('_', ' ')} investigation linked to ${pick(ORGANIZATIONS)} operating out of ${city}. Primary suspect: ${suspect}. Classified intelligence asset involvement suspected.`,
      status: pick(STATUSES),
      priority: severity,
      category: caseType,
      investigation_type: caseType,
      assigned_to: agent,
      assigned_agent: agent,
      suspects: [suspect, randName()],
      location: city,
      geo_location: { label: city },
      risk_score: rs,
      threat_score: rs,
      ai_confidence: rand(62, 97),
      anomaly_count: rand(0, 8),
      evidence_count: 0,
      telemetry_count: 0,
      created_at: randomTimestamp(120),
      updated_at: randomTimestamp(30),
    });
  }

  const results = [];
  for (const c of cases) {
    try {
      const row = await db.createCase(c);
      if (row) results.push(row);
    } catch (e) {
      logger.debug('[SyntheticEngine] case insert skipped', { msg: e.message });
    }
  }
  logger.info(`[SyntheticEngine] Seeded ${results.length} cases`);
  return results;
}

// ─────────────────────────────────────────
// EVIDENCE SEEDER
// ─────────────────────────────────────────

async function seedEvidence(caseIds, countPerCase = 3) {
  const FILE_NAMES = [
    'intercept_audio.mp3', 'financial_ledger.xlsx', 'suspect_photo.jpg',
    'network_log_dump.txt', 'encrypted_comms.bin', 'surveillance_clip.mp4',
    'biometric_scan.dat', 'device_forensics.json', 'witness_statement.pdf',
  ];

  for (const caseId of caseIds) {
    for (let i = 0; i < countPerCase; i++) {
      const evType = pick(EVIDENCE_TYPES);
      try {
        await db.createEvidence({
          case_id: caseId,
          title: pick(FILE_NAMES),
          name: pick(FILE_NAMES),
          type: evType,
          status: pick(['pending', 'analyzed', 'analyzed', 'flagged']),
          scan_status: pick(['pending', 'complete']),
          hash_sha256: `${Math.random().toString(36).substring(2, 34)}${Math.random().toString(36).substring(2, 34)}`,
          metadata_json: {
            size_bytes: rand(1024, 52428800),
            mime_type: evType === 'image' ? 'image/jpeg' : evType === 'video' ? 'video/mp4' : 'application/octet-stream',
            source: pick(['field_collection', 'digital_intercept', 'witness_submission', 'court_order']),
          },
          risk_score: rand(20, 95),
          ai_confidence: rand(55, 98),
          tags: pickN(['encrypted', 'tampered', 'geo-tagged', 'time-sensitive', 'chain-verified', 'high-priority', 'classified'], 3),
          created_at: randomTimestamp(90),
        });
      } catch (e) {
        logger.debug('[SyntheticEngine] evidence insert skipped', { msg: e.message });
      }
    }
  }
  logger.info(`[SyntheticEngine] Seeded evidence for ${caseIds.length} cases`);
}

// ─────────────────────────────────────────
// INTELLIGENCE EVENTS SEEDER
// ─────────────────────────────────────────

async function seedIntelligenceEvents(count = 20) {
  const EVENT_TEMPLATES = [
    { type: 'SIGINT', title: 'Encrypted Comms Intercepted', severity: 'critical', category: 'signals' },
    { type: 'GEOFENCE', title: 'Geofence Perimeter Breach', severity: 'high', category: 'surveillance' },
    { type: 'FINANCIAL', title: 'Dark Pool Transaction Flagged', severity: 'high', category: 'financial' },
    { type: 'BIOMETRIC', title: 'Facial Match on Watchlist', severity: 'critical', category: 'biometric' },
    { type: 'BEHAVIORAL', title: 'Anomalous Movement Pattern', severity: 'medium', category: 'behavioral' },
    { type: 'CYBER', title: 'Zero-Day Exploit Detected', severity: 'critical', category: 'cyber' },
    { type: 'TOXICOLOGY', title: 'Controlled Substance Trace Confirmed', severity: 'high', category: 'forensic' },
    { type: 'NETWORK', title: 'Dark Web Marketplace Activity', severity: 'medium', category: 'network' },
  ];

  for (let i = 0; i < count; i++) {
    const tpl = pick(EVENT_TEMPLATES);
    const suspect = randName();
    try {
      await db.insertIntelligenceEvent({
        event_type: tpl.type,
        type: tpl.type,
        title: tpl.title,
        message: `${tpl.title} — Subject: ${suspect} · Location: ${pick(CITIES)} · Confidence: ${rand(60, 97)}%`,
        severity: tpl.severity,
        source: pick(['SIGINT', 'HUMINT', 'OSINT', 'TECHINT', 'GEOINT']),
        category: tpl.category,
        payload: { suspect, city: pick(CITIES), confidence: rand(60, 97) },
        metadata: { auto_seeded: true },
        ai_confidence: rand(0.6, 0.97),
        created_at: randomTimestamp(7),
      });
    } catch (e) {
      logger.debug('[SyntheticEngine] intelligence event skipped', { msg: e.message });
    }
  }
  logger.info(`[SyntheticEngine] Seeded ${count} intelligence events`);
}

// ─────────────────────────────────────────
// ANOMALY EVENTS SEEDER
// ─────────────────────────────────────────

async function seedAnomalies(caseIds, count = 12) {
  const ANOMALY_TYPES = [
    'behavioral_deviation', 'financial_spike', 'network_intrusion',
    'geolocation_mismatch', 'temporal_anomaly', 'identity_fraud',
    'communication_blackout', 'biometric_spoofing',
  ];

  for (let i = 0; i < count; i++) {
    const caseId = pick(caseIds);
    try {
      await db.insertAnomaly({
        case_id: caseId,
        anomaly_type: pick(ANOMALY_TYPES),
        score: rand(45, 99),
        details: {
          detected_at: randomTimestamp(14),
          vector: pick(['network', 'physical', 'financial', 'behavioral']),
          confidence: rand(55, 98),
          auto_seeded: true,
        },
        created_at: randomTimestamp(14),
      });
    } catch (e) {
      logger.debug('[SyntheticEngine] anomaly insert skipped', { msg: e.message });
    }
  }
  logger.info(`[SyntheticEngine] Seeded ${count} anomalies`);
}

// ─────────────────────────────────────────
// TELEMETRY SNAPSHOTS SEEDER
// ─────────────────────────────────────────

async function seedTelemetry(count = 48) {
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const ts = new Date(now - (count - i) * 5 * 60 * 1000).toISOString(); // 5-min intervals
    try {
      await db.insertTelemetrySnapshot({
        signals: rand(45, 95),
        anomalies: rand(2, 22),
        baseline: 50,
        sector: `SEC-${rand(1, 9)}`,
        created_at: ts,
      });
    } catch (e) {
      logger.debug('[SyntheticEngine] telemetry snapshot skipped', { msg: e.message });
    }
  }
  logger.info(`[SyntheticEngine] Seeded ${count} telemetry snapshots`);
}

// ─────────────────────────────────────────
// GRAPH NODES + EDGES SEEDER
// ─────────────────────────────────────────

async function seedGraphData(caseIds) {
  const NODE_TYPES = ['suspect', 'victim', 'device', 'location', 'vehicle', 'organization'];

  for (const caseId of caseIds.slice(0, 3)) {
    const nodeCount = rand(5, 9);
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const ntype = pick(NODE_TYPES);
      const label = ntype === 'suspect' || ntype === 'victim' ? randName()
        : ntype === 'location' ? pick(CITIES)
        : ntype === 'organization' ? pick(ORGANIZATIONS)
        : `${ntype.toUpperCase()}-${rand(100, 999)}`;

      nodes.push({
        id: `node-${caseId.slice(0, 8)}-${i}`,
        type: ntype,
        label,
        data: { risk: riskFromSeverity(pick(SEVERITIES)), auto_seeded: true },
        position: { x: rand(50, 800), y: rand(50, 500) },
      });
    }

    const edges = [];
    for (let i = 1; i < nodes.length; i++) {
      edges.push({
        id: `edge-${caseId.slice(0, 8)}-${i}`,
        source: nodes[0].id,
        target: nodes[i].id,
        label: pick(['associated_with', 'owns', 'located_at', 'communicated_with', 'linked_to']),
        data: { weight: rand(1, 10) },
      });
    }

    try {
      await db.bulkInsertGraphData(caseId, nodes, edges);
    } catch (e) {
      logger.debug('[SyntheticEngine] graph data skipped', { msg: e.message });
    }
  }
  logger.info('[SyntheticEngine] Seeded graph data for sample cases');
}

// ─────────────────────────────────────────
// TIMELINE EVENTS SEEDER
// ─────────────────────────────────────────

async function seedTimeline(caseIds) {
  const TIMELINE_EVENT_TYPES = [
    { type: 'intercept', label: 'Communication Intercepted' },
    { type: 'arrest', label: 'Suspect Detained' },
    { type: 'evidence_found', label: 'Evidence Located' },
    { type: 'financial', label: 'Transaction Flagged' },
    { type: 'movement', label: 'Suspect Movement Logged' },
    { type: 'meeting', label: 'Covert Meeting Recorded' },
  ];

  for (const caseId of caseIds.slice(0, 4)) {
    const evCount = rand(4, 8);
    for (let i = 0; i < evCount; i++) {
      const tpl = pick(TIMELINE_EVENT_TYPES);
      try {
        await db.createTimelineEvent({
          case_id: caseId,
          event_type: tpl.type,
          type: 'digital',
          title: tpl.label,
          description: `${tpl.label} — ${pick(CITIES)} · ${randName()} · AI confidence ${rand(55, 97)}%`,
          severity: pick(SEVERITIES),
          timestamp: randomTimestamp(60),
          confidence_score: rand(55, 97),
          source_type: pick(['SIGINT', 'OSINT', 'TECHINT']),
          metadata_json: { auto_seeded: true },
        });
      } catch (e) {
        logger.debug('[SyntheticEngine] timeline event skipped', { msg: e.message });
      }
    }
  }
  logger.info('[SyntheticEngine] Seeded timeline events');
}

// ─────────────────────────────────────────
// PREDICTIVE RECOMMENDATIONS SEEDER
// ─────────────────────────────────────────

async function seedPredictiveRecommendations(caseIds) {
  const RECOMMENDATIONS = [
    { action: 'Expand surveillance perimeter to secondary locations', priority: 'critical' },
    { action: 'Request INTERPOL cross-reference on suspect biometrics', priority: 'high' },
    { action: 'Initiate financial freeze on flagged accounts', priority: 'high' },
    { action: 'Deploy digital forensics team to recovered device', priority: 'medium' },
    { action: 'Coordinate with border agency for travel ban enforcement', priority: 'medium' },
    { action: 'Schedule witness re-interview with AI analysis support', priority: 'low' },
  ];

  for (const caseId of caseIds) {
    const recCount = rand(2, 4);
    for (let i = 0; i < recCount; i++) {
      const rec = pick(RECOMMENDATIONS);
      try {
        await db.insertPredictiveRecommendation({
          case_id: caseId,
          action: rec.action,
          priority: rec.priority,
          reasoning: `AI correlation engine identified ${rand(3, 12)} linked patterns matching this recommendation vector.`,
          confidence: rand(55, 96),
          payload: { auto_seeded: true },
          created_at: randomTimestamp(7),
        });
      } catch (e) {
        logger.debug('[SyntheticEngine] predictive rec skipped', { msg: e.message });
      }
    }
  }
  logger.info('[SyntheticEngine] Seeded predictive recommendations');
}

// ─────────────────────────────────────────
// MAIN SEED ORCHESTRATOR
// ─────────────────────────────────────────

let seeded = false;

async function seedIfEmpty() {
  if (seeded) return;
  seeded = true;

  try {
    const { data: existingCases } = await db.getCasesPaginated({ limit: 1 });
    if (existingCases && existingCases.length > 0) {
      logger.info('[SyntheticEngine] Database already seeded — skipping');
      return;
    }
  } catch (e) {
    logger.debug('[SyntheticEngine] Pre-seed check failed — proceeding with seed', { msg: e.message });
  }

  logger.info('[SyntheticEngine] Starting database seed...');

  // 1. Seed core cases
  const cases = await seedCases(10);
  const caseIds = cases.map(c => c.id).filter(Boolean);

  if (caseIds.length === 0) {
    logger.warn('[SyntheticEngine] No cases seeded — aborting dependent seeds');
    return;
  }

  // 2. Seed all dependent data in parallel
  await Promise.allSettled([
    seedEvidence(caseIds, 3),
    seedIntelligenceEvents(25),
    seedAnomalies(caseIds, 15),
    seedTelemetry(48),
    seedGraphData(caseIds),
    seedTimeline(caseIds),
    seedPredictiveRecommendations(caseIds),
  ]);

  logger.info('[SyntheticEngine] ✓ Database seeding complete');
}

module.exports = { seedIfEmpty, seedCases, seedEvidence, seedIntelligenceEvents, seedTelemetry };
