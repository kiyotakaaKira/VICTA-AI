/**
 * controllers/graphController.js
 * Builds a knowledge graph from case evidence and relationships.
 */

const db = require('../services/supabaseService');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

const getGraph = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const caseData = await db.getCaseById(caseId);
  if (!caseData) {
    return res.status(404).json({ success: false, error: { message: 'Case not found.' } });
  }

  // Build nodes from case + evidence
  const nodes = [];
  const edges = [];

  // Root case node
  nodes.push({
    id: `case_${caseData.id}`,
    type: 'case',
    label: caseData.title,
    data: { status: caseData.status, risk_score: caseData.risk_score },
  });

  // Evidence nodes
  (caseData.evidence || []).forEach((ev, i) => {
    const nodeId = `evidence_${ev.id}`;
    nodes.push({
      id: nodeId,
      type: 'evidence',
      label: ev.name,
      data: { type: ev.type, risk_score: ev.risk_score },
    });
    edges.push({
      id: `edge_case_${i}`,
      source: `case_${caseData.id}`,
      target: nodeId,
      label: 'contains',
    });
  });

  // Insight nodes
  (caseData.insights || []).forEach((ins, i) => {
    const nodeId = `insight_${ins.id}`;
    nodes.push({
      id: nodeId,
      type: 'insight',
      label: ins.title,
      data: { severity: ins.severity },
    });
    edges.push({
      id: `edge_insight_${i}`,
      source: `case_${caseData.id}`,
      target: nodeId,
      label: 'produced',
    });
  });

  sendSuccess(res, { nodes, edges, caseId });
});

module.exports = { getGraph };
