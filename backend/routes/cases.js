/**
 * routes/cases.js
 */

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');

const router = Router();

router.use(requireAuth);

router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router;
