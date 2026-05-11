const db = require('../services/supabaseService');
const gemini = require('../services/geminiService');
const realtime = require('../services/realtimeService');

const analyzeToxicology = async (req, res, next) => {
  try {
    const { caseId, subjectId, reportText, data } = req.body;
    const text = reportText || data || '';
    if (!text || String(text).length < 12) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'reportText or data (substantive lab narrative) is required.' },
      });
    }

    const analysis = await gemini.analyzeToxicologyForensic({
      reportText: text,
      caseId,
      subjectId,
    });

    await db.insertToxicologyReport({
      case_id: caseId || null,
      subject_id: subjectId || null,
      raw_report: String(text).slice(0, 50000),
      ai_analysis: analysis,
      lethal_probability: analysis.lethal_probability,
      chart_series: analysis.chart_series || [],
    }).catch(() => {});

    realtime.broadcast('TOXICOLOGY_UPDATE', { caseId, lethal_probability: analysis.lethal_probability });
    realtime.broadcast('DASHBOARD_REFRESH', { source: 'toxicology' });

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeToxicology };
