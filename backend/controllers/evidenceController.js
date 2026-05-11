/**
 * controllers/evidenceController.js
 */

const db = require('../services/supabaseService');
const { uploadFile } = require('../services/fileUploadService');
const { runEvidencePipeline } = require('../services/forensicsPipeline');
const realtime = require('../services/realtimeService');
const { asyncHandler, sendSuccess, sendError } = require('../utils/helpers');

const getEvidence = asyncHandler(async (req, res) => {
  const data = await db.getEvidenceByCase(req.params.caseId);
  sendSuccess(res, data);
});

const uploadEvidence = asyncHandler(async (req, res) => {
  const { caseId, name, type } = req.body;
  if (!caseId) return sendError(res, 'caseId is required.', 400, 'MISSING_FIELDS');

  let fileData = null;
  if (req.file) {
    fileData = await uploadFile(req.file, `evidence/${caseId}`);
  }

  const evidence = await db.createEvidence({
    case_id: caseId,
    name: name || req.file?.originalname || 'Untitled Evidence',
    type: type || req.file?.mimetype || 'unknown',
    url: fileData?.url || null,
    size: fileData?.size || 0,
    uploaded_by: req.user?.id || 'hackathon-user-001',
  });

  if (req.file?.buffer) {
    const buf = Buffer.from(req.file.buffer);
    const mime = req.file.mimetype;
    const orig = req.file.originalname;
    realtime.broadcast('EVIDENCE_UPLOADED', { evidenceId: evidence.id, caseId });
    setImmediate(() => {
      runEvidencePipeline({
        evidenceId: evidence.id,
        caseId,
        buffer: buf,
        mimetype: mime,
        originalname: orig,
      });
    });
  }

  sendSuccess(res, evidence, 201);
});

const updateEvidence = asyncHandler(async (req, res) => {
  const updated = await db.updateEvidence(req.params.id, req.body);
  sendSuccess(res, updated);
});

module.exports = { getEvidence, uploadEvidence, updateEvidence };
