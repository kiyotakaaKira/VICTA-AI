const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../services/supabaseService');
const {
  analyzeDeepfakeSentinel,
  generateKnowledgeGraphNodesSentinel,
  detectAnomaliesSentinel,
  generateForensicReportSentinel,
  analyzeBehavioralPatternsSentinel,
} = require('../services/geminiService');
const logger = require('../utils/logger');

// The prompt expects POST /api/analyze with { action: '...' }
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const { action } = data;

    // ── DEEPFAKE SCAN ──────────────────────────────────────────────────────────
    if (action === 'deepfake_scan') {
      if (!data.description || !data.file_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (!['image', 'video', 'audio'].includes(data.file_type)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      const analysis = await analyzeDeepfakeSentinel(data.description, data.file_type);

      if (data.case_id && data.evidence_id) {
        const { error: dbError } = await db.client.from('deepfake_scans').insert({
          evidence_id:           data.evidence_id,
          case_id:               data.case_id,
          file_type:             data.file_type,
          authenticity_score:    analysis.authenticity_score   ?? 50,
          risk_level:            analysis.risk_level            ?? 'unknown',
          gan_artifacts_detected: analysis.gan_artifacts_detected ?? false,
          metadata_anomalies:    analysis.metadata_anomalies   ?? [],
          manipulation_regions:  analysis.suspicious_regions   ?? [],
          frame_analysis:        analysis.frame_analysis        ?? [],
          ai_explanation:        analysis.ai_explanation        ?? '',
          confidence:            analysis.confidence            ?? 50,
          processing_status:     'complete',
        });
        if (dbError) logger.error('Deepfake DB error:', dbError);
      }

      return res.json({ success: true, analysis });
    }

    // ── GENERATE KNOWLEDGE GRAPH ───────────────────────────────────────────────
    if (action === 'generate_graph') {
      if (!data.case_id || !data.case_title) {
        return res.status(400).json({ error: 'Missing case data' });
      }

      const graphData = await generateKnowledgeGraphNodesSentinel(
        data.case_title,
        data.evidence_items || []
      );

      if (graphData.nodes?.length && data.case_id) {
        const nodesForBulk = graphData.nodes.map((n) => ({
          id:
            n.temp_id != null
              ? String(n.temp_id)
              : n.id != null
                ? String(n.id)
                : undefined,
          node_type: n.node_type,
          label: n.label,
          metadata: n.metadata || {},
        }));
        const edgesForBulk = (graphData.edges || []).map((e) => ({
          source: String(e.source),
          target: String(e.target),
          label: e.relationship_type,
          weight: e.weight ?? 1.0,
          data: e.metadata || {},
        }));
        await db.bulkInsertGraphData(data.case_id, nodesForBulk, edgesForBulk);
      }

      return res.json({ success: true, graph: graphData });
    }

    // ── DETECT ANOMALIES ───────────────────────────────────────────────────────
    if (action === 'detect_anomalies') {
      if (!data.case_id) {
        return res.status(400).json({ error: 'Missing case_id' });
      }

      const result = await detectAnomaliesSentinel(
        data.case_id,
        data.evidence_summaries || [],
        data.timeline_events    || []
      );

      if (result.anomalies?.length && data.case_id) {
        const inserts = result.anomalies.map((a) => ({
          case_id:      data.case_id,
          anomaly_type: a.anomaly_type ?? 'unknown',
          description:  a.description  ?? '',
          confidence:   a.confidence   ?? 50,
          severity:     a.severity     ?? 'medium',
          evidence_ids: data.evidence_ids ?? [],
          resolved:     false,
        }));
        await db.client.from('anomaly_events').insert(inserts);
      }

      return res.json({ success: true, result });
    }

    // ── GENERATE REPORT ────────────────────────────────────────────────────────
    if (action === 'generate_report') {
      if (!data.case_id) {
        return res.status(400).json({ error: 'Missing case_id' });
      }

      const report = await generateForensicReportSentinel(data);

      await db.client.from('forensic_reports').insert({
        case_id:      data.case_id,
        report_type:  'full_forensic',
        generated_by: 'gemini-1.5-flash',
        content:       report,
      });

      if (data.user_id) {
        await db.client.from('audit_logs').insert({
          user_id:     data.user_id,
          action:      'generate_report',
          entity_type: 'case',
          entity_id:   data.case_id,
          metadata:    { report_type: 'full_forensic', confidence: report.confidence_level },
        });
      }

      return res.json({ success: true, report });
    }

    // ── BEHAVIORAL ANALYSIS ────────────────────────────────────────────────────
    if (action === 'behavioral_analysis') {
      if (!data.case_id) {
        return res.status(400).json({ error: 'Missing case_id' });
      }

      const analysis = await analyzeBehavioralPatternsSentinel(
        data.case_title         ?? '',
        data.communication_logs ?? '',
        data.movement_data      ?? ''
      );

      await db.insertBehavioralPattern({
        case_id: data.case_id,
        pattern_type: 'full_behavioral_analysis',
        description: analysis.behavioral_profile ?? '',
        confidence: analysis.confidence ?? 50,
        similarity_score: (analysis.confidence ?? 50) / 100,
        data: analysis,
      });

      return res.json({ success: true, analysis });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    logger.error('[Route] POST /analyze', { error: err.message });
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
