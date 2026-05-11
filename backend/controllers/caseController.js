/**
 * controllers/caseController.js
 */

const db = require('../services/supabaseService');
const { asyncHandler, sendSuccess, sendError } = require('../utils/helpers');
const { getPagination } = require('../utils/helpers');

const getCases = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status } = req.query;
  let data = [];
  let count = 0;
  try {
    const resDb = await db.getCasesPaginated({ limit, offset, status });
    data = resDb.data;
    count = resDb.count;
  } catch (e) {}

  res.setHeader('X-Total-Count', count || 0);
  res.setHeader('X-Page', page);
  sendSuccess(res, data || []);
});

const getCaseById = asyncHandler(async (req, res) => {
  const caseData = await db.getCaseById(req.params.id);
  if (!caseData) return sendError(res, 'Case not found.', 404, 'NOT_FOUND');
  sendSuccess(res, caseData);
});

const createCase = asyncHandler(async (req, res) => {
  const { title, description, status, priority, tags } = req.body;
  if (!title) return sendError(res, 'Title is required.', 400, 'MISSING_FIELDS');
  const newCase = await db.createCase({
    title,
    description,
    status: status || 'active',
    priority: priority || 'medium',
    tags: tags || [],
    created_by: req.user?.id || 'hackathon-user-001',
  });
  sendSuccess(res, newCase, 201);
});

const updateCase = asyncHandler(async (req, res) => {
  const updated = await db.updateCase(req.params.id, req.body);
  if (!updated) return sendError(res, 'Case not found.', 404, 'NOT_FOUND');
  sendSuccess(res, updated);
});

const deleteCase = asyncHandler(async (req, res) => {
  await db.deleteCase(req.params.id);
  sendSuccess(res, { message: 'Case deleted.' });
});

module.exports = { getCases, getCaseById, createCase, updateCase, deleteCase };
