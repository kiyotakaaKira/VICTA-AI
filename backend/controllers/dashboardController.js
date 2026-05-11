/**
 * Live dashboard aggregates — charts, telemetry series, intelligence feed, platform HUD.
 */

const db = require('../services/supabaseService');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await db.getPlatformStatsAggregate();
  sendSuccess(res, stats);
});

const getCharts = asyncHandler(async (req, res) => {
  const charts = await db.getDashboardChartsAggregate();
  sendSuccess(res, charts);
});

const getTelemetrySeries = asyncHandler(async (req, res) => {
  const limit = Math.min(200, parseInt(req.query.limit, 10) || 48);
  let rows = [];
  try {
    rows = await db.getRecentTelemetry(limit);
  } catch (e) {}

  const series = (rows || []).map((r) => ({
    time: new Date(r.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    signals: Number(r.signals),
    anomalies: Number(r.anomalies),
    baseline: Number(r.baseline),
  }));
  sendSuccess(res, series);
});

const getRecentInsights = asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 15);
  const rows = await db.getRecentInsights(limit);
  sendSuccess(res, rows);
});

const getIntelligenceFeed = asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 40);
  let rows = [];
  try {
    rows = await db.getIntelligenceFeed(limit);
  } catch (e) {}

  const alerts = (rows || []).map((r) => ({
    id: r.id,
    type: mapSeverityToType(r.severity),
    severity: r.severity || 'medium',
    title: r.title || 'Intelligence',
    message: r.message || r.event_type,
    timestamp: r.created_at,
    case_id: r.case_id,
  }));
  sendSuccess(res, alerts);
});

function mapSeverityToType(sev) {
  if (sev === 'critical') return 'critical';
  if (sev === 'high') return 'high';
  if (sev === 'low' || sev === 'info') return 'low';
  return 'medium';
}

module.exports = {
  getPlatformStats,
  getCharts,
  getTelemetrySeries,
  getRecentInsights,
  getIntelligenceFeed,
};
