/**
 * End-to-end forensic intelligence pipeline after evidence ingest.
 */

const logger = require('../utils/logger');
const db = require('./supabaseService');
const gemini = require('./geminiService');
const meta = require('./forensicsMetadata');
const realtime = require('./realtimeService');

function classifyMime(mimetype, name) {
  if (!mimetype) return 'document';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('json') || name.endsWith('.json')) return 'json';
  if (mimetype.includes('csv') || name.endsWith('.csv')) return 'csv';
  if (mimetype.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.log')) return 'text';
  return 'document';
}

async function runEvidencePipeline({ evidenceId, caseId, buffer, mimetype, originalname }) {
  const safeName = originalname || 'artifact';

  try {
    realtime.broadcast('PIPELINE_START', { evidenceId, caseId, phase: 'metadata' });

    const extracted = await meta.extractAll(buffer, mimetype, safeName);
    const kind = classifyMime(mimetype, safeName);

    let textForAi = '';
    if (kind === 'text' || kind === 'json' || kind === 'csv') {
      textForAi = buffer.toString('utf8').slice(0, 14000);
    } else {
      textForAi = `File: ${safeName}\nType: ${kind}\nExtracted metadata: ${JSON.stringify(extracted).slice(0, 8000)}`;
    }

    realtime.broadcast('PIPELINE_PHASE', { evidenceId, caseId, phase: 'ai_analysis' });

    const analysis = await gemini.analyzeEvidence({
      text: textForAi,
      type: kind,
      metadata: extracted,
    });

    const authenticityText = await gemini.analyzeAuthenticity({
      contentType: kind,
      text: textForAi.slice(0, 4000),
      metadata: extracted,
    });

    let visionOverlay = null;
    if (kind === 'image' && buffer.length < 4 * 1024 * 1024) {
      try {
        visionOverlay = await gemini.analyzeMediaBuffer({
          buffer,
          mimeType: mimetype || 'image/jpeg',
          metadata: extracted,
        });
        realtime.broadcast('DEEPFAKE_SCAN', { evidenceId, caseId, authenticity: visionOverlay.authenticity_score });
      } catch (e) {
        logger.warn('[Pipeline] vision analysis skipped', { message: e.message });
      }
    }

    const mergedAnalysis = {
      ...analysis,
      authenticity: authenticityText,
      vision: visionOverlay,
      pipeline_metadata: extracted,
    };

    await db.updateEvidence(evidenceId, {
      analysis: mergedAnalysis,
      risk_score: analysis.risk_score ?? 0,
      authenticity_score: visionOverlay?.authenticity_score ?? authenticityText.authenticity_score ?? 100,
    });

    if ((analysis.risk_score || 0) >= 70) {
      await db.insertAnomaly({
        case_id: caseId,
        evidence_id: evidenceId,
        anomaly_type: 'high_risk_evidence',
        score: analysis.risk_score,
        details: { indicators: analysis.suspicious_indicators },
      }).catch(() => {});
    }

    await db.insertIntelligenceEvent({
      event_type: 'EVIDENCE_ANALYZED',
      title: 'Forensic analysis complete',
      message: `${safeName} · Risk ${analysis.risk_score ?? 0} · Confidence ${analysis.confidence ?? 0}%`,
      severity: (analysis.risk_score || 0) >= 75 ? 'critical' : (analysis.risk_score || 0) >= 50 ? 'high' : 'medium',
      case_id: caseId,
      evidence_id: evidenceId,
      payload: { risk_score: analysis.risk_score, tags: analysis.tags },
    }).catch(() => {});

    try {
      const caseData = await db.getCaseById(caseId);
      const evidenceRows = await db.getEvidenceByCase(caseId);
      if (caseData) {
        const graphAi = await gemini.generateGraphNodes({ caseData, evidence: evidenceRows });
        if (graphAi.nodes?.length) {
          await db.bulkInsertGraphData(caseId, graphAi.nodes, graphAi.edges || []);
        }
      }
    } catch (e) {
      logger.warn('[Pipeline] graph generation skipped', { message: e.message });
    }

    try {
      const preds = await gemini.predictNextSteps({
        caseData: await db.getCaseById(caseId),
        evidence: await db.getEvidenceByCase(caseId),
        insights: await db.getInsightsByCase(caseId),
      });
      for (const step of (preds.steps || []).slice(0, 5)) {
        await db.insertPredictiveRecommendation({
          case_id: caseId,
          action: step.action,
          priority: step.priority,
          reasoning: step.reasoning,
          confidence: 80,
          payload: { source: 'pipeline', estimated_impact: step.estimated_impact },
        }).catch(() => {});
      }
    } catch (e) {
      logger.warn('[Pipeline] predictive insert skipped', { message: e.message });
    }

    realtime.broadcast('EVIDENCE_ANALYZED', {
      evidenceId,
      caseId,
      risk_score: analysis.risk_score,
      authenticity_score: visionOverlay?.authenticity_score ?? authenticityText.authenticity_score,
    });
    realtime.broadcast('DASHBOARD_REFRESH', { source: 'pipeline', evidenceId });
    realtime.broadcast('INTELLIGENCE_FEED', {
      type: 'success',
      title: 'Evidence pipeline',
      message: `${safeName} processed · AI classification locked.`,
      level: 'low',
    });
  } catch (err) {
    logger.error('[Pipeline] failed', { evidenceId, message: err.message });
    realtime.broadcast('PIPELINE_ERROR', { evidenceId, caseId, message: err.message });
  }
}

module.exports = { runEvidencePipeline, classifyMime };
