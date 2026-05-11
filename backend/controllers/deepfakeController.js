const multer = require('multer');
const gemini = require('../services/geminiService');
const meta = require('../services/forensicsMetadata');
const db = require('../services/supabaseService');
const realtime = require('../services/realtimeService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 80 * 1024 * 1024 } });

const analyzeDeepfake = async (req, res, next) => {
  try {
    const { evidenceId, url, type } = req.body;

    if (req.file) {
      const extracted = await meta.extractAll(req.file.buffer, req.file.mimetype, req.file.originalname);
      const result = await gemini.analyzeMediaBuffer({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        metadata: { ...extracted, evidenceId },
      });

      await db.insertIntelligenceEvent({
        event_type: 'DEEPFAKE_ANALYSIS',
        title: 'Media authenticity examination',
        message: (result.forensic_notes || 'Analysis complete').slice(0, 500),
        severity: result.authenticity_score < 45 ? 'critical' : result.authenticity_score < 70 ? 'high' : 'low',
        evidence_id: evidenceId || null,
        payload: { authenticity_score: result.authenticity_score, indicators: result.manipulation_indicators },
      }).catch(() => {});

      realtime.broadcast('AUTHENTICITY_SCAN', { evidenceId, score: result.authenticity_score });
      realtime.broadcast('DASHBOARD_REFRESH', { source: 'deepfake' });

      return res.status(200).json({
        success: true,
        data: { ...result, metadata: extracted, manipulation_type: result.manipulation_indicators?.[0] || 'None' },
      });
    }

    const promptContext = `Evidence reference: ${evidenceId || 'n/a'}. URL: ${url || 'n/a'}. Declared type: ${type || 'unknown'}.`;
    const result = await gemini.analyzeAuthenticity({
      contentType: type || 'video',
      text: `Perform forensic media authenticity assessment. ${promptContext}
Describe likely manipulation class, compression artifacts, and GAN/deepfake risk in operational language.`,
      metadata: { url, evidenceId },
    });

    res.status(200).json({
      success: true,
      data: {
        authenticity_score: result.authenticity_score,
        manipulation_type: result.manipulation_type || 'Unknown',
        details: {
          indicators: result.manipulation_indicators,
          notes: result.forensic_notes,
          recommended_tools: result.recommended_tools,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeDeepfake, upload };
