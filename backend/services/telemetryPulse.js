/**
 * Operational telemetry — telemetry_snapshots + telemetry_events, Socket.IO fan-out.
 */

const logger = require('../utils/logger');
const db = require('./supabaseService');
const realtime = require('./realtimeService');

let intervalId = null;
let intelIntervalId = null;

const INTEL_EVENTS = [
  { type: 'alert', title: 'Pattern Anomaly', message: 'Anomaly detected in correlated evidence cluster.', level: 'critical' },
  { type: 'warning', title: 'Threat Detection', message: 'Elevated signature match against watchlist behavioral model.', level: 'high' },
  { type: 'info', title: 'Scan Update', message: 'Neural forensic pattern scan completed — no chain break.', level: 'low' },
  { type: 'success', title: 'Custody', message: 'Evidence chain integrity verified across lab handoff nodes.', level: 'low' },
];

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

function randomTelemetry() {
  const signals = Math.floor(Math.random() * 35) + 58;
  const anomalies = Math.floor(Math.random() * 18) + 4;
  return { signals, anomalies, baseline: 50, sector: `SEC-${Math.floor(Math.random() * 9) + 1}` };
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function tick() {
  const { signals, anomalies, baseline, sector } = randomTelemetry();
  try {
    await db.insertTelemetrySnapshot({ signals, anomalies, baseline, sector });
  } catch (e) {
    logger.warn('[TelemetryPulse] snapshot skipped', { message: e.message });
  }

  const kind = pick(TELEMETRY_KINDS);
  try {
    const row = await db.insertTelemetryEvent({
      event_type: kind,
      severity: anomalies > 14 ? 'high' : anomalies > 10 ? 'medium' : 'low',
      source: 'pulse-engine',
      payload_json: {
        signals,
        anomalies,
        baseline,
        sector,
        gan_probability_hint: Math.round(Math.random() * 1000) / 1000,
      },
    });
    realtime.broadcast('TELEMETRY_EVENT', {
      id: row?.id,
      event_type: kind,
      severity: anomalies > 14 ? 'high' : 'medium',
      payload_json: { signals, anomalies, sector },
    });
  } catch (e) {
    logger.debug('[TelemetryPulse] telemetry_events skipped', { message: e.message });
  }

  realtime.broadcast('TELEMETRY_TICK', {
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    signals,
    anomalies,
    baseline,
    sector,
  });

  realtime.broadcast('DASHBOARD_REFRESH', { source: 'telemetry' });
}

async function intelligenceTick() {
  const ev = INTEL_EVENTS[Math.floor(Math.random() * INTEL_EVENTS.length)];
  try {
    await db.insertIntelligenceEvent({
      event_type: 'LIVE_INTEL',
      title: ev.title,
      message: ev.message,
      severity: ev.level,
      payload: { type: ev.type },
      source: 'pulse-engine',
    });
  } catch (e) {
    logger.debug('[TelemetryPulse] intel insert skipped', { message: e.message });
  }
  realtime.broadcast('INTELLIGENCE_FEED', {
    type: ev.type,
    title: ev.title,
    message: ev.message,
    level: ev.level,
  });
  realtime.broadcast('DASHBOARD_REFRESH', { source: 'intelligence' });
}

function scheduleTelemetryLoop() {
  const delay = 1000 + Math.floor(Math.random() * 2000);
  intervalId = setTimeout(async () => {
    try {
      await tick();
    } catch (e) {
      logger.warn('[TelemetryPulse] tick error', { message: e.message });
    }
    scheduleTelemetryLoop();
  }, delay);
}

function startTelemetryPulse() {
  if (intervalId) return;
  scheduleTelemetryLoop();
  intelIntervalId = setInterval(intelligenceTick, 12000);
  logger.info('[TelemetryPulse] Live telemetry 1–3s jitter · Intel feed every 12s');
  setImmediate(tick);
  setImmediate(intelligenceTick);
}

function stopTelemetryPulse() {
  if (intervalId) {
    clearTimeout(intervalId);
    intervalId = null;
  }
  if (intelIntervalId) {
    clearInterval(intelIntervalId);
    intelIntervalId = null;
  }
}

module.exports = { startTelemetryPulse, stopTelemetryPulse, tick };
